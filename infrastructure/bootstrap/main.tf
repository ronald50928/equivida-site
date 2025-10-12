terraform {
	required_version = ">= 1.5.0"
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
	}
}

provider "aws" {
	region = var.region
}

variable "region" {
	type    = string
	default = "us-east-1"
}

variable "project" {
	type    = string
	default = "equivida"
}

variable "environment" {
	type    = string
	default = "prod"
}

variable "tags" {
	type = map(string)
	default = {
		Project     = "Equivida"
		Environment = "prod"
		ManagedBy   = "Terraform"
	}
}

locals {
	name_prefix = "${var.project}-${var.environment}"
}

resource "aws_s3_bucket" "tfstate" {
	bucket = "${local.name_prefix}-tfstate"
	tags   = var.tags
}

resource "aws_s3_bucket_versioning" "tfstate" {
	bucket = aws_s3_bucket.tfstate.id
	versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
	bucket = aws_s3_bucket.tfstate.id
	rule {
		apply_server_side_encryption_by_default {
			sse_algorithm = "AES256"
		}
	}
}

resource "aws_dynamodb_table" "locks" {
	name         = "${local.name_prefix}-tf-locks"
	billing_mode = "PAY_PER_REQUEST"
	hash_key     = "LockID"
	attribute {
		name = "LockID"
		type = "S"
	}
	tags = var.tags
}

output "tfstate_bucket" { value = aws_s3_bucket.tfstate.bucket }
output "lock_table" { value = aws_dynamodb_table.locks.name }


