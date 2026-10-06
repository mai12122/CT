# ==============================================================================
# COMPUTE & LOAD BALANCING MODULE: ALB + Auto Scaling Group
# Fulfills Rule R1 (Ticket sales), R2 (Pre-warming), R6 (High Availability)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Application Load Balancer & Target Group
# ------------------------------------------------------------------------------
resource "aws_lb" "alb" {
  name               = "bassac-live-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1a.id, aws_subnet.public_1b.id]

  enable_deletion_protection = true

  tags = {
    Name = "bassac-live-alb"
  }
}

resource "aws_lb_target_group" "tg" {
  name     = "bassac-live-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/api/v1/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "bassac-live-tg"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = var.acm_certificate_arn != "" ? "redirect" : "forward"

    # Forward to target group when no HTTPS certificate is available
    dynamic "forward" {
      for_each = var.acm_certificate_arn == "" ? [1] : []
      content {
        target_group {
          arn = aws_lb_target_group.tg.arn
        }
      }
    }

    # Redirect to HTTPS when certificate is available
    dynamic "redirect" {
      for_each = var.acm_certificate_arn != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

# HTTPS Listener (only created when an ACM certificate ARN is provided)
resource "aws_lb_listener" "https" {
  count = var.acm_certificate_arn != "" ? 1 : 0

  load_balancer_arn = aws_lb.alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

# ------------------------------------------------------------------------------
# 2. EC2 Launch Template (Immutable Infrastructure)
# ------------------------------------------------------------------------------
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_launch_template" "app_lt" {
  name_prefix   = "bassac-app-lt-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.app_profile.name
  }

  vpc_security_group_ids = [aws_security_group.app.id]

  # Enforce IMDSv2 (Mitigates SSRF credential theft)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      encrypted             = true
      delete_on_termination = true
    }
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    cat << 'PYEOF' > /opt/server.py
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import json

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            if self.path == '/api/v1/health':
                response = {"status": "HEALTHY"}
            else:
                response = {"message": "Bassac Live Ticketing Engine Active", "status": "HEALTHY"}
            self.wfile.write(json.dumps(response).encode('utf-8'))

        def log_message(self, format, *args):
            return

    httpd = HTTPServer(('0.0.0.0', 8000), Handler)
    httpd.serve_forever()
    PYEOF
    python3 /opt/server.py &
  EOF
  )

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "bassac-app-lt"
  }
}

# ------------------------------------------------------------------------------
# 3. Auto Scaling Group (Dual-AZ Compute Fleet)
# ------------------------------------------------------------------------------
resource "aws_autoscaling_group" "asg" {
  name_prefix         = "bassac-live-asg-"
  vpc_zone_identifier = [aws_subnet.app_1a.id, aws_subnet.app_1b.id]

  min_size         = 2
  desired_capacity = 2
  max_size         = 8

  target_group_arns = [aws_lb_target_group.tg.arn]

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }

  health_check_type         = "ELB"
  health_check_grace_period = 120

  tag {
    key                 = "Name"
    value               = "bassac-app-node"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ------------------------------------------------------------------------------
# 4. Dynamic Target Tracking Scaling Policy
# ------------------------------------------------------------------------------
resource "aws_autoscaling_policy" "target_tracking" {
  name                   = "bassac-target-tracking-400req"
  autoscaling_group_name = aws_autoscaling_group.asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.alb.arn_suffix}/${aws_lb_target_group.tg.arn_suffix}"
    }
    target_value = 400.0
  }
}

# ------------------------------------------------------------------------------
# 5. Scheduled Pre-warming Action (Rule R2: 08:50 AM Daily Pre-Warm)
# ------------------------------------------------------------------------------
resource "aws_autoscaling_schedule" "pre_warm_0850" {
  scheduled_action_name  = "PreWarm-0850-RushCapacity"
  autoscaling_group_name = aws_autoscaling_group.asg.name

  min_size         = 2
  desired_capacity = 6
  max_size         = 8
  recurrence       = "50 8 * * *" # Every day at 08:50 AM UTC

  time_zone = "Etc/UTC"
}

# Scale back down after rush (10:00 AM UTC - 1 hour after ticket drop)
resource "aws_autoscaling_schedule" "scale_down_1000" {
  scheduled_action_name  = "ScaleDown-1000-PostRush"
  autoscaling_group_name = aws_autoscaling_group.asg.name

  min_size         = 2
  desired_capacity = 2
  max_size         = 8
  recurrence       = "0 10 * * *" # Every day at 10:00 AM UTC

  time_zone = "Etc/UTC"
}
