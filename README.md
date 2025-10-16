# Equivida Static Site (AWS S3 + CloudFront)

Modern, accessible, SEO-optimized static site for `equivida.services` deployed on a low-cost, secure AWS static stack.

## Architecture
- S3 (private) origin, public access blocked
- CloudFront (PriceClass_100), OAC to S3, default TLS cert (no custom domain yet)
- Security headers via CloudFront Response Headers Policy (HSTS, CSP, etc.)
- S3 versioning + lifecycle for old versions
- CloudWatch alarm for 4xx > 5%

## Deployment
1) Terraform remote state already bootstrapped (S3 + DynamoDB).
2) Core infra applied without custom domain/ACM/DNS/logging.
3) Upload site and invalidate cache:
```bash
aws s3 sync . s3://equivida-prod-site --delete --exclude "infrastructure/*" --exclude ".github/*" --exclude ".git/*"
aws cloudfront create-invalidation --distribution-id E22V9471PPX5H5 --paths "/*"
```
4) Preview URL:
- https://d1wc9qwfa4ssca.cloudfront.net

## Enabling Custom Domain later (optional)
- In `infrastructure/variables.tf`: set
  - `enable_custom_domain=true`, `enable_acm=true`
  - `enable_dns_records=true` (after Route53 zone exists or create via TF)
- Apply Terraform; validate ACM via DNS; switch nameservers from Squarespace to Route53 when ready.

## Security & Best Practices
- Principle of least privilege; OAC-only S3 access
- TLS >= 1.2, HSTS preload-ready; strict CSP (self)
- No public S3 access; server-side encryption (SSE-S3)
- Minimal ops; everything IaC; tagging applied (`Project=Equivida`, `Environment=prod`, `ManagedBy=Terraform`, `Owner=ronald`, `Confidentiality=Public`)

## Cost Expectations (approx, low traffic)
- CloudFront: ~$0–$2/mo depending on egress (e.g., $0.085/GB + request fees)
- S3 storage/requests: ~$0.01–$0.10/mo (tiny site)
- CloudWatch alarm: ~$0.10/mo
- Route53 hosted zone (if kept): ~$0.50/mo
- Total without Route53: typically <$1/mo at low traffic; with Route53: ~+$0.50/mo

## CI/CD (optional)
- `.github/workflows/deploy.yml` syncs to S3 and invalidates CloudFront using an AWS role.
- Required repo secrets when IAM OIDC role is created:
  - `AWS_ROLE_TO_ASSUME`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`

## Rollback
- Restore prior S3 object versions (versioning enabled).
