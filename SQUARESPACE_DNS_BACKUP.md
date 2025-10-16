# Squarespace DNS Configuration Backup
**Date:** October 16, 2025  
**Domain:** equivida.services

## Google Workspace Email Records (CRITICAL - MUST MIGRATE)

### MX Records
```
HOST: @
TYPE: MX
PRIORITY: 1
TTL: 4 hrs
DATA: aspmx.l.google.com

HOST: @
TYPE: MX
PRIORITY: 5
TTL: 4 hrs
DATA: alt1.aspmx.l.google.com

HOST: @
TYPE: MX
PRIORITY: 5
TTL: 4 hrs
DATA: alt2.aspmx.l.google.com

HOST: @
TYPE: MX
PRIORITY: 10
TTL: 4 hrs
DATA: alt3.aspmx.l.google.com

HOST: @
TYPE: MX
PRIORITY: 10
TTL: 4 hrs
DATA: alt4.aspmx.l.google.com
```

### TXT Records (Email)
```
HOST: @
TYPE: TXT
TTL: 4 hrs
DATA: v=spf1 include:_spf.google.com ~all

HOST: google._domainkey
TYPE: TXT
TTL: 4 hrs
DATA: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhtUnxdkx1R7ZzbSpB+NNmRHkQmYh1KYtOr4zEBqD15jRoNgdE1R5RgETKzoaeFh4O0RBUQP514hvJSKX7ZA9iH7NQeaYlD9cVhDKO9AThsU9C6kRnUVHMg9lv+X8IunzR30zpZ+9KqqP89Mz3f54UvhGJuWzrnjzm8SFuVezC5UlJmUjmzPy5mmuqBFFu1v4BiQDOxJY4vynLzAMrq2tFWDTiIGT2HEXEjdYncUXJ0xU/aHjYTcouj0tV//7kcAa35Oog73zSh+kKceBeyJUB6YzJb62Erm7jbW0ccu4GANosqeKV4jdPHoZAPJEahiQkpBUZ2iOUrdjQPTLg46EbQIDAQAB
```

### Google Workspace Verification
```
HOST: 7c56hkhbng4o
TYPE: CNAME
TTL: 4 hrs
DATA: gv-bl2lk273dx2wpd.dv.googlehosted.com

HOST: ds3juohtph2e
TYPE: CNAME
TTL: 4 hrs
DATA: gv-qunlncvbvndbwv.dv.googlehosted.com
```

## CloudFront/AWS Records

### Website Records
```
HOST: www
TYPE: CNAME
TTL: 5 mins
DATA: d1wc9qwfa4ssca.cloudfront.net

HOST: _165d474ee32fd8e3c7130a770d8dcf2d.www
TYPE: CNAME
TTL: 5 mins
DATA: _d3e89602dc541c6c3b12ad4eea467749.xlfgrmvvlj.acm-validations.aws
```

## Squarespace System Records

```
HOST: _domainconnect
TYPE: CNAME
TTL: 4 hrs
DATA: _domainconnect.domains.squarespace.com
```

## Current Issues
- Apex domain (@) points to Squarespace A records
- Domain forwarding creates redirect loops
- Cannot add CNAME to apex due to MX records conflict

## Migration Plan
- Move DNS to Route 53
- Use ALIAS records for apex domain
- Keep all Google Workspace records
- Point both @ and www to CloudFront
