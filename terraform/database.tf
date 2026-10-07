# ==============================================================================
# DATABASE MODULE: PostgreSQL Multi-AZ Deployment
# Fulfills Rule S1 (Zero Public Exposure), S3 (KMS CMK), S4 (Strict App SG Access), R6 (Multi-AZ)
# ==============================================================================

resource "aws_db_subnet_group" "db_subnets" {
  name        = "ct-live-db-subnet-group"
  description = "Isolated database subnets spanning AZ-a and AZ-b"
  subnet_ids  = [aws_subnet.db_1a.id, aws_subnet.db_1b.id]

  tags = {
    Name = "ct-live-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier            = "ct-live-db"
  engine                = "postgres"
  engine_version        = "16"
  instance_class        = "db.t4g.micro"
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"

  db_name  = "bassac_live_db"
  username = var.db_username
  password = var.db_password
  port     = 5432

  # High Availability & Failover (Rule R6: If one database node fails, standby takes over)
  multi_az = true

  # Rule S1: Physical Isolation from Public Internet
  publicly_accessible  = false
  db_subnet_group_name = aws_db_subnet_group.db_subnets.name

  # Rule S4: Chained Security Group (Port 5432 only from App SG)
  vpc_security_group_ids = [aws_security_group.db.id]

  # Rule S3: Encryption at Rest via Customer Managed Key
  storage_encrypted = true
  kms_key_id        = aws_kms_key.bassac_cmk.arn

  # Operational Safeguards
  skip_final_snapshot       = false
  final_snapshot_identifier = "ct-live-db-final-snapshot"
  backup_retention_period   = 7
  deletion_protection       = true

  tags = {
    Name = "ct-live-db"
    Rule = "S1-S4-ACID-MultiAZ"
  }
}
