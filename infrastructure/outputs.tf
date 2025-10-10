output "bucket_name" { value = aws_s3_bucket.site.bucket }
output "bucket_arn" { value = aws_s3_bucket.site.arn }
output "bucket_url" { value = "s3://${aws_s3_bucket.site.bucket}" }
output "distribution_id" { value = aws_cloudfront_distribution.site.id }
output "distribution_domain" { value = aws_cloudfront_distribution.site.domain_name }
output "zone_id" { value = data.aws_route53_zone.primary.zone_id }


