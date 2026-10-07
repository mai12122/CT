# ==============================================================================
# STORAGE & CDN MODULE: S3 Private Bucket + CloudFront OAC
# Fulfills Rule S2 (Zero Public Access) & Rule R3 (High-Speed Edge Delivery)
# ==============================================================================

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# ------------------------------------------------------------------------------
# 1. Private S3 Bucket with KMS Encryption
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "assets" {
  bucket        = "ct-live-assets-prod-${random_id.bucket_suffix.hex}"
  force_destroy = false

  tags = {
    Name = "ct-live-assets-prod"
  }
}

# Rule S3: Server-Side Encryption with Customer Managed Key
resource "aws_s3_bucket_server_side_encryption_configuration" "assets_crypto" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.bassac_cmk.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# Enable versioning for accidental deletion recovery
resource "aws_s3_bucket_versioning" "assets_versioning" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Rule S2: Block ALL Public Access (All 4 flags strictly true)
resource "aws_s3_bucket_public_access_block" "assets_block" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# 2. CloudFront Origin Access Control (OAC)
# ------------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "ct-s3-oac"
  description                       = "OAC for Bassac Live concert posters and seat maps"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ------------------------------------------------------------------------------
# 3. CloudFront Distribution (Rule R3: Low Latency Edge Delivery)
# ------------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Bassac Live Global CDN for media assets"
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "S3-BassacLive-Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-BassacLive-Origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "ct-live-cdn"
    Rule = "R3-FastPostersAndSeatmaps"
  }
}

# ------------------------------------------------------------------------------
# 4. S3 Bucket Policy (Restricts Read Access strictly to CloudFront OAC)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket_policy" "oac_policy" {
  bucket = aws_s3_bucket.assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOACReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.assets.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.cdn.arn
          }
        }
      },
      {
        Sid       = "DenyUnencryptedInTransit"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.assets.arn,
          "${aws_s3_bucket.assets.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.assets_block]
}
