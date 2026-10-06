# Application Load Balancer in Public Subnets
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# Target Group (HTTP Port 5000)
resource "aws_lb_target_group" "app_tg" {
  name        = "${var.project_name}-app-tg"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/api/v1/health"
    port                = "5000"
    protocol            = "HTTP"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-app-tg"
  }
}

# ALB Listener (Port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# EC2 Launch Template (IMDSv2 Enforced)
resource "aws_launch_template" "app" {
  name_prefix   = "${var.project_name}-launch-template-"
  image_id      = "ami-0c802847a7dd8484d" # Amazon Linux 2023 Graviton2 (ap-southeast-1)
  instance_type = "c6g.large"

  iam_instance_profile {
    name = aws_iam_instance_profile.app_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.app.id]
  }

  # Security Hardening: Enforce IMDSv2 (Token required to block SSRF)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo "Starting CT Live application node..."
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-app-instance"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Group (Multi-AZ in Private Application Subnets)
resource "aws_autoscaling_group" "app_asg" {
  name_prefix         = "${var.project_name}-asg-"
  vpc_zone_identifier = aws_subnet.private_app[*].id
  target_group_arns   = [aws_lb_target_group.app_tg.arn]

  min_size         = 2
  max_size         = 8
  desired_capacity = 2

  health_check_type         = "ELB"
  health_check_grace_period = 180

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Dynamic Scaling Policy: Target Tracking on Request Count
resource "aws_autoscaling_policy" "target_tracking_requests" {
  name                   = "${var.project_name}-asg-target-tracking-requests"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.main.arn_suffix}/${aws_lb_target_group.app_tg.arn_suffix}"
    }
    target_value = 1200.0
  }
}

# Scheduled Action: Pre-warm at 08:45 AM before 09:00 AM rush (R2)
resource "aws_autoscaling_schedule" "pre_warm_sale" {
  scheduled_action_name  = "pre-warm-0845-sale-rush"
  min_size               = 4
  max_size               = 8
  desired_capacity       = 4
  recurrence             = "45 8 * * *" # Every day at 08:45 AM
  time_zone              = "Asia/Phnom_Penh"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
}
