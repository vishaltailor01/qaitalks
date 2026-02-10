# CV Review Tool - CI/CD Enhancement Plan

## Overview

**Purpose:** Enhance GitHub Actions CI/CD workflows with security hardening, performance optimization, and best practices for the CV Review Tool deployment.

**Current State:** Basic CI/CD exists (deploy-cloudflare.yml shown in deployment-strategy.md)  
**Target State:** Security-first, optimized, observable CI/CD pipeline  
**Compliance:** GitHub Actions security best practices, OIDC authentication, supply chain security

---

## Security-First CI/CD Principles

### 1. Action Pinning (SHA-Based)

**Problem:** Using `@v4` tags is vulnerable to tag moving attacks (attacker compromises tag, points to malicious code).

**Solution:** Pin to specific commit SHAs.

```yaml
# ❌ BAD: Mutable tags
- uses: actions/checkout@v4
- uses: actions/setup-node@v4

# ✅ GOOD: Immutable SHA with version comment
- uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
- uses: actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b # v4.0.3
```

**Implementation Tool:**
```bash
# Use actionlint to validate
npm install -g actionlint
actionlint .github/workflows/*.yml

# Or use Dependabot to auto-update SHAs
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

### 2. Permissions Least Privilege

**Problem:** Default `permissions: write-all` is excessive.

**Solution:** Explicitly define minimal permissions per job.

```yaml
# ❌ BAD: Excessive permissions (default)
# jobs:
#   build: ...

# ✅ GOOD: Minimal permissions
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    permissions:
      contents: read       # Read repository code
      pull-requests: write # Comment on PRs with test results
      checks: write        # Create check runs
    steps: ...
```

**Permission Matrix:**

| Job | contents | pull-requests | checks | id-token | deployments |
|-----|----------|---------------|--------|----------|-------------|
| build-and-test | read | write | write | none | none |
| deploy-staging | read | none | none | write (OIDC) | write |
| deploy-production | read | none | none | write (OIDC) | write |

---

### 3. OIDC Authentication (No Static Tokens)

**Problem:** Static API tokens (`CLOUDFLARE_API_TOKEN`) can leak in logs.

**Solution:** Use OpenID Connect (OIDC) for short-lived, scoped credentials.

```yaml
# Cloudflare OIDC Setup (Future Enhancement)
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Required for OIDC
      contents: read
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      # Get OIDC token from GitHub
      - name: Configure OIDC
        run: |
          TOKEN=$(curl -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
            "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=cloudflare" | jq -r '.value')
          echo "::add-mask::$TOKEN"
          echo "OIDC_TOKEN=$TOKEN" >> $GITHUB_ENV
      
      # Use OIDC token with Cloudflare (requires Cloudflare OIDC setup)
      - name: Deploy with OIDC
        run: wrangler pages deploy --token=$OIDC_TOKEN
```

**Prerequisites for OIDC:**
1. Configure Cloudflare to trust GitHub OIDC provider
2. Create IAM policies for GitHub Actions role
3. Update workflows to request OIDC tokens

**Note:** Cloudflare OIDC support is limited as of 2026. Continue using static tokens with rotation policy.

---

### 4. Concurrency Control

**Problem:** Multiple deploys running simultaneously can corrupt state.

**Solution:** Use `concurrency` to queue deployments.

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    concurrency:
      group: production-deploy
      cancel-in-progress: false # Don't cancel in-progress deploys
    steps: ...
```

---

## Enhanced CI/CD Workflow

### Complete GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd-cv-review.yml
name: CV Review Tool - CI/CD

on:
  push:
    branches: [develop, main]
    paths:
      - 'next-app/**' # Only trigger if Next.js app changes
      - '.github/workflows/**'
  pull_request:
    branches: [develop, main]
    paths:
      - 'next-app/**'

# Cancel stale runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      - uses: actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b # v4.0.3
        with:
          node-version: '23'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit
      
      - name: ESLint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Actionlint (workflow validation)
        uses: reviewdog/action-actionlint@7eeec1dd160c2301eb28e1568721837d084558ad # v1.57.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
  
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write # For CodeQL
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      - name: Dependency Review
        uses: actions/dependency-review-action@5a2ce3f5b92ee19cbb1541a4984c76d921601d7c # v4.3.4
        if: github.event_name == 'pull_request'
      
      - name: npm audit
        run: npm audit --audit-level=moderate
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@429e1977040da7a23b6822b13c129cd1ba93dbb2 # v3.26.2
        with:
          languages: typescript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@429e1977040da7a23b6822b13c129cd1ba93dbb2 # v3.26.2
  
  unit-tests:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write # For coverage comments
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      - uses: actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b # v4.0.3
        with:
          node-version: '23'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit
      
      - name: Run unit tests with coverage
        run: npm run test -- --coverage --ci
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@e28ff129e5465c2c0dcc6f003fc735cb6ae0c673 # v4.5.0
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unittests
      
      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@4cf015aa4afa87b78238301f1e3dc140ea0e1ec6 # v0.4.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
  
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      - uses: actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b # v4.0.3
        with:
          node-version: '23'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit
      
      - name: Build Next.js app
        run: npm run build:cloudflare
        env:
          NODE_ENV: production
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@50769540e7f4bd5e21e526ee35c689e35e0d6874 # v4.4.0
        with:
          name: build-output
          path: .vercel/output
          retention-days: 7
  
  e2e-tests:
    runs-on: ubuntu-latest
    needs: build
    permissions:
      contents: read
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      - uses: actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b # v4.0.3
        with:
          node-version: '23'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@50769540e7f4bd5e21e526ee35c689e35e0d6874 # v4.4.0
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30
  
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [lint-and-format, security-scan, unit-tests, build, e2e-tests]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    permissions:
      contents: read
      deployments: write
    concurrency:
      group: staging-deploy
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      - name: Download build artifacts
        uses: actions/download-artifact@fa0a91b85d4f404e444e00e005971372dc801d16 # v4.1.8
        with:
          name: build-output
          path: .vercel/output
      
      - name: Deploy to Cloudflare Pages (Staging)
        uses: cloudflare/pages-action@f0a1cd58cd66095dee69bfa18fa5efd1dde93bca # v1.5.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: qaitalks
          directory: .vercel/output
          branch: develop
      
      - name: Run smoke tests (Staging)
        run: |
          sleep 10 # Wait for deployment to propagate
          curl -f https://qaitalks-staging.pages.dev/api/health || exit 1
          curl -f https://qaitalks-staging.pages.dev/cv-review || exit 1
  
  deploy-production:
    runs-on: ubuntu-latest
    needs: [lint-and-format, security-scan, unit-tests, build, e2e-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    permissions:
      contents: read
      deployments: write
    environment:
      name: production
      url: https://qaitalks.com
    concurrency:
      group: production-deploy
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      
      - name: Download build artifacts
        uses: actions/download-artifact@fa0a91b85d4f404e444e00e005971372dc801d16 # v4.1.8
        with:
          name: build-output
          path: .vercel/output
      
      - name: Deploy to Cloudflare Pages (Production)
        uses: cloudflare/pages-action@f0a1cd58cd66095dee69bfa18fa5efd1dde93bca # v1.5.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: qaitalks
          directory: .vercel/output
          branch: main
      
      - name: Run database migrations
        run: |
          npm install -g wrangler
          wrangler d1 execute qaitalks-production \
            --file=./prisma/migrations/latest.sql
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      - name: Run smoke tests (Production)
        run: |
          sleep 15 # Wait for deployment + DNS propagation
          curl -f https://qaitalks.com/api/health || exit 1
          curl -f https://qaitalks.com/cv-review || exit 1
      
      - name: Notify deployment success
        if: success()
        run: |
          echo "🚀 Production deployment successful!"
          # Optional: Send Slack notification
          # curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
          #   -d '{"text":"CV Review Tool deployed to production!"}'
      
      - name: Rollback on failure
        if: failure()
        run: |
          echo "❌ Deployment failed. Manual rollback required."
          exit 1
```

---

## Caching Optimization

### npm Dependencies Caching

```yaml
- uses: actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b # v4.0.3
  with:
    node-version: '23'
    cache: 'npm' # Auto-cache node_modules
```

**Cache Hit Rate:** ~95% (only misses when package-lock.json changes)

### Playwright Browsers Caching

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9 # v4.0.2
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
```

**Time Saved:** ~2 minutes per run

### Build Output Caching (Optional)

```yaml
- name: Cache Next.js build
  uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9 # v4.0.2
  with:
    path: .next/cache
    key: nextjs-${{ runner.os }}-${{ hashFiles('package-lock.json') }}-${{ hashFiles('app/**/*.tsx') }}
```

---

## Supply Chain Security

### 1. Dependency Review (PR Only)

```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@5a2ce3f5b92ee19cbb1541a4984c76d921601d7c # v4.3.4
  if: github.event_name == 'pull_request'
```

**Blocks PRs with:**
- Vulnerable dependencies (CVE-2024-XXXX)
- License violations (GPL, AGPL)
- Malicious packages (typosquatting)

### 2. SBOM Generation (Software Bill of Materials)

```yaml
- name: Generate SBOM
  uses: anchore/sbom-action@d94f46e13c6c62f59525ac9a1e147a99dc0b9bf5 # v0.17.0
  with:
    format: cyclonedx-json
    output-file: sbom.json

- name: Upload SBOM artifact
  uses: actions/upload-artifact@50769540e7f4bd5e21e526ee35c689e35e0d6874 # v4.4.0
  with:
    name: sbom
    path: sbom.json
```

### 3. Container Scanning (If Using Docker)

```yaml
# If containerized deployment (not current plan)
- name: Build Docker image
  run: docker build -t qaitalks:${{ github.sha }} .

- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@6e7b7d1fd3e4fef0c5fa8cce1229c54b2c9bd0d8 # v0.24.0
  with:
    image-ref: qaitalks:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload Trivy results to GitHub Security
  uses: github/codeql-action/upload-sarif@429e1977040da7a23b6822b13c129cd1ba93dbb2 # v3.26.2
  with:
    sarif_file: 'trivy-results.sarif'
```

---

## Environment Protection Rules

### GitHub Repository Settings

**Production Environment:**
1. Navigate to: Settings → Environments → production
2. Configure:
   - ✅ Required reviewers: 2 approvals from [@tech-lead, @product-manager]
   - ✅ Wait timer: 5 minutes (allows review)
   - ✅ Deployment branches: `main` only
   - ✅ Environment secrets: `GEMINI_API_KEY`, `HF_API_KEY`, `SENTRY_DSN`

**Staging Environment:**
1. Settings → Environments → staging
2. Configure:
   - ❌ Required reviewers: None (auto-deploy)
   - ❌ Wait timer: None
   - ✅ Deployment branches: `develop` only
   - ✅ Environment secrets: (same keys, test tier)

---

## Monitoring Integration

### Sentry Error Tracking

```yaml
- name: Create Sentry release
  if: github.ref == 'refs/heads/main'
  uses: getsentry/action-release@e769183448303de84c5a06aaaddf9da7be26d6c7 # v1.7.0
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: qaitalks
    SENTRY_PROJECT: cv-review-tool
  with:
    environment: production
    version: ${{ github.sha }}
```

### Lighthouse CI Performance Monitoring

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@2f5a7c6f6e3b88b94d72b0e64068fc7e7dfc0f47 # v12.1.0
  with:
    urls: |
      https://qaitalks.com/cv-review
    uploadArtifacts: true
    temporaryPublicStorage: true
```

**Thresholds:**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥95

---

## Workflow Validation

### Actionlint (Local Development)

```bash
# Install actionlint
brew install actionlint  # macOS
# or
npm install -g actionlint

# Lint workflows
actionlint .github/workflows/*.yml

# Example output:
# .github/workflows/ci-cd.yml:10:5: "actions/checkout@v4" should be pinned to SHA [action-version]
```

### Pre-commit Hook (Optional)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/rhysd/actionlint
    rev: v1.7.1
    hooks:
      - id: actionlint
```

---

## Secrets Management

### Required GitHub Secrets

```bash
# Repository Secrets (Settings → Secrets and variables → Actions)
CLOUDFLARE_API_TOKEN=***      # From Cloudflare dashboard
CLOUDFLARE_ACCOUNT_ID=***     # From Cloudflare dashboard
CODECOV_TOKEN=***             # From codecov.io (optional)
SENTRY_AUTH_TOKEN=***         # From sentry.io (optional)
SLACK_WEBHOOK_URL=***         # For deploy notifications (optional)
```

### Environment Secrets (Production)

```bash
# Production environment secrets (Settings → Environments → production → Secrets)
GEMINI_API_KEY=***            # From aistudio.google.com
HF_API_KEY=***                # From huggingface.co
SENTRY_DSN=***                # From sentry.io (optional)
```

### Secret Rotation Policy

- API tokens: Rotate every 90 days
- AI API keys: Rotate on security incident (not scheduled)
- OIDC tokens: Short-lived (auto-expire after 1 hour)

---

## Performance Benchmarks

### Current Pipeline Duration (Estimated)

| Job | Duration | Parallelizable |
|-----|----------|----------------|
| lint-and-format | 1 min | ✅ Yes |
| security-scan | 3 min | ✅ Yes |
| unit-tests | 2 min | ✅ Yes |
| build | 3 min | ✅ Yes |
| e2e-tests (3 browsers) | 5 min | ✅ Yes (matrix) |
| deploy-staging | 2 min | ❌ No (depends on all) |

**Total Pipeline Time:** ~8 minutes (with parallelization)

### Optimization Goals

- Reduce to <5 minutes for typical PRs (cache hits)
- Deploy to staging in <10 minutes total
- Deploy to production in <15 minutes (includes approval wait)

---

## Rollback Workflow (Automated)

### Manual Rollback Trigger

```yaml
# .github/workflows/rollback.yml
name: Rollback Production

on:
  workflow_dispatch:
    inputs:
      commit_sha:
        description: 'Commit SHA to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      deployments: write
    environment:
      name: production
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
        with:
          ref: ${{ inputs.commit_sha }}
      
      - name: Deploy previous version
        uses: cloudflare/pages-action@f0a1cd58cd66095dee69bfa18fa5efd1dde93bca # v1.5.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: qaitalks
          directory: .vercel/output
          branch: main
      
      - name: Notify rollback
        run: echo "⏮️ Rolled back to commit ${{ inputs.commit_sha }}"
```

**Usage:**
1. Go to Actions → Rollback Production
2. Enter commit SHA (e.g., `abc123def`)
3. Click "Run workflow"
4. Approve deployment (2 reviewers required)

---

## Related Documentation

- **Deployment Strategy:** [deployment-strategy.md](./deployment-strategy.md)
- **Security Review:** [security-review.md](./security-review.md)
- **Rollout Plan:** [rollout-plan.md](./rollout-plan.md)

**Status:** ✅ CI/CD Enhancement Plan Complete  
**Next:** Create seo-strategy.md  
**Last Updated:** February 9, 2026
