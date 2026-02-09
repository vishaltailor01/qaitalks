# Cloudflare Pages Deployment Guide

## Current Deployment Status
- **Platform:** Cloudflare Pages with D1 Database
- **Framework:** Next.js 16 with React 19
- **Project Name:** qaitalks
- **Staging URL:** https://develop.qaitalks.pages.dev (Active)
- **Production URL:** https://main.qaitalks.pages.dev (Disabled - awaiting production readiness)
- **Custom Domain:** https://qaitalks.com (to be configured after production launch)
- **Database:** Cloudflare D1 (SQLite-compatible edge database)
- **Last Updated:** February 8, 2026

**Note:** Production deployment is currently disabled in CI/CD. Only staging deployments to the `develop` branch are active. Production deployment will be enabled when the project is production-ready.

---

## Prerequisites

### Required Tools
```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### D1 Databases
Two D1 databases have been created:
- **Production:** `qaitalks-db` (ID: `d1218a37-db81-44a3-9755-58a872f9019e`)
- **Preview:** `qaitalks-db-preview` (ID: `d6a74ead-6fc2-4cdd-aaad-b01c0297f7cd`)

---

## Initial Setup: Apply Database Migrations

### Apply Migrations to Production D1
```bash
cd next-app

# Find your latest migration file
ls prisma/migrations/

# Apply migration to production database
npx wrangler d1 execute qaitalks-db \
  --remote \
  --file=./prisma/migrations/<YOUR_MIGRATION_FOLDER>/migration.sql
```

Example:
```bash
npx wrangler d1 execute qaitalks-db \
  --remote \
  --file=./prisma/migrations/20240101000000_init/migration.sql
```

### Apply Migrations to Preview D1
```bash
npx wrangler d1 execute qaitalks-db-preview \
  --remote \
  --file=./prisma/migrations/<YOUR_MIGRATION_FOLDER>/migration.sql
```

### Verify Database Schema
```bash
# Check production database
npx wrangler d1 execute qaitalks-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

# Query a specific table
npx wrangler d1 execute qaitalks-db --remote --command="SELECT COUNT(*) FROM User"
```

---

## Environment Variables

### Configure Cloudflare Pages Environment Variables

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com/pages
   - Select project: `qaitalks`
   - Navigate to: Settings → Environment variables

2. **Add Production Variables:**
   ```
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=https://qaitalks.pages.dev
   GITHUB_ID=<your-github-oauth-app-id>
   GITHUB_SECRET=<your-github-oauth-secret>
   GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
   ```

3. **Add Preview Variables:**
   - Same as production but with preview URLs:
   ```
   NEXTAUTH_URL=https://develop.qaitalks.pages.dev
   ```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

**Note:** D1 database connection uses bindings (configured in `wrangler.toml`), not `DATABASE_URL`.

---

## Manual Deployment

### Build for Cloudflare
```bash
cd next-app

# Install dependencies (with legacy peer deps for Next.js 16 compatibility)
npm install --legacy-peer-deps

# Build with Cloudflare adapter
npm run build

# Verify build output exists
ls .vercel/output/static
```

### Deploy to Production
```bash
# From next-app directory
npx wrangler pages deploy .vercel/output/static \
  --project-name=qaitalks \
  --branch=main
```

### Deploy to Staging
```bash
npx wrangler pages deploy .vercel/output/static \
  --project-name=qaitalks \
  --branch=develop
```

### Local Preview with Wrangler
```bash
# Build first
npm run build

# Preview locally with D1 bindings
npm run preview

# Or directly:
npx wrangler pages dev .vercel/output/static
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
- **Current State:** Only staging (develop branch) deployments are active
- **Production:** Disabled until project is production-ready

### Enabling Production Deployment

When the project is ready for production:

1. **Open the workflow file:**
   ```bash
   .github/workflows/deploy-cloudflare.yml
   ```

2. **Uncomment the `deploy-production` job:**
   - Find the section starting with `# Job 5: Deploy to Production`
   - Remove the `#` comment markers from all lines in that job
   - The job should start with `deploy-production:` (no `#`)

3. **Commit and push:**
   ```bash
   git add .github/workflows/deploy-cloudflare.yml
   git commit -m "feat: enable production deployment"
   git push origin main
   ```

4. **Production will now deploy automatically** when you push to the `main` branch.

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

## Monitoring & Analytics

### Cloudflare Analytics
- URL: https://dash.cloudflare.com/pages → qaitalks → Analytics
- Metrics: Requests, bandwidth, unique visitors, top pages
- Real-time: Updated every minute

### D1 Database Monitoring
```bash
# View database size
npx wrangler d1 info qaitalks-db

# Monitor query performance (coming soon)
# Check dashboard for D1 analytics
```

### Performance Monitoring
- **PageSpeed Insights:** https://pagespeed.web.dev/ (run weekly)
- **Cloudflare Speed Test:** Built-in, monitors Core Web Vitals
- **Uptime Monitoring:** Use UptimeRobot or Cloudflare Health Checks

---

## Troubleshooting

### Build Fails with Peer Dependency Error
```bash
# Use --legacy-peer-deps flag
npm install --legacy-peer-deps

# Or update .npmrc
echo "legacy-peer-deps=true" >> .npmrc
```

**Note:** `@cloudflare/next-on-pages` doesn't officially support Next.js 16 yet. We use `--legacy-peer-deps` to bypass this constraint.

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

### Database Connection Errors
```bash
# Test D1 connection
npx wrangler d1 execute qaitalks-db --remote --command="SELECT 1"

# List all tables
npx wrangler d1 execute qaitalks-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

# Check if migrations were applied
npx wrangler d1 execute qaitalks-db --remote --command="PRAGMA table_info(User)"
```

### Runtime Errors on Cloudflare
1. **Check browser console for errors**
2. **Verify all environment variables are set** (Settings → Environment variables)
3. **Ensure D1 binding is configured in wrangler.toml**
4. **Check API routes have `export const runtime = 'edge'`**
5. **Review Cloudflare Pages logs** in dashboard

### Custom Domain Not Working
1. Check DNS propagation: https://dnschecker.org
2. Verify CNAME record points to: `qaitalks.pages.dev`
3. Ensure SSL/TLS mode is "Full (strict)"
4. Wait 24-48 hours for full propagation

### Files Not Updating
1. Clear Cloudflare cache: Dashboard → Caching → Purge Everything
2. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Verify deployment succeeded: Check dashboard deployment list

### D1 Migration Issues
```bash
# If migration fails, check SQL syntax
npx wrangler d1 execute qaitalks-db --remote --command="SELECT sql FROM sqlite_master WHERE type='table'"

# Apply migration again (use --force if needed)
npx wrangler d1 execute qaitalks-db --remote --file=./prisma/migrations/.../migration.sql

# If duplicate table errors, migration may already be applied
```

---

## Important Notes

### Next.js 16 Compatibility
- `@cloudflare/next-on-pages@1.13.16` officially supports Next.js up to 15.5.2
- We use `--legacy-peer-deps` to install with Next.js 16.1.6
- **Alternative:** Consider using OpenNext adapter (recommended by Cloudflare): https://opennext.js.org/cloudflare

### Database Considerations
- **D1 is SQLite-compatible**, not full PostgreSQL
- **Local development:** Uses standard SQLite (file:./prisma/dev.db)
- **Production:** Uses Cloudflare D1 via binding (`process.env.DB`)
- **No connection pooling needed:** D1 handles this automatically

### Image Optimization
- Next.js Image Optimization is **disabled** (`unoptimized: true`)
- For optimized images, use **Cloudflare Images** separately
- Alternative: Use `next-cloudflare-image` package for integration

---

## Cost & Limits (Free Tier)

- **Pages Requests:** Unlimited
- **D1 Reads:** 5 million/day
- **D1 Writes:** 100,000/day
- **D1 Storage:** 5 GB per database
- **Builds:** 500/month
- **Concurrent Builds:** 1

### Upgrade to Pro ($20/month)
- Concurrent builds: 5
- Build time: 20 min (vs 10 min)
- Private repositories support
- Advanced analytics
- D1 increased limits

---

## Additional Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **D1 Database Docs:** https://developers.cloudflare.com/d1/
- **Next.js on Cloudflare:** https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **OpenNext (alternative adapter):** https://opennext.js.org/cloudflare
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/

---

**Last Updated:** February 8, 2026  
**Maintainer:** QAi Talks Team
