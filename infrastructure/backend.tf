terraform {
	backend "s3" {
		bucket         = "equivida-prod-tfstate"
		key            = "website/terraform.tfstate"
		region         = "us-east-1"
		encrypt        = true
		dynamodb_table = "equivida-prod-tf-locks"
	}
}


