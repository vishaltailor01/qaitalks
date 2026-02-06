# QAi Talks - Project Skills & Best Practices

## Current Project State
- **Frontend:** Static HTML5 + inline CSS + minimal vanilla JS
- **Generation:** Stitch MCP (AI-powered design-to-code)
- **Hosting:** Static file server (scalable to CDN later)
- **Planned:** Migration to Next.js (full-stack)

---

## 1. Development

### Frontend (Current: Static HTML)
- **HTML5 Semantics** — Proper use of semantic tags (`<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`) for structure & accessibility. Verify in W3C Validator.
- **CSS3 Grid & Flexbox** — Responsive layout without frameworks. Use `auto-fit`/`auto-fill` for flexible grids.
- **CSS Custom Properties (Variables)** — Centralized in `:root` for colors, spacing, fonts. Example: `--deep-blueprint: #0A2540`.
- **Vanilla JavaScript** — Minimal interactions only (e.g., accordion toggles). Avoid jQuery or large libraries. Keep functions under 20 lines; add comments for complex logic.
- **Google Fonts Integration** — Use preconnect links (`<link rel="preconnect">`) to optimize font loading. Test with Network throttling (Slow 3G) in DevTools.
- **Responsive Design** — Mobile-first approach. Test breakpoints: 320px, 768px, 1024px, 1440px. Use viewport meta tag & fluid typography (calc(), clamp()).
- **Inline CSS Management** — Since CSS is inlined in HTML, use consistent formatting (2-space indent) and group styles by component. Add section comments. Example: `/* === Navigation === */`

### Backend (Planned: Next.js Migration)
- **Node.js / Express.js** — REST API development. Use async/await; validate input with libraries (e.g., zod, joi).
- **Next.js** — Full-stack JavaScript framework (planned migration target). App Router recommended; use API routes for backend logic.
- **Database Design** — PostgreSQL recommended for relational data (users, courses, blog metadata). Use migrations (Prisma or Knex). MongoDB as alternative for document-heavy content.
- **Authentication** — NextAuth.js preferred for Next.js. OAuth (GitHub, Google) for social login; JWT for API tokens. Encrypt sensitive data in `.env.local`.
- **API Security** — CORS whitelist, rate limiting (e.g., redis-ratelimit), input sanitization, SQL injection prevention via ORMs.

### Build & Deployment
- **Static Site Generation (SSG)** — Current: Stitch MCP generates to `queue/`, manual review, move to `site/public/`. Future: Next.js ISR (Incremental Static Regeneration).
- **Version Control** — Git strategy: `main` (production), `develop` (staging), feature branches (`feat/page-name`). Commit convention: `type(scope): description` (e.g., `feat(blog): add new post`).
- **CI/CD Pipelines** — GitHub Actions recommended: lint HTML, run Lighthouse audits, test links, deploy to Cloudflare Pages (recommended, domain already on Cloudflare) or Vercel/GitHub Pages. Example: validate before merging to `main`.
- **Environment Management** — Use `.env.local` (never commit). Store: API keys, database URLs, analytics tokens. Use `process.env` in Node.js; Cloudflare Workers use `env` binding. Access client-side carefully (prefix with `NEXT_PUBLIC_` in Next.js).

### Code Quality
- **DRY Principle** — Extract repeated HTML chunks as comments showing where they repeat (e.g., nav, footer). Future: React components. Current workaround: document "copy-paste areas" in DEBUG_REPORT.md.
- **Modular CSS** — Group inline CSS by component (e.g., /* Header Styles */, /* Hero Section */, /* Footer Styles */). Avoid style leaks; use specificity judiciously. Future: CSS Modules or Tailwind in Next.js.
- **Code Comments** — Mark complex selectors, media queries, and animations. Example: `/* 44x44px touch targets for accessibility */`. Future: add JSDoc for function definitions.
- **Testing** — Current: manual visual testing + Lighthouse audits. Future (Next.js): Jest unit tests, Playwright E2E tests for forms/auth, Percy for visual regression.

## 2. Security

### Frontend Security (Current: Static Site)
- **Content Security Policy (CSP)** — Set via server headers or `<meta>` tags (limited). Current: Not critical (static content); Future: Essential for Next.js with API routes. Example: `default-src 'self'; script-src 'self' 'unsafe-inline';`
- **Input Sanitization** — Current: No user input. Future: Sanitize all form inputs before sending to API. Use libraries like DOMPurify or zod for validation.
- **HTTPS Only** — Enforce HTTPS everywhere. Use HSTS headers. Current: Deploy to Vercel/GitHub Pages (automatic). Future: Set `Strict-Transport-Security: max-age=31536000`.
- **XSS Prevention** — Current: No dynamic content injection. Future: Use Next.js built-in escaping; avoid `dangerouslySetInnerHTML`. Use `textContent` instead of `innerHTML`.
- **CSRF Protection** — Current: Static site (no forms). Future: Next.js auto-includes CSRF tokens for API routes; validate on server-side.
- **Dependency Audits** — Current: Google Fonts only (no npm). Future: Run `npm audit` in CI/CD pipeline; fix critical/high-severity issues before deploy.

### Backend Security (Planned: Post-Migration)
- **Authentication & Authorization** — Use NextAuth.js for user sessions. Implement role-based access control (RBAC): admin, mentor, student. Verify permissions on every API endpoint.
- **Password Hashing** — Use bcrypt (10+ rounds) or Argon2. Never store plaintext. Example: `bcrypt.hashSync(password, 10)`.
- **Rate Limiting** — Implement per IP/user: login attempts (5/min), API calls (100/min). Use Upstash Redis or similar.
- **SQL Injection Prevention** — Use Prisma ORM or parameterized queries. Never concatenate user input into SQL strings.
- **Secrets Management** — Store in `.env.local` (never commit). Use Vercel Environment Variables UI for production. Never log secrets.
- **CORS Configuration** — Whitelist specific origins: `https://qaitalks.com`, `https://www.qaitalks.com`. Avoid `*` in production. Example: `credentials: 'include'` for cookies.
- **Logging & Monitoring** — Use Sentry for error tracking. Log failed auth attempts, API errors. Monitor with uptime checkers (e.g., UptimeRobot).

### Infrastructure Security
- **Firewall & Network Segmentation** — Current: Vercel/GitHub Pages handles. Future: If self-hosting, restrict database access to app server only. Use security groups (AWS) or firewall rules.
- **SSL/TLS Certificates** — Current: Vercel/GitHub Pages (automatic). Future: Use Let's Encrypt (free) or certificate authority. Monitor expiration; auto-renew.
- **Regular Updates** — Current: None required (static). Future: Update Node.js, Next.js, dependencies monthly. Use Dependabot (GitHub) for automated PRs.
- **Backup & Disaster Recovery** — Current: Git is backup. Future: Daily database backups (AWS RDS automatic? PostgreSQL pg_dump). Test restore procedures quarterly.

## 3. SEO (Search Engine Optimization)

### On-Page SEO (Critical: Educational Site)
- **Meta Tags** — `<title>` (60 chars), `<meta name="description">` (160 chars). Example: `title: "SDET Curriculum | QAi Talks"`; `description: "Master QA automation from basics to architecture."`. **Audit:** Use [SEO Inspector](https://www.seoinspector.com/) or Lighthouse.
- **Open Graph Tags** — Add `og:title`, `og:description`, `og:image` (1200x630px), `og:url`. Test with [Facebook OG Debugger](https://developers.facebook.com/tools/debug/).
- **Canonical Tags** — Add to prevent duplicate content. Example: `<link rel="canonical" href="https://qaitalks.com/blog/contract-testing.html">`.
- **Headings Hierarchy** — One `<h1>` per page. Nest logically: `<h1>` → `<h2>` → `<h3>`. Avoid skipping levels. **Audit:** axe DevTools.
- **Alt Text for Images** — Descriptive, 100-125 chars. Example: `alt="QAi Talks blueprint design showing contract testing concepts"`. Include keywords naturally.
- **Internal Linking** — Link blog posts to curriculum sections. Use anchor text: "Learn more about test design" (not "click here"). Target: 3-5 internal links per page.
- **URL Structure** — Lowercase, hyphens, readable. Examples: `/blog/contract-testing`, `/curriculum/advanced`. Avoid query strings (`?id=123`).
- **Mobile Friendliness** — Responsive viewport, 44x44px touch targets. Test: DevTools → toggle device toolbar → test on mobile.
- **Structured Data (JSON-LD)** — Add for blog posts (Article), courses (Course), organization (Organization). Use [Schema.org](https://schema.org/) markup.

### Technical SEO (Current & Ongoing)
- **Page Speed** — Target: LCP < 2.5s, FID < 100ms, CLS < 0.1. Optimize: Compress images (TinyPNG), inline critical CSS, preload fonts. **Baseline:** Run Lighthouse monthly.
  - Current state check: Use [PageSpeed Insights](https://pagespeed.web.dev/) on all pages. Target Lighthouse score: 90+ (Performance).
- **Sitemap.xml** — Create and submit to Google Search Console. Format: standard XML. Update on each new page.
- **robots.txt** — Standard rules: `User-agent: *`, `Allow: /`, `Sitemap: https://qaitalks.com/sitemap.xml`. Disallow: `/admin/*`, `/private/*` (if applicable).
- **Core Web Vitals** — Monitor via Google Search Console → Core Web Vitals report. Target: All green (Good). Bottlenecks: unoptimized images, render-blocking CSS/JS, layout shifts.
- **SSL/TLS** — Current: Vercel/GitHub Pages (A grade). Future: Monitor SSL Labs score. Maintain A+ rating. Use HSTS headers.
- **Server Performance** — Current: Static files (instant). Future (API): Target < 200ms for API responses. Use CDN (Vercel Edge) for global distribution.

### Content SEO (Strategy)
- **Keyword Research** — Use tools: [Ahrefs](https://ahrefs.com/), [SEMrush](https://semrush.com/), [Google Trends](https://trends.google.com/). Target: "SDET", "test automation", "playwright", "qa architect". Aim for 1-2 primary keywords per page. Natural integration (not keyword stuffing).
- **Content Quality** — 1,500+ words for blog posts (educational). Use examples, code snippets, visuals. Answer common questions from target audience (SDET/QA leads). Original, not plagiarized. Goal: become a trusted resource.
- **Freshness** — Publish 2-4 blog posts/month. Update existing posts if information becomes outdated. Add "Last updated: [date]" to evergreen content.
- **Blog Strategy (Content Clusters)** — Hub-and-spoke model:
  - **Hub:** "Test Automation Best Practices" (cornerstone article)
  - **Spokes:** "Contract Testing", "Playwright at Scale", "POM Pattern Evolution" (specific topics linking back to hub)
  - Link spokes to hub; link hub to spokes. Target: 10-15 related articles per cluster.

## 4. Accessibility (a11y)

### WCAG 2.1 Compliance (Level AA target)

#### Perceivable
- **Color Contrast** — Minimum 4.5:1 for normal text, 3:1 for large text (AA standard).
- **Text Alternatives** — Alt text for images, captions/transcripts for videos.
- **Keyboard Navigation** — All interactive elements reachable via Tab key; logical tab order.
- **Focus Indicators** — Visible focus states on buttons, links, form fields.
- **Readable Text** — Use readable fonts, adequate line height (1.5+), text size guidelines.

#### Operable
- **Keyboard Accessible** — No keyboard traps; all functionality available via keyboard.
- **Sufficient Time** — No content that requires scrolling/interaction faster than user can manage.
- **Skip Links** — Allow users to skip repetitive content (e.g., navigation).
- **Touch Targets** — Buttons/links at least 44×44 pixels for mobile users.
- **Error Prevention** — Form validation with clear error messages.

#### Understandable
- **Language Declaration** — `<html lang="en">` for screen readers.
- **Heading Structure** — Proper hierarchy for screen readers to navigate.
- **Form Labels** — Every `<input>` has an associated `<label>`.
- **Error Messages** — Clear, actionable guidance for form validation errors.
- **Consistent Navigation** — Nav menus in consistent locations across pages.

#### Robust
- **Valid HTML** — Use semantic tags; validate with W3C Validator.
- **ARIA Attributes** — Supplement semantics with ARIA (`aria-label`, `aria-expanded`, etc.) only when needed.
- **Screen Reader Testing** — Test with NVDA (Windows), JAWS, or Safari+VoiceOver (macOS).

### Testing Tools
- **Lighthouse Accessibility Audit** — Built into Chrome DevTools.
- **axe DevTools** — Chrome/Firefox extension for accessibility issues.
- **WAVE** — WebAIM tool for accessibility evaluation.
- **Screen Readers** — NVDA (free, Windows), JAWS (commercial), VoiceOver (macOS).

## 5. Backend & Infrastructure (Planned: Post-Migration)

### API Design & Documentation
- **REST Conventions** — HTTP methods (GET, POST, PUT, DELETE), status codes (200, 201, 400, 401, 404, 500). Use consistent naming: `/api/v1/students`, `/api/v1/courses/{id}/modules`. Avoid `/getStudents`, `/fetchCourse`.
- **Request/Response Format** — JSON standard. Consistent structure: `{ "data": {...}, "error": null, "meta": { "page": 1 } }`. Example error: `{ "data": null, "error": { "code": "UNAUTHORIZED", "message": "Invalid token" } }`.
- **Versioning Strategy** — URL prefix (`/api/v1/`, `/api/v2/`) preferred over header versioning. Backward compatibility: support 2 versions. Deprecation timeline: announce 6 months before removal.
- **API Documentation** — Use OpenAPI 3.0 (Swagger). Auto-generate from code (e.g., Swagger UI via `@nestjs/swagger` or similar). Document: endpoints, parameters, request/response examples, error codes. Host on `/api/docs`.
- **Authentication & Authorization** — Bearer tokens (JWT). Include in `Authorization: Bearer <token>` header. Return 401 (unauthenticated) or 403 (forbidden). Validate on **every** endpoint.
- **Rate Limiting** — Per IP or per user: API calls (100/min), login attempts (5/min), signup (1/hour). Return 429 (Too Many Requests) with `Retry-After` header.
- **Input Validation** — Validate all inputs server-side (never trust client). Use zod, joi, or similar. Return 400 with specific field errors: `{ "error": "Validation failed", "details": [{ "field": "email", "message": "Invalid email format" }] }`.
- **Error Handling** — Consistent error codes: `INVALID_INPUT`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `SERVER_ERROR`. Log errors with request ID for debugging.
- **Pagination** — Standard: `?page=1&limit=20`. Response: `{ "data": [...], "pagination": { "total": 500, "page": 1, "limit": 20, "pages": 25 } }`.
- **CORS Configuration** — Whitelist specific origins. Example: 
  ```
  Access-Control-Allow-Origin: https://qaitalks.com
  Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
  Access-Control-Allow-Headers: Content-Type,Authorization
  Access-Control-Max-Age: 86400
  ```

### Database Design & Optimization
- **Schema Design** — PostgreSQL recommended. Use migrations (Prisma, Knex). Example tables: `users` (id, email, password_hash, created_at), `students` (user_id, enrollment_date), `courses` (id, title, description), `enrollments` (student_id, course_id, progress%).
  - Relationships: `users` 1→many `enrollments` 1→many `courses`. Use foreign keys with ON DELETE CASCADE for cleanup.
  - Indexes: Create on foreign keys, frequently queried fields (email, username). Example: `CREATE INDEX idx_courses_created_at ON courses(created_at DESC);`
- **Normalization & Denormalization** — Normalize: avoid data duplication. Denormalize selectively (e.g., cache student count on course row if frequently queried). Test performance before denormalizing.
- **Query Optimization** — Use `EXPLAIN ANALYZE` to inspect query plans. Avoid N+1 queries (prefetch/join related data). Example (bad): Loop fetching each course separately. Example (good): `SELECT ... FROM students JOIN courses ON ...`.
- **Connection Pooling** — Use connection pool (e.g., PgBouncer, Prisma's connection pooling). Settings: min 5, max 20 connections. Monitor usage.
- **Caching Strategy** — 
  - **Query Cache:** Redis for frequently accessed data (courses list, student profile). TTL: 5-30 min. Invalidate on update.
  - **Session Cache:** Redis for user sessions. TTL: 24 hours.
  - **HTTP Cache:** `Cache-Control: public, max-age=3600` for static API responses.
- **Backup & Recovery** — Daily snapshots (AWS RDS automatic?). Test restore annually. Point-in-time recovery enabled.
- **Data Privacy & Encryption** — Hash passwords (bcrypt, Argon2). Encrypt sensitive fields (SSN, payment info) at rest (use database encryption or library like `crypto-js`). Use TLS in transit (HTTPS).
- **Monitoring & Alerts** — Monitor: slow queries (> 1s), connection pool saturation, replication lag. Set alerts. Use tools: New Relic, DataDog, AWS CloudWatch.
- **Scaling Strategy** — Read replicas for scaling reads (course catalog, student progress views). Write to primary, read from replicas. Consider sharding by student_id if table grows beyond 1B rows.

### DevOps & Infrastructure
- **Containerization (Docker)** — 
  - Dockerfile structure: Multi-stage build (development → production). Example:
    ```dockerfile
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    
    FROM node:18-alpine
    WORKDIR /app
    COPY --from=builder /app/dist ./dist
    COPY package*.json ./
    RUN npm ci --production
    EXPOSE 3000
    CMD ["node", "dist/index.js"]
    ```
  - Image size: < 200 MB (use Alpine, not Debian base)
  - Security: Don't run as root; use `USER node`
- **Docker Compose** — For local development. Example: app + PostgreSQL + Redis. File: `docker-compose.yml`.
- **Container Orchestration (Kubernetes)** — Future: if scaling to multiple pods. Deploy on EKS (AWS), GKE (Google), or managed Kubernetes. Use Helm for templating. Key concepts: pods, services, deployments, ingress.
- **CI/CD Pipeline (GitHub Actions)** — Workflow example:
  1. Trigger: Push to `main` or PR to `develop`
  2. Build: Run tests, linting, type checking
  3. Build image: `docker build`, push to registry (Docker Hub, ECR)
  4. Deploy: `kubectl apply` or `vercel deploy` (if Vercel)
  5. Smoke test: Run basic E2E tests on deployed environment
- **Infrastructure as Code (IaC)** — Use Terraform or CloudFormation. Example: defining RDS instance, S3 bucket, security groups.
  - Benefits: Version-control infrastructure, reproducible deployments, disaster recovery
  - Tools: Terraform (provider-agnostic), AWS CloudFormation (AWS-specific)
- **Environment Parity** — Three environments: dev, staging, prod. Identical setup (same database version, Redis version, Node.js version). Staging = prod (same data, same scale testing).
  - Variables: Use `.env` files (dev) and secrets manager (prod). AWS Secrets Manager, Vercel Environment Variables.
- **Monitoring & Logging** — 
  - **Logs:** Centralize with ELK (Elasticsearch, Logstash, Kibana) or CloudWatch. Log format: JSON. Example: `{ "level": "error", "timestamp": "2026-02-06T10:30:00Z", "service": "auth", "message": "Login failed", "user_id": 123, "request_id": "abc123" }`.
  - **Metrics:** Track: CPU usage, memory, request latency, error rate. Tools: Prometheus + Grafana, DataDog, New Relic.
  - **Alerts:** Trigger on: error rate > 1%, latency p99 > 2s, CPU > 80%, disk > 90%. Alert to Slack/PagerDuty.
- **Load Balancing & Scaling** — 
  - **Horizontal scaling:** Multiple app instances behind load balancer (round-robin). Auto-scale based on CPU/memory.
  - **Vertical scaling:** Increase instance size if database bottleneck.
  - Tools: AWS ALB/NLB, NGINX, Vercel's built-in scaling.
- **Security & Network** — 
  - Firewall rules: Restrict database access to app subnet only. Disable public database endpoint.
  - VPC: Isolate app, database, cache on separate subnets.
  - SSL/TLS: HTTPS everywhere. Certificate auto-renewal (Let's Encrypt).
- **Disaster Recovery** — 
  - RTO (Recovery Time Objective): < 1 hour
  - RPO (Recovery Point Objective): < 15 min (data loss acceptable)
  - Test recovery quarterly: simulate database loss, restore from backup, verify application works
  - Document runbooks: incident response, failover procedures, rollback steps

---

## 6. Project-Specific Skills

### Stitch MCP Integration (Current Workflow)
- **Stitch Prompt Engineering** — Write visual descriptions (no code) in `next-prompt.md`. Include design system block from DESIGN.md Section 6. Be specific: "Hero section with navy background, cyan annotation circle highlighting key concept". Test: Generate, review screenshot in `queue/`.  
- **Design System Maintenance** — DESIGN.md is source of truth. Any visual change (color, font, spacing) must be updated here **first**, then propagated: update `next-prompt.md` block, regenerate pages via Stitch. Annual audit: compare generated pages to spec.
- **Baton System** — `next-prompt.md` = relay baton. Format: YAML frontmatter (`---page: name---`) + prompt body. **Critical rule:** Always update this file before finishing a task. Never leave it stale.
- **Asset Management** — Workflow: Stitch → `queue/{page}.html` + `queue/{page}.png` → Manual code review → Move to `site/public/{page}.html` → Update nav links in other pages → Commit. **Quality gate:** All links working, design matches Stitch screenshot.

### Design & UX
- **Blueprint Aesthetic** — Understand the project's visual language (rigid 8px/16px grid + cyan (#00D4FF) "human layer" annotations over navy (#0A2540) base). See DESIGN.md for complete spec.
- **Color Theory** — Enforce palette consistency:
  - Primary (navy): #0A2540 (text, headers, strong elements)
  - Accent (cyan): #00D4FF (annotations, highlights, system feedback)
  - CTA (amber): #FFB800 (buttons, actions)
  - Background (cloud): #F6F9FC (cards, sections)
  - Use CSS custom properties (`:root`) for all colors. Verify contrast ratios: `4.5:1` for text per WCAG AA.
- **Typography** — Inter (400, 500, 600, 700, 800, 900), JetBrains Mono (code), Indie Flower (hand-drawn accents). Line height: 1.5+ for body text. Font size: 16px baseline (responsive with `clamp()`).
- **Responsive Design** — Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop). Test with DevTools device emulation. No hard breaks in layout (use flexbox/grid auto-fit).
- **User Testing** — Current: Informal feedback from mentees. Future: A/B test curriculum landing pages, heat map tracking (Hotjar), user surveys (Typeform). Iterate based on conversion metrics.

### Documentation
- **Markdown Best Practices** — Write clear, well-structured documentation (SITE.md, DESIGN.md).
- **README Maintenance** — Keep setup, usage, and contribution guidelines up-to-date.
- **Changelog** — Document version history and breaking changes.
- **API Documentation** — If adding a backend, document endpoints, request/response formats.

### Performance Optimization
- **Image Optimization** — Use SVG for icons/logos; compress images; consider WebP.
- **CSS Minification** — Remove unused styles; inline critical CSS for above-the-fold content.
- **JavaScript Bundling** — Minimize bundle size; lazy-load heavy scripts.
- **Caching Strategies** — Browser caching headers, CDN caching, server-side caching.
- **Monitoring** — Use tools like Vercel Analytics or Google Analytics to track performance metrics.

### Domain Knowledge
- **QA Automation** — Understanding the target audience (SDETs, QA Architects) and their pain points.
- **Testing Frameworks** — Familiarity with Playwright, Selenium, E2E testing best practices.
- **DevOps Concepts** — CI/CD pipelines, containerization, infrastructure-as-code.
- **Software Architecture** — Design patterns, scalability, maintainability.

## 7. Tools & Extensions

### Development Environment
- **VS Code Extensions** — Prettier (formatting), ESLint (linting), Live Server (local testing).
- **Browser DevTools** — Chrome/Firefox DevTools for debugging, performance profiling, accessibility checks.
- **Git Tools** — GitHub Desktop, GitKraken, or CLI for version control.

### Testing & Quality
- **Playwright** — E2E testing framework.
- **Lighthouse** — Performance, accessibility, SEO audits.
- **axe DevTools** — Accessibility scans.
- **Jest** — Unit testing (if moving to Node.js/React).

### Monitoring & Analytics
- **Google Analytics** — User behavior, traffic sources, conversions.
- **Vercel Analytics** — Performance metrics, Core Web Vitals.
- **Sentry** — Error tracking and monitoring.

## 8. Best Practices Checklist

### Before Publishing (Every New Page)
- [ ] **HTML Valid:** Run through [W3C Validator](https://validator.w3.org/). Zero errors (warnings acceptable for style).
- [ ] **Lighthouse Score ≥ 90** across: Performance, Accessibility, Best Practices, SEO. [PageSpeed Insights](https://pagespeed.web.dev/).
  - Performance: < 3s LCP, < 0.1 CLS, < 100ms FID
  - Accessibility: WCAG AA (4.5:1 contrast, keyboard nav, ARIA)
  - Best Practices: HTTPS, no mixed content, modern APIs
  - SEO: Meta tags, structured data, mobile-friendly
- [ ] **No Console Errors/Warnings:** DevTools → Console → Filter by error/warning. Fix all.
- [ ] **Mobile Responsive:** DevTools device emulation (320, 768, 1024, 1440px). No overflow, readable text, touch targets ≥ 44x44px.
- [ ] **Keyboard Navigation:** Tab through entire page. Focus visible on all interactive elements. No keyboard traps.
- [ ] **Screen Reader Test:** NVDA (Windows) or VoiceOver (macOS). Test with Safari + VoiceOver minimum.
- [ ] **All Links Working:** Check navigation, internal links, external links. Use [broken-link-checker](https://www.npmjs.com/package/broken-link-checker) or manual testing.
- [ ] **Images Optimized:** Compressed with TinyPNG/ImageOptim. SVGs for icons/logos. Alt text descriptive (100-125 chars).
- [ ] **Meta Tags:** Title (60 chars), description (160 chars), OG tags (og:title, og:description, og:image, og:url). Verify with [SEO Inspector](https://www.seoinspector.com/).
- [ ] **HTTPS Enabled:** Current: automatic (Vercel/GitHub Pages). Future: HSTS headers.
- [ ] **Security Headers:** Future: Set CSP, X-Frame-Options, X-Content-Type-Options in middleware.
- [ ] **Brand Consistency:** Colors, fonts, spacing match DESIGN.md. Compare rendered page vs. Stitch screenshot.

### During Development (Code Standards)
- [ ] **DRY Principle:** No copy-paste HTML blocks (e.g., nav, footer). Document "reused sections" in code comments. Future: React components.
- [ ] **Consistent Naming:** CSS classes use kebab-case (`.hero-section`, `.cta-button`). HTML IDs lowercase, descriptive (e.g., `#about`, `#toc`).
- [ ] **Code Comments:** Mark complex CSS (media queries, animations), important calculations. Example: `/* 44x44px touch targets for WCAG accessibility */`.
- [ ] **Cross-Browser Testing:** Chrome, Firefox, Safari, Edge (if available). Responsive at 320, 768, 1024, 1440px.
- [ ] **Semantic HTML:** Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`. Validate structure.
- [ ] **Git Hygiene:** Clear commit messages: `feat(page): add about section` or `fix(nav): correct mobile breakpoint`. One feature per commit.
- [ ] **Documentation:** Update DEBUG_REPORT.md or relevant doc if changes affect structure/assets.

### After Deployment (Monitoring)
- [ ] **Monitor Uptime:** Use UptimeRobot (free) or Vercel monitoring. Alert if > 5min downtime.
- [ ] **Error Tracking:** Future: Sentry for API/runtime errors. Current: Check browser console logs periodically.
- [ ] **Analytics Setup:** Google Analytics or Vercel Analytics. Track: page views, bounce rate, scroll depth, CTA clicks. Review weekly.
- [ ] **User Feedback:** Monitor feedback form submissions (if applicable). Check social mentions. Quarterly user survey (Typeform).
- [ ] **Performance Monitoring:** Re-run Lighthouse monthly. Set threshold: must stay ≥ 85 across all metrics. Investigate regressions.
- [ ] **Schedule Audits:** Security audit (npm audit, external audit) quarterly. Accessibility audit annually. SEO audit quarterly.
- [ ] **Dependency Updates:** Monthly (minor/patch). Review changelogs before updating. Test in staging before production.

## 9. Quick Reference: Current vs. Future State

| Aspect | Current (Static) | Planned (Next.js) |
|--------|------------------|-------------------| 
| **Frontend** | Static HTML + inline CSS + vanilla JS | Next.js React components, Tailwind/CSS Modules |
| **Backend** | None | Cloudflare Workers + D1/Durable Objects |
| **Auth** | None | NextAuth.js or Cloudflare Access, OAuth |
| **Testing** | Manual + Lighthouse | Jest + Playwright E2E |
| **Deployment** | Cloudflare Pages (recommended) | Cloudflare Pages + Workers |
| **Monitoring** | None | Sentry + Cloudflare Analytics |
| **Scaling** | Static files (fast, edge CDN) | Workers (edge), D1 database, KV cache |

---

**Last Updated:** February 6, 2026  
**Maintainer:** QAi Talks Team  
**Next Review:** May 2026
