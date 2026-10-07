# ==============================================================================
# SECURITY GROUPS MODULE: 3-Tier Chained Firewalls
# Flow: Internet (80/443) -> ALB SG -> App SG (3000) -> DB SG (5432 - Rule S4)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Application Load Balancer Security Group
# ------------------------------------------------------------------------------
resource "aws_security_group" "alb" {
  name        = "ct-alb-sg"
  description = "Public ingress for ALB over HTTP and HTTPS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow inbound HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow inbound HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound to backend compute fleet and internet"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ct-alb-sg"
  }
}

# ------------------------------------------------------------------------------
# 2. Application Tier Security Group
# ------------------------------------------------------------------------------
resource "aws_security_group" "app" {
  name        = "ct-app-sg"
  description = "Allows ingress on port 3000 exclusively from ALB Security Group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow port 3000 only from ALB security group"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Outbound to RDS and NAT Gateway"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ct-app-sg"
  }
}

# ------------------------------------------------------------------------------
# 3. Database Tier Security Group (Rule S4: DB accepts traffic strictly from App)
# ------------------------------------------------------------------------------
resource "aws_security_group" "db" {
  name        = "ct-db-sg"
  description = "Enforces Rule S4: PostgreSQL access strictly from App SG"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow PostgreSQL port 5432 strictly from app servers"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "Strict local VPC egress only"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = {
    Name = "ct-db-sg"
    Rule = "S4-OnlyAppConnectsToDatabase"
  }
}
