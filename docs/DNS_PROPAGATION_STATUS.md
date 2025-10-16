# DNS Propagation Status

**Date:** October 16, 2025  
**Action:** Nameservers updated from Google Domains to Route 53  
**Status:** ⏰ Waiting for propagation

---

## ✅ What Was Updated

### Nameservers Changed:
**FROM (Google Domains):**
```
ns-cloud-c1.googledomains.com
ns-cloud-c2.googledomains.com
ns-cloud-c3.googledomains.com
ns-cloud-c4.googledomains.com
```

**TO (Route 53):**
```
ns-1443.awsdns-52.org
ns-599.awsdns-10.net
ns-346.awsdns-43.com
ns-1835.awsdns-37.co.uk
```

### Other Changes:
- ✅ Domain Forwarding deleted
- ✅ DNSSEC disabled

---

## ⏰ Propagation Timeline

- **Typical time:** 1-24 hours
- **Maximum time:** 48 hours
- **Started:** October 16, 2025

---

## 🧪 How to Check Propagation Status

### Online Tools:
- **Nameservers:** https://dnschecker.org/#NS/equivida.services
- **A Records:** https://dnschecker.org/#A/equivida.services
- **Complete check:** https://www.whatsmydns.net/#NS/equivida.services

### Command Line:
```bash
# Check nameservers
dig equivida.services NS +short

# Check apex domain
dig equivida.services A +short

# Check www subdomain
dig www.equivida.services A +short

# Check MX records (email)
dig equivida.services MX +short
```

---

## ✅ Success Indicators

Once propagation is complete, you should see:

### Nameservers:
```
ns-1443.awsdns-52.org
ns-599.awsdns-10.net
ns-346.awsdns-43.com
ns-1835.awsdns-37.co.uk
```

### Apex Domain (equivida.services):
- Should resolve to CloudFront IPs (13.33.x.x range)
- NOT Squarespace IPs (198.x.x.x)

### WWW Subdomain:
- Should resolve to CloudFront IPs (13.33.x.x range)

### Website:
- ✅ https://equivida.services → loads correctly
- ✅ https://www.equivida.services → loads correctly
- ✅ No redirect loops
- ✅ Valid SSL certificate

### Email:
- ✅ MX records point to Google Workspace
- ✅ Email continues to work normally

---

## 🚨 If Something Goes Wrong

### Website doesn't load:
1. Check nameservers propagated: `dig equivida.services NS +short`
2. Check A records: `dig equivida.services A +short`
3. Clear browser cache / try incognito mode
4. Wait longer (up to 48 hours)

### Email stops working:
1. Check MX records: `dig equivida.services MX +short`
2. Should show Google mail servers (aspmx.l.google.com, etc.)
3. If missing, verify Route 53 has MX records in hosted zone

### Redirect loops:
1. Verify Domain Forwarding is deleted in Squarespace
2. Check CloudFront configuration
3. Clear browser cache

---

## 📞 Support Resources

- **Route 53 Console:** https://console.aws.amazon.com/route53/
- **Hosted Zone ID:** Z077438739O247E4Y8CDR
- **DNS Checker:** https://dnschecker.org/
- **CloudFront Distribution:** E22V9471PPX5H5

---

## 📋 Testing Checklist (After Propagation)

- [ ] Nameservers show Route 53
- [ ] `equivida.services` resolves to CloudFront
- [ ] `www.equivida.services` resolves to CloudFront
- [ ] HTTPS works on both domains
- [ ] SSL certificate is valid
- [ ] No redirect loops
- [ ] Email sending works
- [ ] Email receiving works
- [ ] All pages load correctly
- [ ] Theme switching works
- [ ] Contact form works

---

**Next check:** Tomorrow (October 17, 2025)

