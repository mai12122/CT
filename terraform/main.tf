terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CTLive-Ticketing"
      Environment = var.environment
      Client      = "CTLive"
      ManagedBy   = "Terraform"
      Owner       = "Ratana-Operations"
    }
  }
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "Public entry point for ticket purchasing"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain_name" {
  description = "Fast CDN distribution for posters and seatmaps (R3)"
  value       = aws_cloudfront_distribution.media_cdn.domain_name
}

output "s3_bucket_name" {
  description = "Private S3 bucket for posters & seatmaps (S2, S3)"
  value       = aws_s3_bucket.media.bucket
}

output "rds_endpoint" {
  description = "Isolated database endpoint for orders & tickets (S1, S4)"
  value       = aws_db_instance.postgres.endpoint
}

output "sns_alert_topic_arn" {
  description = "Topic ARN sending immediate failure notifications to Mr. Ratana (R5)"
  value       = aws_sns_topic.incident_alerts.arn
}
