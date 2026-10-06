output "vpc_id" {
  description = "ID of the Bassac Live VPC"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.alb.dns_name
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront CDN distribution"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "s3_bucket_name" {
  description = "Name of the private S3 assets bucket"
  value       = aws_s3_bucket.assets.id
}

output "rds_endpoint" {
  description = "PostgreSQL primary database endpoint (Private VPC only)"
  value       = aws_db_instance.postgres.endpoint
}

output "kms_key_arn" {
  description = "ARN of the Customer Managed KMS Key (Rule S3)"
  value       = aws_kms_key.bassac_cmk.arn
}

output "sns_topic_arn" {
  description = "ARN of the urgent escalation SNS topic"
  value       = aws_sns_topic.urgent_alerts.arn
}
