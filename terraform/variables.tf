variable "aws_region" {
  description = "AWS deployment region closest to Phnom Penh, Cambodia"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "PostgreSQL administrator username"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_username) >= 3
    error_message = "Database username must be at least 3 characters."
  }
}

variable "db_password" {
  description = "PostgreSQL administrator password (Rule S3 & S4)"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 12
    error_message = "Database password must be at least 12 characters for production security."
  }
}

variable "alert_email" {
  description = "Operations manager email address for urgent site alerts (Rule R5)"
  type        = string
  default     = "ratana@bassaclive.com"
}

variable "acm_certificate_arn" {
  description = "ARN of an ACM certificate for HTTPS on the ALB (optional: if not set, only HTTP listener is created)"
  type        = string
  default     = ""
}
