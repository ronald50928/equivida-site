# HTML Quality Assurance

## Overview

This project includes automated HTML quality validation to catch common corruption issues before deployment.

## What It Checks

The HTML quality scanner (`scripts/scan-html-issues.sh`) checks for:

1. **Nested/Duplicate Tags** - Detects malformed HTML like `<title>...<title>...</title></title>`
2. **Malformed Meta Tags** - Finds duplicate or broken meta tag attributes
3. **Stray Text Before DOCTYPE** - Ensures no content appears before `<!DOCTYPE>`
4. **Orphaned Closing Tags** - Catches misplaced closing tag markers
5. **Duplicate Meta Descriptions** - Validates only one description per page

## Local Usage

Run the scanner anytime to check all HTML files:

```bash
bash scripts/scan-html-issues.sh
```

**Output:**
- ✅ If all checks pass: `No HTML issues found! All files look clean.`
- ⚠️ If issues found: Lists specific files and problems with snippets

## GitHub Actions Integration

The scanner runs automatically in two scenarios:

### 1. **Automatic on Every Push to `main`**

When you push to the `main` branch:

```
GitHub Actions Workflow:
├── validate (BEFORE deployment)
│   └── Run: scan-html-issues.sh
├── deploy (AFTER validation passes)
│   ├── Sync to S3
│   ├── Set cache headers
│   └── Invalidate CloudFront
```

### 2. **Manual Deployment**

If deploying locally via `scripts/deploy.sh`, the script handles S3 sync directly without validation.

For production safety, consider running validation first:

```bash
bash scripts/scan-html-issues.sh && bash scripts/deploy.sh
```

## Common Issues & Fixes

### Issue: Nested Title Tags
**Example:** `<title>Page • Title     <title>Page | Site</title> Extra</title>`

**Fix:** Use text editor search/replace or the scanner output to locate and clean up.

### Issue: Duplicate og:title Meta Tags
**Example:** 
```html
<meta property="og:title" content="Page Title">
<meta property="og:title" content="Page Title <meta property="og:title" content="...">
```

**Fix:** Remove duplicate lines, keep only the first valid one.

## CI/CD Failure

If deployment fails due to HTML validation:

1. **Review the error message** - Scanner shows exact file and problem
2. **Fix locally** - Edit the file to resolve the issue
3. **Run scanner locally** - Verify fix with `bash scripts/scan-html-issues.sh`
4. **Commit and push** - GitHub Actions will retry validation

## Performance

- **Execution time:** < 1 second for all HTML files
- **No external dependencies:** Uses standard Unix tools (grep, sed)
- **Non-blocking:** Warnings are reported but don't stop deployment

## Related Files

- **Workflow:** `.github/workflows/deploy.yml`
- **Scanner:** `scripts/scan-html-issues.sh`
- **Deploy Script:** `scripts/deploy.sh`
