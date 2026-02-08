# DevOps & CI/CD Skill

## Overview
DevOps practices, CI/CD pipelines, containerization, infrastructure as code, and deployment automation for the QAi Talks Next.js application.

## When to Use
- Setting up or modifying CI/CD pipelines
- Containerizing the application with Docker
- Deploying to cloud platforms (Cloudflare Pages, Vercel, AWS)
- Configuring infrastructure as code (IaC)
- Setting up monitoring and logging
- Implementing security scanning and dependency updates
- Managing environment variables and secrets
- Optimizing build and deployment processes

## Key Files
- **CI/CD:** `.github/workflows/deploy-cloudflare.yml`
- **Config:** `wrangler.toml`, `next.config.ts`
- **Docker:** `Dockerfile`, `docker-compose.yml` (if created)
- **Docs:** `CI-CD.md`, `DEPLOYMENT.md`

## Quick Commands
```bash
# Local Development
npm run dev              # Start Next.js dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Unit tests
npm run test:e2e       # E2E tests with Playwright
npm run lint            # Code quality checks

# Docker (if implemented)
docker build -t qaitalks .
docker run -p 3000:3000 qaitalks

# Git Workflow
git checkout -b feature/your-feature
git add .
git commit -m "Description"
git push origin feature/your-feature
```

## DevOps Principles

### 1. Continuous Integration (CI)
- **Automated Testing:** Run unit tests, E2E tests, and linting on every commit
- **Code Quality:** ESLint, TypeScript type checking, and Prettier formatting
- **Security Scanning:** Dependency vulnerability checks with npm audit
- **Build Validation:** Ensure production builds succeed before merge

### 2. Continuous Deployment (CD)
- **Staging Environment:** Deploy develop branch to staging automatically
- **Production Deployment:** Deploy main branch to production with approval gates
- **Rollback Strategy:** Maintain ability to quickly revert to previous versions
- **Zero-Downtime Deployments:** Use blue-green or rolling deployments

### 3. Infrastructure as Code (IaC)
- **Version Control:** All infrastructure configuration in Git
- **Reproducibility:** Ability to recreate entire environment from code
- **Documentation:** IaC serves as living documentation
- **Testing:** Validate infrastructure changes in staging first

### 4. Monitoring & Observability
- **Application Metrics:** Response times, error rates, throughput
- **Infrastructure Metrics:** CPU, memory, disk usage, network
- **Logging:** Centralized log aggregation and searchability
- **Alerting:** Proactive notifications for issues

## Current CI/CD Pipeline

### Jobs Overview
1. **Code Quality & Validation**
   - Install dependencies with `npm ci`
   - Run ESLint for code quality
   - Run TypeScript type checking
   - Fails fast if quality checks don't pass

2. **Lighthouse Audit** (main/develop only)
   - Build Next.js application
   - Start production server
   - Run Lighthouse performance audit
   - Report Core Web Vitals scores

3. **Validate Pull Request**
   - Run validation checks on PR branches
   - Provide summary of test results
   - Block merge if validation fails

4. **Deploy to Staging** (develop branch)
   - Currently disabled (static site removed)
   - Should deploy Next.js app to staging environment

5. **Deploy to Production** (main branch)
   - Currently disabled (static site removed)
   - Should deploy Next.js app to production environment

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)
**Pros:**
- Native Next.js support with zero config
- Automatic HTTPS and CDN
- Preview deployments for PRs
- Edge network with global distribution
- Built-in analytics and monitoring

**Setup:**
```bash
npm install -g vercel
vercel login
vercel --prod  # Deploy to production
```

**GitHub Actions Integration:**
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

### Option 2: Cloudflare Pages
**Pros:**
- Free tier with unlimited bandwidth
- Global CDN with fast edge network
- Built-in analytics
- Zero cold starts

**Setup (with @cloudflare/next-on-pages):**
```bash
npm install -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static
```

**GitHub Actions Integration:**
```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy .vercel/output/static --project-name=qaitalks
```

### Option 3: Docker + AWS/GCP/Azure
**Pros:**
- Full control over environment
- Can run anywhere (cloud, on-prem, hybrid)
- Consistent across dev/staging/production

**Dockerfile Example:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

## Environment Variables

### Required for Production
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"

# OAuth Providers
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"
```

### Optional (Monitoring & Analytics)
```bash
# Sentry (error tracking)
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_MIXPANEL_TOKEN="your-mixpanel-token"
```

## Security Best Practices

### 1. Secrets Management
- **Never commit secrets** to version control
- Use GitHub Secrets for CI/CD credentials
- Use environment variables for runtime secrets
- Rotate secrets regularly
- Use different secrets for staging/production

### 2. Dependency Security
- Run `npm audit` regularly
- Enable Dependabot for automated security updates
- Review and merge security patches promptly
- Pin dependency versions in production

### 3. Image Security (Docker)
- Use official base images from trusted sources
- Scan images for vulnerabilities (Trivy, Snyk)
- Use multi-stage builds to minimize attack surface
- Run as non-root user
- Keep base images updated

### 4. Network Security
- Enable HTTPS/TLS for all traffic
- Use CDN for DDoS protection
- Implement rate limiting
- Configure CORS properly
- Use security headers (CSP, HSTS, X-Frame-Options)

## Performance Optimization

### Build Optimization
- Enable React Compiler for 40% faster renders
- Use Next.js Turbopack for faster dev builds
- Optimize images with Next.js Image component
- Code splitting with dynamic imports
- Tree shaking to remove unused code

### Runtime Optimization
- Enable HTTP/2 and HTTP/3
- Use CDN for static assets
- Implement caching strategies (ISR, SSG, edge caching)
- Optimize database queries with indexes
- Use connection pooling for database

### Monitoring Metrics
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- **Build Time:** Track and optimize CI/CD pipeline duration
- **Bundle Size:** Monitor and alert on increases

## Disaster Recovery

### Backup Strategy
- **Database Backups:** Automated daily backups with 30-day retention
- **Code:** Git serves as version control backup
- **Environment Config:** Document all secrets and variables
- **User Data:** Regular exports of critical user data

### Rollback Procedure
1. Identify the issue and scope
2. Revert to last known good deployment
3. Communicate status to stakeholders
4. Debug and fix issue in staging
5. Re-deploy with fix and monitoring

### Incident Response
1. **Detect:** Automated monitoring alerts on-call engineer
2. **Assess:** Determine severity and user impact
3. **Mitigate:** Implement temporary fix or rollback
4. **Resolve:** Deploy permanent fix
5. **Postmortem:** Document incident and preventive measures

## Branching Strategy

### Git Flow
- `main` - Production code, tagged releases
- `develop` - Integration branch, deploys to staging
- `feature/*` - New features from develop
- `hotfix/*` - Critical fixes from main
- `release/*` - Release preparation from develop

### CI/CD Triggers
- **Push to `develop`:** Deploy to staging
- **Push to `main`:** Deploy to production
- **Pull request:** Run validation and tests
- **Release tag:** Create GitHub release and deploy

## Useful Tools & Resources

### Monitoring & Analytics
- **Sentry:** Error tracking and performance monitoring
- **Datadog:** Infrastructure and application monitoring
- **Google Analytics:** User analytics
- **Lighthouse CI:** Automated performance testing

### DevOps Platforms
- **GitHub Actions:** CI/CD automation
- **Vercel:** Next.js deployment platform
- **Cloudflare:** CDN and edge computing
- **Docker Hub:** Container registry

### Security Tools
- **Dependabot:** Automated dependency updates
- **Snyk:** Vulnerability scanning
- **OWASP ZAP:** Security testing
- **npm audit:** Dependency vulnerability checks

## Output Checklist

When implementing DevOps changes:
- [ ] Update CI/CD pipeline workflow file
- [ ] Test pipeline changes in feature branch first
- [ ] Document new environment variables in README
- [ ] Update deployment guide with new steps
- [ ] Configure secrets in GitHub repository settings
- [ ] Test deployment in staging before production
- [ ] Monitor first deployment closely with metrics
- [ ] Create rollback plan before major changes
- [ ] Update team documentation and runbooks
- [ ] Set up alerting for critical metrics

## Common Tasks

### Adding a New Environment Variable
1. Add to `.env.local` locally
2. Add to GitHub Secrets (Settings > Secrets)
3. Add to Vercel/Cloudflare environment config
4. Document in README and deployment guide
5. Update CI/CD if needed for build-time variables

### Updating Node.js Version
1. Update in `package.json` engines field
2. Update in `.github/workflows/` Node setup step
3. Update in `Dockerfile` base image
4. Test locally and in CI pipeline
5. Update documentation

### Adding Monitoring
1. Sign up for monitoring service (Sentry, Datadog)
2. Install SDK: `npm install @sentry/nextjs`
3. Configure in `next.config.ts` or `sentry.config.js`
4. Add environment variables for DSN/API keys
5. Test error reporting in staging
6. Set up alerts and notification channels

---

**Last Updated:** February 2026  
**Maintainer:** DevOps Team  
**Related Skills:** security, testing, database, development
