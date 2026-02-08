# Production Readiness Checklist

This checklist ensures your QaiTalks application is ready for production deployment.

## ✅ Critical Security (COMPLETED)

- [x] **XSS Protection**: Blog post HTML content is sanitized with DOMPurify
- [x] **PII Protection**: User emails are not exposed in public APIs
- [x] **Auth Integration**: NextAuth helpers properly implemented
- [x] **OAuth Security**: Providers only registered when credentials are present

## ⚙️ Environment Configuration (REQUIRED)

### 1. Database Setup
**Current**: SQLite (development only)  
**Production Required**: PostgreSQL

```bash
# Update .env.production with PostgreSQL connection:
DATABASE_URL="postgresql://user:password@host:5432/qaitalks?schema=public&sslmode=require"
```

**Action Items**:
- [ ] Set up PostgreSQL database (recommended: Neon, Supabase, or Railway)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Update DATABASE_URL in production environment

### 2. NextAuth Configuration
```bash
# Generate a secure secret:
openssl rand -base64 32

# Update .env.production:
NEXTAUTH_SECRET="<generated-secret-here>"
NEXTAUTH_URL="https://your-production-domain.com"
```

**Action Items**:
- [ ] Generate and set NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL to production URL
- [ ] Configure OAuth providers (optional but recommended)

### 3. OAuth Providers (Optional)
If using social login, configure:

**GitHub OAuth**:
- [ ] Create OAuth App at https://github.com/settings/developers
- [ ] Set callback URL: `https://your-domain.com/api/auth/callback/github`
- [ ] Add GITHUB_ID and GITHUB_SECRET to production environment

**Google OAuth**:
- [ ] Create OAuth credentials at https://console.cloud.google.com
- [ ] Set authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
- [ ] Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to production environment

### 4. Application URLs
```bash
NEXT_PUBLIC_BASE_URL="https://your-production-domain.com"
```

**Action Items**:
- [ ] Update NEXT_PUBLIC_BASE_URL for production
- [ ] Configure custom domain in Cloudflare Pages (if applicable)

## 🚀 Deployment Configuration

### Cloudflare Pages
**Current Status**: Staging only (develop branch → develop.qaitalks.pages.dev)

**To Enable Production**:
1. Open `.github/workflows/deploy-cloudflare.yml`
2. Uncomment the `deploy-production` job (lines ~217-247)
3. Ensure GitHub Secrets are set:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

**Action Items**:
- [ ] Verify Cloudflare API token has correct permissions
- [ ] Test staging deployment works
- [ ] Uncomment production deployment job
- [ ] Configure custom domain (qaitalks.com)

## 🧪 Testing & Quality

### Pre-Production Testing
```bash
# Run full test suite
npm run test              # Unit tests
npm run test:e2e          # E2E tests (all specs)
npm run type-check        # TypeScript checks
npm run lint              # Code quality

# Build verification
npm run build             # Production build
npm run start            # Test production server locally
```

**Action Items**:
- [ ] All unit tests passing
- [ ] All E2E tests passing (full suite, not just smoke tests)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Production build successful
- [ ] Production server runs without errors locally

### Performance & Monitoring
**Action Items**:
- [ ] Run Lighthouse audit (scores > 90 recommended)
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Configure analytics (optional)
- [ ] Set up uptime monitoring (optional)

## 📊 Database

### Schema & Data
```bash
# Apply production migrations
npx prisma migrate deploy

# Seed initial data (if needed)
npm run db:seed
```

**Action Items**:
- [ ] Database schema applied
- [ ] Initial data seeded (blog posts, users if needed)
- [ ] Database backups configured
- [ ] Connection pooling configured (if applicable)

## 🔒 Security Hardening

### Headers & CORS
**Action Items**:
- [ ] Review `next.config.ts` security headers
- [ ] Configure CORS if using separate API domain
- [ ] Set up CSP (Content Security Policy) if needed

### Secrets Management
**Action Items**:
- [ ] All sensitive values in environment variables (not committed to git)
- [ ] Production secrets different from development
- [ ] GitHub Secrets configured for CI/CD
- [ ] Database credentials secure

## 📝 Documentation

**Action Items**:
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document environment variables for team

## 🎯 Final Verification

Before going live:

```bash
# 1. Local production build test
npm run build && npm run start

# 2. Visit http://localhost:3000 and verify:
- [ ] Homepage loads correctly
- [ ] Blog pages render with sanitized HTML
- [ ] Authentication works (if OAuth configured)
- [ ] Navigation works
- [ ] Images load properly
- [ ] No console errors

# 3. Staging deployment test
- [ ] Push to develop branch
- [ ] Verify deploy to staging succeeds
- [ ] Test at https://develop.qaitalks.pages.dev
- [ ] Verify all features work in staging

# 4. Production deployment
- [ ] Merge to main branch
- [ ] Verify production deployment succeeds
- [ ] Test at production URL
- [ ] Monitor for errors in first 24 hours
```

## 🆘 Rollback Plan

If issues arise after production deployment:

1. **Quick Rollback**: Revert the merge commit on main branch
2. **Database**: Keep backups before schema changes
3. **Monitoring**: Check Cloudflare Pages deployment logs
4. **Support**: Review error logs and fix issues in develop first

## 📞 Support Resources

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org/getting-started/introduction
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/

---

## Current Status Summary

### ✅ Production-Ready
- XSS vulnerability fixed with DOMPurify
- Auth helpers properly implemented  
- Environment configuration documented
- CI/CD pipeline configured (staging)
- Comprehensive test coverage
- Security best practices implemented

### ⚠️ Requires Configuration
- PostgreSQL database setup
- Production environment variables
- OAuth providers (optional)
- Custom domain configuration
- Production deployment enabled in workflow

### 📋 Before Launch
1. Complete all environment configuration items above
2. Run full test suite (not just smoke tests)
3. Test on staging environment
4. Enable production deployment
5. Monitor closely after launch

**Estimated Time to Production**: 2-4 hours (depending on OAuth and database setup)
