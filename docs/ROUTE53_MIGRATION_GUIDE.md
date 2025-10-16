# Route 53 Migration Complete ✅

**Date:** October 16, 2025  
**Hosted Zone ID:** Z077438739O247E4Y8CDR

---

## 🎯 What Was Configured

### ✅ Google Workspace Email (Protected)
- **5 MX Records** → Gmail mail servers
- **SPF TXT Record** → Email authentication
- **DKIM TXT Record** → Email signing
- **2 Verification CNAMEs** → Domain verification

### ✅ CloudFront Website
- **Apex ALIAS** (equivida.services) → CloudFront
- **WWW ALIAS** (www.equivida.services) → CloudFront
- **ACM Validation CNAME** → SSL certificate

---

## 📋 CRITICAL NEXT STEP: Update Nameservers in Squarespace

### Route 53 Nameservers (Copy These!)
```
ns-1443.awsdns-52.org
ns-599.awsdns-10.net
ns-346.awsdns-43.com
ns-1835.awsdns-37.co.uk
```

### How to Update Squarespace:

1. **Log in to Squarespace** (domains.squarespace.com)

2. **Go to:** Settings → Domains → equivida.services → DNS Settings

3. **Find:** "Nameservers" section

4. **Select:** "Use custom nameservers"

5. **Paste these 4 nameservers:**
   ```
   ns-1443.awsdns-52.org
   ns-599.awsdns-10.net
   ns-346.awsdns-43.com
   ns-1835.awsdns-37.co.uk
   ```

6. **Save changes**

---

## ⏰ DNS Propagation

- **Typical time:** 1-24 hours
- **Max time:** 48 hours
- **Check status:** https://dnschecker.org/#NS/equivida.services

---

## ✅ Complete Route 53 Record Summary

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A (ALIAS) | equivida.services | d1wc9qwfa4ssca.cloudfront.net | Website (apex) |
| A (ALIAS) | www.equivida.services | d1wc9qwfa4ssca.cloudfront.net | Website (www) |
| MX | equivida.services | aspmx.l.google.com (+ 4 others) | Google Workspace Email |
| TXT | equivida.services | v=spf1 include:_spf.google.com ~all | Email SPF |
| TXT | google._domainkey.equivida.services | v=DKIM1; k=rsa; p=... | Email DKIM |
| CNAME | 7c56hkhbng4o.equivida.services | gv-bl2lk273dx2wpd.dv.googlehosted.com | Google Verification |
| CNAME | ds3juohtph2e.equivida.services | gv-qunlncvbvndbwv.dv.googlehosted.com | Google Verification |
| CNAME | _165d474ee32fd8e3c7130a770d8dcf2d.www.equivida.services | _d3e89602dc541c6c3b12ad4eea467749.xlfgrmvvlj.acm-validations.aws | SSL Certificate |

---

## 🧪 Testing After Propagation

### Test Website:
```bash
# Check DNS resolution
dig equivida.services
dig www.equivida.services

# Test in browser
curl -I https://equivida.services
curl -I https://www.equivida.services
```

### Test Email:
```bash
# Check MX records
dig equivida.services MX

# Send test email to yourself
# Should arrive normally in Gmail
```

---

## 💰 Route 53 Costs

- **Hosted Zone:** $0.50/month
- **Queries:** First 1 billion free, then $0.40 per million
- **Estimated total:** ~$0.50-0.60/month

---

## 🔐 What This Solves

✅ **No more redirect loops** (eliminated Squarespace forwarding)  
✅ **Apex domain works** (ALIAS records support)  
✅ **Google Workspace protected** (all MX/TXT records preserved)  
✅ **Better control** (full DNS management in AWS)  
✅ **CloudFront integration** (direct ALIAS to distribution)

---

## 📞 Support

- **AWS Route 53 Console:** https://console.aws.amazon.com/route53/
- **View Hosted Zone:** Search for `equivida.services` (ID: Z077438739O247E4Y8CDR)
- **Squarespace DNS Help:** https://support.squarespace.com/hc/en-us/articles/360002101888

---

## 🚨 IMPORTANT: What NOT to Delete in Squarespace

After updating nameservers, Squarespace will show a warning that DNS records are no longer managed there. **This is expected and correct!**

**DO NOT:**
- Delete the domain from Squarespace (you still need it registered there)
- Re-add A records in Squarespace (they won't work anymore)
- Enable domain forwarding (it conflicts with Route 53)

**Keep in Squarespace:**
- Domain registration (renewal settings)
- Domain ownership
- Billing information

**Everything else is now managed in Route 53!**

