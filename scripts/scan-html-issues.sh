#!/bin/bash

# HTML Quality Scanner - finds common issues in HTML files
# Usage: bash scripts/scan-html-issues.sh

echo "🔍 Scanning HTML files for common issues..."
echo ""

issues_found=0

# Check for duplicate tags (common corruption)
echo "1️⃣  Checking for duplicate/nested tags..."
for file in *.html; do
  # Check for nested title tags
  if grep -q '<title>.*<title>' "$file"; then
    echo "  ⚠️  $file: Nested <title> tags found"
    grep '<title>.*<title>' "$file" | head -1
    ((issues_found++))
  fi
  
  # Check for nested meta og:title
  if grep -q '<meta property="og:title".*<meta property="og:title"' "$file"; then
    echo "  ⚠️  $file: Nested og:title meta tags found"
    grep '<meta property="og:title".*<meta property="og:title"' "$file" | head -1
    ((issues_found++))
  fi
done

# Check for orphaned HTML tags/text before <!DOCTYPE>
echo ""
echo "2️⃣  Checking for stray text before DOCTYPE..."
for file in *.html; do
  if head -1 "$file" | grep -qv '^<!doctype'; then
    if head -1 "$file" | grep -qv '^$'; then
      echo "  ⚠️  $file: Found text before DOCTYPE"
      head -1 "$file"
      ((issues_found++))
    fi
  fi
done

# Check for unclosed tags in head
echo ""
echo "3️⃣  Checking for malformed meta tags..."
for file in *.html; do
  # Check for meta tags with unclosed or duplicate attributes
  if grep -E '<meta[^>]*<meta' "$file"; then
    echo "  ⚠️  $file: Malformed meta tags detected"
    grep -E '<meta[^>]*<meta' "$file" | head -1
    ((issues_found++))
  fi
done

# Check for stray closing tags
echo ""
echo "4️⃣  Checking for orphaned closing tags..."
for file in *.html; do
  if grep -q '>">$' "$file"; then
    echo "  ⚠️  $file: Found orphaned closing tag markers"
    ((issues_found++))
  fi
done

# Check for duplicate meta descriptions
echo ""
echo "5️⃣  Checking for duplicate meta descriptions..."
for file in *.html; do
  count=$(grep -c 'meta name="description"' "$file")
  if [ "$count" -gt 1 ]; then
    echo "  ⚠️  $file: Found $count description meta tags (should be 1)"
    ((issues_found++))
  fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $issues_found -eq 0 ]; then
  echo "✅ No HTML issues found! All files look clean."
else
  echo "⚠️  Found $issues_found potential issue(s) to review."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
