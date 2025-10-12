#!/usr/bin/env bash
set -euo pipefail

# Deploy Equivida static site to S3 and invalidate CloudFront
# Requirements: terraform, awscli, configured AWS credentials with access to state and target account

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Retrieving Terraform outputs..."
terraform -chdir="$ROOT_DIR/infrastructure" init -input=false -lock=false >/dev/null
BUCKET_NAME="$(terraform -chdir="$ROOT_DIR/infrastructure" output -raw bucket_name)"
DISTRIBUTION_ID="$(terraform -chdir="$ROOT_DIR/infrastructure" output -raw distribution_id)"

echo "Bucket: $BUCKET_NAME"
echo "CloudFront Distribution: $DISTRIBUTION_ID"

echo "Syncing assets (long cache)..."
aws s3 sync "$ROOT_DIR/assets/" "s3://$BUCKET_NAME/assets/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

echo "Syncing styles (short cache)..."
aws s3 sync "$ROOT_DIR/styles/" "s3://$BUCKET_NAME/styles/" \
  --delete \
  --cache-control "public, max-age=600"

echo "Syncing scripts (short cache)..."
aws s3 sync "$ROOT_DIR/scripts/" "s3://$BUCKET_NAME/scripts/" \
  --exclude "deploy.sh" \
  --delete \
  --cache-control "public, max-age=600"

echo "Syncing root HTML (no cache)..."
aws s3 cp "$ROOT_DIR/" "s3://$BUCKET_NAME/" \
  --recursive \
  --exclude "assets/*" \
  --exclude "styles/*" \
  --exclude "scripts/*" \
  --exclude "infrastructure/*" \
  --exclude ".git/*" \
  --exclude "**/*.tf" \
  --exclude "**/*.tfstate*" \
  --exclude "**/*.plan" \
  --content-type "text/html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --metadata-directive REPLACE

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" >/dev/null

echo "Deploy complete."


