# Cloudflare Pages Deployment Guide

## Current Deployment Status
- **Platform:** Cloudflare Pages
- **Project Name:** qaitalks
- **Production URL:** https://main.qaitalks.pages.dev
- **Custom Domain:** https://qaitalks.com (to be configured)
- **Last Deployed:** February 6, 2026

---

## Manual Deployment

### Prerequisites
- Wrangler CLI installed: `npm install -g wrangler`
- Authenticated: `wrangler login`

### Deploy Command
```bash
# Deploy from project root
wrangler pages deploy site/public --project-name=qaitalks --branch=main
```

### Deploy Staging
```bash
wrangler pages deploy site/public --project-name=qaitalks --branch=develop
```

---

## Automatic Deployment (GitHub Actions)

### Setup Steps
1. **Get Cloudflare API Token:**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create Token → "Edit Cloudflare Workers" template
   - Permissions: `Account.Cloudflare Pages:Edit`
   - Copy the token

2. **Get Cloudflare Account ID:**
   - Go to: https://dash.cloudflare.com
   - Select your account → Copy Account ID from sidebar

3. **Add GitHub Secrets:**
   - Go to: https://github.com/YOUR-USERNAME/qaitalks/settings/secrets/actions
   - Add `CLOUDFLARE_API_TOKEN` (from step 1)
   - Add `CLOUDFLARE_ACCOUNT_ID` (from step 2)

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat(deploy): add Cloudflare Pages CI/CD"
   git push origin main
   ```

### GitHub Actions Workflow
- File: `.github/workflows/deploy-cloudflare.yml`
- Triggers: Push to `main` or `develop`, Pull requests
- Action: Deploys to Cloudflare Pages automatically

---

## Custom Domain Setup

### Connect qaitalks.com
1. **Go to Cloudflare Pages Dashboard:**
   - URL: https://dash.cloudflare.com/pages
   - Select project: `qaitalks`

2. **Add Custom Domain:**
   - Navigate to: Custom domains tab
   - Click "Set up a custom domain"
   - Enter: `qaitalks.com`
   - Enter: `www.qaitalks.com` (optional)

3. **DNS Records (Auto-configured by Cloudflare):**
   ```
   Type: CNAME
   Name: qaitalks.com
   Target: qaitalks.pages.dev
   Proxy: ✅ Proxied
   ```

4. **SSL/TLS Settings:**
   - Go to: SSL/TLS → Overview
   - Set to: "Full (strict)" (recommended)
   - Certificate auto-provisioned by Cloudflare

---

## Deployment Checklist

### Before Every Deployment
- [ ] Test locally: `npx serve site/public -l 3000`
- [ ] Validate HTML: Check for broken links, syntax errors
- [ ] Run Lighthouse audit: Target score 90+
- [ ] Check meta tags: Title, description, Open Graph
- [ ] Review sitemap.xml and robots.txt (when created)

### After Deployment
- [ ] Visit production URL: https://main.qaitalks.pages.dev
- [ ] Test all pages load correctly
- [ ] Verify navigation links work
- [ ] Check mobile responsiveness (DevTools)
- [ ] Run PageSpeed Insights: https://pagespeed.web.dev/
- [ ] Monitor Cloudflare Analytics (first 24 hours)

---

## Rollback Procedure

### Option 1: Redeploy Previous Version
```bash
# View deployment history
wrangler pages deployment list --project-name=qaitalks

# Rollback to specific deployment (copy ID from list)
wrangler pages deployment rollback <DEPLOYMENT_ID> --project-name=qaitalks
```

### Option 2: Dashboard Rollback
1. Go to: https://dash.cloudflare.com/pages
2. Select project: `qaitalks`
3. Navigate to: Deployments tab
4. Find working deployment → Click "Rollback to this deployment"

---

## Environment Variables

### Add Secrets (for future backend)
```bash
# Add secret to production
wrangler pages secret put DATABASE_URL --project-name=qaitalks

# Add secret to staging
wrangler pages secret put DATABASE_URL --project-name=qaitalks --env=staging
```

### View Current Secrets
```bash
wrangler pages secret list --project-name=qaitalks
```

---

## Monitoring & Analytics

### Cloudflare Analytics
- URL: https://dash.cloudflare.com/pages → qaitalks → Analytics
- Metrics: Requests, bandwidth, unique visitors, top pages
- Real-time: Updated every minute

### Performance Monitoring
- **PageSpeed Insights:** https://pagespeed.web.dev/ (run weekly)
- **Cloudflare Speed Test:** Built-in, monitors Core Web Vitals
- **Uptime Monitoring:** Use UptimeRobot or Cloudflare Health Checks

---

## Troubleshooting

### Deployment Failed
```bash
# Check wrangler logs
wrangler pages deployment tail --project-name=qaitalks

# Verify authentication
wrangler whoami

# Re-authenticate if needed
wrangler logout
wrangler login
```

### Custom Domain Not Working
1. Check DNS propagation: https://dnschecker.org
2. Verify CNAME record points to: `qaitalks.pages.dev`
3. Ensure SSL/TLS mode is "Full (strict)"
4. Wait 24-48 hours for full propagation

### Files Not Updating
1. Clear Cloudflare cache: Dashboard → Caching → Purge Everything
2. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Verify deployment succeeded: Check dashboard deployment list

---

## Cost & Limits (Free Tier)

- **Requests:** Unlimited
- **Bandwidth:** Unlimited
- **Builds:** 500/month
- **Concurrent Builds:** 1
- **Edge Locations:** 300+ globally

### Upgrade to Pro ($20/month)
- Concurrent builds: 5
- Build time: 20 min (vs 10 min)
- Private repositories support
- Advanced analytics

---

## Future Enhancements

### When Migrating to Full-Stack (Next.js)
1. **Enable Cloudflare Workers:**
   ```bash
   wrangler pages project create qaitalks --production-branch=main
   ```

2. **Add D1 Database:**
   ```bash
   wrangler d1 create qaitalks-db
   wrangler d1 execute qaitalks-db --file=./schema.sql
   ```

3. **Add KV Namespace (Cache):**
   ```bash
   wrangler kv:namespace create "CACHE"
   ```

4. **Update wrangler.toml:**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "qaitalks-db"
   database_id = "<UUID>"

   [[kv_namespaces]]
   binding = "CACHE"
   id = "<UUID>"
   ```

---

**Last Updated:** February 6, 2026  
**Maintainer:** QAi Talks Team  
**Support:** Cloudflare Pages Docs - https://developers.cloudflare.com/pages/
