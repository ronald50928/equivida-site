# Quality Checks & CI/CD Pipeline

## 🔍 Automated Quality Checks

Your deployment pipeline now includes automated quality checks that run **before** deploying to production.

### What Runs Automatically

When you push to `main` or merge a PR:

```
PUSH TO MAIN
    ↓
GitHub Actions Triggered
    ↓
┌─────────────────────────────┐
│ JOB 1: VALIDATE (must pass) │
├─────────────────────────────┤
│ • HTML Quality Scanner      │
│   - Nested tags check       │
│   - Malformed meta tags     │
│   - Stray text before DOCTYPE
│   - Orphaned closing tags   │
│   - Duplicate descriptions  │
└─────────────────────────────┘
    ↓ (only if validation passes)
┌─────────────────────────────┐
│ JOB 2: DEPLOY (only runs if │
│        validation succeeds)  │
├─────────────────────────────┤
│ • Sync to S3                │
│ • Set cache headers         │
│ • Invalidate CloudFront     │
└─────────────────────────────┘
    ↓
LIVE UPDATE 🚀
```

## 📋 How to Use

### Option 1: Trust CI/CD (Recommended)
Just commit and push - GitHub Actions handles everything:

```bash
git add .
git commit -m "Update copy"
git push origin main
```

GitHub will validate and deploy automatically! ✅

### Option 2: Validate Before Pushing
Check locally first:

```bash
bash scripts/scan-html-issues.sh
```

If all checks pass → push with confidence:

```bash
git push origin main
```

### Option 3: Manual Deployment (Not Recommended)
If you need to deploy locally:

```bash
# 1. Validate first (optional but recommended)
bash scripts/scan-html-issues.sh

# 2. Deploy
bash scripts/deploy.sh
```

## ✅ Success Indicators

### GitHub Actions Passed ✅
Green checkmarks on your pull request = deployment succeeded

### Scanner Output
```
✅ No HTML issues found! All files look clean.
```

## ⚠️ Failure Indicators

If GitHub Actions fails:

1. **Validation Failed** - HTML quality issues found
   - Check the error message for specific file/issue
   - Fix the HTML locally
   - Commit and push again

2. **Deployment Failed** - AWS credentials or S3 sync issue
   - Check GitHub Actions logs for details
   - Verify AWS secrets are configured correctly

## 📚 More Info

For detailed documentation about the quality checks:

```bash
cat docs/QUALITY_ASSURANCE.md
```

## 🎯 Benefits

- ✅ Catches HTML corruption **before** going live
- ✅ Prevents malformed meta tags from being deployed
- ✅ Automated = no manual step required
- ✅ Fast = < 1 second validation
- ✅ Safe = bad code never reaches S3
