# ==============================================================================
# KMS & IAM MODULE: Encryption at Rest (Rule S3) & Least Privilege
# ==============================================================================

data "aws_caller_identity" "current" {}

# ------------------------------------------------------------------------------
# 1. KMS Customer Managed Key (Rule S3: Customer-Controlled Encryption Key)
# ------------------------------------------------------------------------------
resource "aws_kms_key" "bassac_cmk" {
  description             = "Customer Managed Key for Bassac Live S3, RDS, and EBS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableRootPermissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowCloudWatchAndAutoScaling"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey",
          "kms:CreateGrant"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name = "ct-live-cmk"
    Rule = "S3-CompanyKeyControlled"
  }
}

resource "aws_kms_alias" "bassac_cmk_alias" {
  name          = "alias/ct-live-key"
  target_key_id = aws_kms_key.bassac_cmk.key_id
}

# ------------------------------------------------------------------------------
# 2. IAM Role & Instance Profile for EC2 Compute Fleet
# ------------------------------------------------------------------------------
resource "aws_iam_role" "app_role" {
  name = "ct-ec2-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "ct-ec2-app-role"
  }
}

# Attach AWS SSM Managed Policy (Eliminates need for open SSH port 22)
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.app_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Inline KMS Decrypt Policy for EC2
resource "aws_iam_role_policy" "kms_decrypt_policy" {
  name = "BassacKMSDecryptAccess"
  role = aws_iam_role.app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowKMSDecrypt"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.bassac_cmk.arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "app_profile" {
  name = "ct-ec2-app-profile"
  role = aws_iam_role.app_role.name
}
