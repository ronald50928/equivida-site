variable "project" { type = string, default = "equivida" }
variable "environment" { type = string, default = "prod" }
variable "region" { type = string, default = "us-east-1" }
variable "domain_name" { type = string, default = "equivida.services" }
variable "bucket_name" { type = string, default = null }
variable "tags" {
	type = map(string)
	default = {
		Project        = "Equivida"
		Environment    = "prod"
		ManagedBy      = "Terraform"
		Owner          = "ronald"
		Confidentiality = "Public"
	}
}


