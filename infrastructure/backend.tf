# Backend configuration placeholder; create bucket/table beforehand or via bootstrap
# Uncomment and set names after bootstrap to avoid touching unrelated infra.
# terraform {
# 	backend "s3" {
# 		bucket         = "equivida-tfstate-prod"
# 		key            = "website/terraform.tfstate"
# 		region         = "us-east-1"
# 		encrypt        = true
# 		dynamodb_table = "equivida-tf-locks"
# 	}
# }


