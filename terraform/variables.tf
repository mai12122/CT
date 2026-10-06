variable "aws_region" {
  description = "AWS deployment region closest to Phnom Penh, Cambodia"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ct-live"
}

variable "environment" {
  description = "Environment tier"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "isolated_db_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.30.0/24", "10.0.40.0/24"]
}

variable "availability_zones" {
  type    = list(string)
  default = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "manager_email" {
  description = "Email address for immediate incident notifications (R5)"
  type        = string
  default     = "ratana@ctlive.com.kh"
}
