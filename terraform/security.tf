# =========================================================================
# FIREWALL RULES (SECURITY GROUPS)
# =========================================================================

# 1. ALB Security Group
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-sg-alb"
  description = "Allows HTTP/HTTPS ingress from public internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP Public Ingress"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Public Ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-alb"
  }
}

# 2. Application EC2 Security Group
resource "aws_security_group" "app" {
  name        = "${var.project_name}-sg-app"
  description = "Allows ingress only from ALB on port 5000"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-sg-app"
  }
}

# Ingress: ALB -> App (Port 5000)
resource "aws_security_group_rule" "app_ingress_alb" {
  type                     = "ingress"
  from_port                = 5000
  to_port                  = 5000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.app.id
  description              = "Traffic strictly from ALB"
}

# Egress: ALB -> App (Port 5000)
resource "aws_security_group_rule" "alb_egress_app" {
  type                     = "egress"
  from_port                = 5000
  to_port                  = 5000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.app.id
  security_group_id        = aws_security_group.alb.id
  description              = "Forward traffic to App instances"
}

# App Egress to HTTPS (NAT Gateway for CloudWatch / SSM / S3)
resource "aws_security_group_rule" "app_egress_https" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.app.id
  description       = "Outbound HTTPS to AWS APIs via NAT"
}

# 3. Database Security Group (Security Rule S4: Only App can connect)
resource "aws_security_group" "db" {
  name        = "${var.project_name}-sg-db"
  description = "Security Rule S4: Orders DB strictly accessible by app servers"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-sg-db"
  }
}

resource "aws_security_group_rule" "db_ingress_app" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.app.id
  security_group_id        = aws_security_group.db.id
  description              = "PostgreSQL access strictly from EC2 application tier"
}

resource "aws_security_group_rule" "app_egress_db" {
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.db.id
  security_group_id        = aws_security_group.app.id
  description              = "App connectivity to PostgreSQL database"
}

# =========================================================================
# KMS CUSTOMER MANAGED KEY (Security Rule S3)
# =========================================================================

resource "aws_kms_key" "ct_cmk" {
  description             = "Customer-Managed Key for CT Live S3 & RDS Encryption (S3)"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "${var.project_name}-cmk"
  }
}

resource "aws_kms_alias" "ct_cmk_alias" {
  name          = "alias/${var.project_name}-key"
  target_key_id = aws_kms_key.ct_cmk.key_id
}

# =========================================================================
# IAM LEAST PRIVILEGE ROLE FOR EC2 APP SERVERS
# =========================================================================

resource "aws_iam_role" "app_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "app_policy" {
  name        = "${var.project_name}-ec2-least-privilege-policy"
  description = "Allows CloudWatch logging, metrics, and S3 read"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "CloudWatchMetricsAndLogs"
        Effect   = "Allow"
        Action   = [
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
      {
        Sid      = "ReadMediaAssets"
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.media.arn}/*"
      },
      {
        Sid      = "KMSDecryptMedia"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.ct_cmk.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "app_attach" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.app_policy.arn
}

resource "aws_iam_instance_profile" "app_profile" {
  name = "${var.project_name}-instance-profile"
  role = aws_iam_role.app_role.name
}
