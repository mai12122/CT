# Database Subnet Group (Using Isolated Subnets)
resource "aws_db_subnet_group" "db_subnets" {
  name        = "${var.project_name}-db-subnet-group"
  description = "Isolated subnets across Multi-AZ for PostgreSQL"
  subnet_ids  = aws_subnet.isolated_db[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# Amazon RDS PostgreSQL (ACID compliant for orders & ticket counts)
resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-orders-db"
  allocated_storage      = 100
  max_allocated_storage  = 200
  storage_type           = "gp3"
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = "db.t4g.medium"
  db_name                = "ct_ticketing"
  username               = "ct_admin"
  password               = "CTSecurePassword2026!#" # In production injected via AWS Secrets Manager
  
  # Multi-AZ enabled for R6 (Sale continues if primary dies)
  multi_az               = true
  
  # Security Rule S1: DB is physically inaccessible from public internet
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  
  # Security Rule S4: Strictly accessible by app security group
  vpc_security_group_ids = [aws_security_group.db.id]
  
  # Security Rule S3: Encrypted at rest with KMS Customer Managed Key
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.ct_cmk.arn
  
  # Backup & maintenance
  backup_retention_period = 7
  deletion_protection     = false
  skip_final_snapshot     = true

  tags = {
    Name = "${var.project_name}-rds-orders"
  }
}
