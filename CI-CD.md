# CI/CD Pipeline Documentation

Fully automated deployment pipeline using GitHub Actions & Cloudflare Pages.

---

## Overview

```
Developer Push
    ↓
GitHub detects push
    ↓
CI/CD Pipeline Starts (Auto)
    ├─ Job 1: Validate (HTML, links, files)
    ├─ Job 2: Lighthouse Audit (performance)
    ├─ Job 3: Deploy to Staging (if develop branch)
    └─ Job 4: Deploy to Production (if main branch & all checks pass)
    ↓
Results posted automatically
    ↓
✅ DONE (no manual intervention needed!)
```

---

## What Happens Automatically

### When You Push to `main` (Production)

1. **Validation** (5-10 min)
   - ✅ HTML validation
   - ✅ Broken links check
   - ✅ Required files verification
   - ✅ File sizes report

2. **Lighthouse Audit** (3-5 min)
   - ✅ Performance score
   - ✅ Accessibility score
   - ✅ Best practices score
   - ✅ SEO score

3. **Deployment to Production** (2-3 min)
   - ✅ Deploy to Cloudflare Pages
   - ✅ Live at https://qaitalks.com

**Total Time:** 10-20 minutes from push to live

---

### When You Push to `develop` (Staging)

1. **Validation** (5-10 min)
   - ✅ Same checks as production

2. **Deployment to Staging** (2-3 min)
   - ✅ Deploy to Cloudflare Pages staging
   - ✅ Available at https://develop.qaitalks.pages.dev

**Total Time:** 7-13 minutes

---

### When You Create a Pull Request

1. **PR Validation** (3-5 min)
   - ✅ HTML validation
   - ✅ File structure check
   - ✅ Summary comment on PR

**No deployment** (just validation)

---

## Pipeline Stages Explained

### Stage 1: Validation (`validate` job)

Runs on all branches (main, develop, PRs).

**Checks:**
```bash
# 1. HTML validation against standards
html-validate site/public/*.html site/public/**/*.html

# 2. Check for broken internal links
# Scans HTML for href and link references

# 3. Verify critical files exist
- site/public/index.html ✓
- site/public/about.html ✓
- site/public/curriculum.html ✓
- site/public/blog.html ✓
- site/public/branding/logo.svg ✓
- site/public/branding/favicon.svg ✓

# 4. Show file sizes (optimization insight)
index.html: 45KB
about.html: 32KB
logo.svg: 8KB
```

**What can fail:**
- Missing HTML tags
- Invalid attribute syntax
- Broken links (404s)
- Missing critical files

---

### Stage 2: Lighthouse Audit (`lighthouse` job)

Runs on `main` and `develop` pushes only (not PRs, to save time).

**Metrics:**
```json
{
  "performance": 92,      // Page load speed
  "accessibility": 95,    // WCAG compliance
  "best-practices": 88,   // Modern web standards
  "seo": 100             // Search engine optimization
}
```

**Targets:**
- 🎯 Performance: **90+**
- 🎯 Accessibility: **90+**
- 🎯 Best Practices: **85+**
- 🎯 SEO: **90+**

**Slow scores might indicate:**
- Unoptimized images
- Render-blocking CSS/JS
- Missing meta tags
- Accessibility issues

---

### Stage 3: Deploy to Staging (`deploy-staging` job)

Runs **only when you push to `develop` branch** AND validation passes.

**Automatic actions:**
1. ✅ Takes latest code from `develop`
2. ✅ Builds deployment package
3. ✅ Deploys to Cloudflare Pages
4. ✅ Available at `https://develop.qaitalks.pages.dev`

**What happens if validation fails:**
- ❌ Deployment **stops**
- ❌ No staging update
- ❌ Error in GitHub Actions log

---

### Stage 4: Deploy to Production (`deploy-production` job)

Runs **only when you push to `main` branch** AND **ALL previous jobs pass**.

**Dependencies:**
- ✅ `validate` job must pass
- ✅ `lighthouse` audit must complete

**Automatic actions:**
1. ✅ Deploys to Cloudflare Pages production
2. ✅ Live at `https://qaitalks.com`
3. ✅ Notifies success

**What happens if checks fail:**
- ❌ Deployment **blocked**
- ❌ Production remains unchanged
- ❌ Must fix and push again

---

### Stage 5: PR Validation (`validate-pr` job)

Runs **only on Pull Requests** (not on commits).

**Purpose:** Review code before merging.

**Automatic actions:**
1. ✅ Validates HTML in PR
2. ✅ Posts summary comment on PR
3. ✅ No deployment

---

## View CI/CD Status

### GitHub Actions Dashboard

Go to: **https://github.com/vishaltailor01/qaitalks/actions**

**You'll see:**
- ✅ Green checkmark = All jobs passed
- ❌ Red X = Some job failed
- ⏳ Yellow dot = Running

Click on a workflow to see detailed logs of each job.

---

## Workflow File Locations

- **Main workflow:** `.github/workflows/deploy-cloudflare.yml`
- **Triggers:** Pushes to `main`/`develop`, Pull requests

---

## Required Environment

The pipeline needs these GitHub Secrets to work:
- ✅ `CLOUDFLARE_API_TOKEN` (added earlier)
- ✅ `CLOUDFLARE_ACCOUNT_ID` (added earlier)

Without these, deployment jobs will **fail** with permission error.

---

## Typical Development Workflow

### Day-to-Day Development

```bash
# 1. Create feature branch
git checkout -b feat/new-feature

# 2. Make changes locally
# Edit files, test in browser

# 3. Commit and push
git add .
git commit -m "feat(page): add new feature"
git push origin feat/new-feature

# 4. Create Pull Request on GitHub
# Go to: https://github.com/vishaltailor01/qaitalks/pulls
# CI/CD validates PR automatically ✅

# 5. After review, merge to develop
# CI/CD validates and deploys to staging 🚀

# 6. Test on https://develop.qaitalks.pages.dev

# 7. When ready, merge develop → main
# CI/CD validates, audits, and deploys to production 🎉
```

### Example Timeline

```
10:00 AM  → Push to develop
10:05 AM  → Validation passes ✅
10:10 AM  → Staging deployed (develop.qaitalks.pages.dev) 🚀
1:00 PM   → Create release PR (develop → main)
1:05 PM   → PR validation passes ✅
2:00 PM   → Merge to main
2:05 PM   → Production validation passes ✅
2:10 PM   → Lighthouse audit completes ✅
2:15 PM   → Production deployed (qaitalks.com) 🎉
```

---

## Troubleshooting CI/CD Failures

### "Validation failed: HTML error"

1. **Check error message** in GitHub Actions log
2. **Fix the HTML file** locally
3. **Commit and push** again
4. **CI/CD automatically retries** ✅

Example:
```
❌ site/public/index.html: Missing closing </div> tag on line 45
→ Fix error
→ git commit -am "fix: close div tag"
→ git push
→ Re-run CI/CD automatically
```

### "Broken links found"

1. **Check which links are broken** in CI/CD log
2. **Update href attributes** in HTML
3. **Push changes**
4. **CI/CD validates again**

Example:
```
❌ Broken link: /#broken-anchor (href="#broken")
→ Fix href in HTML: href="/careers.html"
→ Create careers.html page
→ Push again
```

### "Deployment failed: Permission denied"

Check GitHub Secrets:
1. Go to: https://github.com/vishaltailor01/qaitalks/settings/secrets/actions
2. Verify `CLOUDFLARE_API_TOKEN` exists
3. Verify `CLOUDFLARE_ACCOUNT_ID` exists
4. If missing, add them again

### "Lighthouse score too low"

Performance issues to address:
- **Optimize images** (compress, use modern formats)
- **Minify CSS/JS** (smaller files = faster load)
- **Add meta tags** (affects SEO score)
- **Improve accessibility** (alt text, contrast, headings)

---

## Monitoring & Alerts

### Check CI/CD Status

**Quick check:**
1. Go to: https://github.com/vishaltailor01/qaitalks/actions
2. Latest workflow shown at top
3. Green = Success, Red = Failed

**Get notifications:**
1. GitHub will email you if your push fails CI/CD
2. Check email for error details

### Recent Deployments

See deployment history:
```
https://github.com/vishaltailor01/qaitalks/deployments
```

---

## Advanced: Custom CI/CD Jobs

Future additions you could add:

### 1. Automated Testing
```yaml
test:
  run: npm test
```

### 2. Dependency Scanning
```yaml
security:
  run: npm audit
```

### 3. SEO Validation
```yaml
seo:
  run: validate-meta-tags, check-sitemap.xml
```

### 4. Performance Budget
```yaml
performance:
  target: lighthouse score 90+
  fail-if-below: 85
```

---

## Security Notes

- ✅ Secrets stored securely in GitHub (not visible in logs)
- ✅ Only authorized to deploy (API token)
- ✅ Cloudflare auto-manages SSL/TLS
- ✅ Deployment logs only visible to repo members

---

## Disabling/Modifying Pipeline

### Temporarily skip CI/CD

```bash
# (Not recommended, will skip all validations!)
git commit --no-verify
git push origin main
```

### Modify pipeline

Edit: `.github/workflows/deploy-cloudflare.yml`

Common changes:
- Add new validation jobs
- Adjust Lighthouse thresholds
- Add email notifications
- Change deployment branches

Save and push → New workflow takes effect automatically ✅

---

## Summary

| Trigger | Validation | Audit | Deployment | Time |
|---------|-----------|-------|-----------|------|
| Push to `main` | ✅ | ✅ | ✅ Production | 10-20 min |
| Push to `develop` | ✅ | ❌ | ✅ Staging | 7-13 min |
| Create/update PR | ✅ | ❌ | ❌ | 3-5 min |

---

**Last Updated:** February 6, 2026  
**Status:** Full automation enabled ✅  
**Questions?** Check GitHub Actions logs for detailed error messages
