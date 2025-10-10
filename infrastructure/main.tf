locals {
	name_prefix = "${var.project}-${var.environment}"
	bucket_name = coalesce(var.bucket_name, "${local.name_prefix}-site")
}

# S3 bucket for static site (private, OAC only)
resource "aws_s3_bucket" "site" {
	bucket        = local.bucket_name
	force_destroy = false
	tags          = var.tags
}

resource "aws_s3_bucket_versioning" "site" {
	bucket = aws_s3_bucket.site.id
	versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_public_access_block" "site" {
	bucket                  = aws_s3_bucket.site.id
	block_public_acls       = true
	block_public_policy     = true
	ignore_public_acls      = true
	restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
	bucket = aws_s3_bucket.site.id
	rule {
		apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
	}
}

resource "aws_s3_bucket_lifecycle_configuration" "site" {
	bucket = aws_s3_bucket.site.id
	rule {
		id     = "expire-old-versions"
		status = "Enabled"
		noncurrent_version_expiration { noncurrent_days = 30 }
	}
}

# Logging bucket (optional shared); create project-scoped to avoid touching others
resource "aws_s3_bucket" "logs" {
	bucket        = "${local.name_prefix}-logs"
	force_destroy = false
	tags          = var.tags
}

resource "aws_s3_bucket_public_access_block" "logs" {
	bucket                  = aws_s3_bucket.logs.id
	block_public_acls       = true
	block_public_policy     = true
	ignore_public_acls      = true
	restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
	bucket = aws_s3_bucket.logs.id
	rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}

resource "aws_s3_bucket_logging" "site" {
	bucket = aws_s3_bucket.site.id
	logging_configuration {
		destination_bucket_name = aws_s3_bucket.logs.id
		destination_prefix      = "s3/"
	}
}

# CloudFront OAC
resource "aws_cloudfront_origin_access_control" "oac" {
	name                              = "${local.name_prefix}-oac"
	origin_access_control_origin_type  = "s3"
	signing_behavior                   = "always"
	signing_protocol                   = "sigv4"
}

# Response headers policy with security headers
resource "aws_cloudfront_response_headers_policy" "security" {
	name = "${local.name_prefix}-security-headers"
	security_headers_config {
		content_security_policy {
			content_security_policy = "default-src 'self'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
			override                 = true
		}
		content_type_options { override = true }
		frame_options { frame_option = "DENY" override = true }
		referrer_policy { referrer_policy = "same-origin" override = true }
		strict_transport_security {
			access_control_max_age_sec = 63072000
			include_subdomains          = true
			preload                     = true
			override                    = true
		}
		xss_protection { protection = true mode_block = true override = true }
	}
}

# ACM certificate in us-east-1 for CloudFront
resource "aws_acm_certificate" "cert" {
	provider          = aws.us_east_1
	domain_name       = var.domain_name
	validation_method = "DNS"
	subject_alternative_names = ["www.${var.domain_name}"]
	tags = var.tags
}

# Route53 hosted zone (reuse if exists by name lookup)
data "aws_route53_zone" "primary" {
	name         = "${var.domain_name}."
	private_zone = false
}

resource "aws_route53_record" "cert_validation" {
	for_each = {
		for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
			name   = dvo.resource_record_name
			type   = dvo.resource_record_type
			value  = dvo.resource_record_value
		}
	}
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = each.value.name
	type    = each.value.type
	records = [each.value.value]
	ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
	provider                = aws.us_east_1
	certificate_arn         = aws_acm_certificate.cert.arn
	validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# S3 origin access policy via CloudFront OAC is implicit; we grant CF access by policy
data "aws_iam_policy_document" "site_policy" {
	statement {
		actions   = ["s3:GetObject"]
		resources = ["${aws_s3_bucket.site.arn}/*"]
		principals {
			type        = "Service"
			identifiers = ["cloudfront.amazonaws.com"]
		}
		condition {
			test     = "StringEquals"
			variable = "AWS:SourceArn"
			values   = [aws_cloudfront_distribution.site.arn]
		}
	}
}

resource "aws_s3_bucket_policy" "site" {
	bucket = aws_s3_bucket.site.id
	policy = data.aws_iam_policy_document.site_policy.json
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "site" {
	origin {
		domain_name = aws_s3_bucket.site.bucket_regional_domain_name
		origin_id   = "s3-origin"
		origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
	}

	enabled             = true
	is_ipv6_enabled     = true
	price_class         = "PriceClass_100"
	default_root_object = "index.html"

	aliases = [var.domain_name, "www.${var.domain_name}", "preview.${var.domain_name}"]

	default_cache_behavior {
		target_origin_id       = "s3-origin"
		viewer_protocol_policy = "redirect-to-https"
		allowed_methods        = ["GET", "HEAD"]
		cached_methods         = ["GET", "HEAD"]
		compress               = true
		response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
		min_ttl                = 0
		default_ttl            = 3600
		max_ttl                = 86400
		forwarded_values { query_string = false cookies { forward = "none" } }
	}

	# Friendly error pages
	custom_error_response {
		error_code            = 404
		response_code         = 404
		response_page_path    = "/404.html"
		error_caching_min_ttl = 0
	}
	custom_error_response {
		error_code            = 403
		response_code         = 404
		response_page_path    = "/404.html"
		error_caching_min_ttl = 0
	}

	restrictions { geo_restriction { restriction_type = "none" } }

	viewer_certificate {
		acm_certificate_arn            = aws_acm_certificate_validation.cert.certificate_arn
		minimum_protocol_version       = "TLSv1.2_2021"
		ssl_support_method             = "sni-only"
	}

	logging_config {
		bucket = aws_s3_bucket.logs.bucket_domain_name
		include_cookies = false
		prefix = "cloudfront/"
	}

	tags = var.tags
}

# DNS records for root, www, and preview
resource "aws_route53_record" "root_alias" {
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = var.domain_name
	type    = "A"
	alias { name = aws_cloudfront_distribution.site.domain_name zone_id = aws_cloudfront_distribution.site.hosted_zone_id evaluate_target_health = false }
}

resource "aws_route53_record" "root_alias_aaaa" {
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = var.domain_name
	type    = "AAAA"
	alias { name = aws_cloudfront_distribution.site.domain_name zone_id = aws_cloudfront_distribution.site.hosted_zone_id evaluate_target_health = false }
}

resource "aws_route53_record" "www_alias" {
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = "www.${var.domain_name}"
	type    = "A"
	alias { name = aws_cloudfront_distribution.site.domain_name zone_id = aws_cloudfront_distribution.site.hosted_zone_id evaluate_target_health = false }
}

resource "aws_route53_record" "www_alias_aaaa" {
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = "www.${var.domain_name}"
	type    = "AAAA"
	alias { name = aws_cloudfront_distribution.site.domain_name zone_id = aws_cloudfront_distribution.site.hosted_zone_id evaluate_target_health = false }
}

resource "aws_route53_record" "preview_alias" {
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = "preview.${var.domain_name}"
	type    = "A"
	alias { name = aws_cloudfront_distribution.site.domain_name zone_id = aws_cloudfront_distribution.site.hosted_zone_id evaluate_target_health = false }
}

resource "aws_route53_record" "preview_alias_aaaa" {
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = "preview.${var.domain_name}"
	type    = "AAAA"
	alias { name = aws_cloudfront_distribution.site.domain_name zone_id = aws_cloudfront_distribution.site.hosted_zone_id evaluate_target_health = false }
}

# CloudWatch alarm for 4xx
resource "aws_cloudwatch_metric_alarm" "cf_4xx" {
	alarm_name          = "${local.name_prefix}-cf-4xx"
	comparison_operator = "GreaterThanThreshold"
	evaluation_periods  = 1
	metric_name         = "4xxErrorRate"
	namespace           = "AWS/CloudFront"
	period              = 300
	statistic           = "Average"
	threshold           = 5
	dimensions = { DistributionId = aws_cloudfront_distribution.site.id, Region = "Global" }
	alarm_description   = "4xx error rate exceeds 5% over 5 minutes"
}


