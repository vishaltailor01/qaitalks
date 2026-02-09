# QAi Talks - Project Skills & Documentation

Master index for project documentation. Click below to navigate to domain-specific guides.

## 📋 Quick Overview

**Technology Stack:**
- **Frontend:** Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js with Prisma ORM
- **Database:** SQLite (dev), PostgreSQL (production)
- **Testing:** Playwright E2E testing + Jest unit tests
- **Hosting:** Cloudflare Pages (primary) or Vercel

**Project Status:** ✅ Core features complete | 🔄 Documentation reorganized into focused guides

---

## 📚 Documentation Guides

### [DEVELOPMENT.md](DEVELOPMENT.md) — Frontend & Backend Development
Complete guide for building features in Next.js 16 with React 19.

**Covers:**
- Next.js App Router, Server/Client Components, dynamic routing
- React 19 patterns, TypeScript best practices
- Tailwind CSS styling system and custom design tokens
- Form handling with zod validation
- API routes and request/response patterns
- Image optimization and performance tips
- Development workflow checklist

**Use when:** Adding pages, creating API endpoints, styling components

---

### [DATABASE.md](DATABASE.md) — Prisma ORM & Database Design
Complete guide to database architecture, queries, and optimization.

**Covers:**
- Prisma schema design and migrations
- CRUD operations with Prisma Client
- Query optimization (N+1 prevention, indexing)
- Database seeding strategies
- Connection pooling and performance tuning
- PostgreSQL setup for production
- Backup and disaster recovery
- Common troubleshooting scenarios

**Use when:** Modifying database schema, optimizing queries, adding models

---

### [SECURITY.md](SECURITY.md) — Frontend, Backend & Infrastructure Security
Comprehensive security best practices for production applications.

**Covers:**
- XSS prevention with React/JSX
- CSRF protection and authentication
- Content Security Policy (CSP) headers
- Backend input validation and SQL injection prevention
- Rate limiting and API security
- Environment variables and secrets management
- HTTPS, SSL/TLS, and certificate management
- Dependency auditing and vulnerability scanning
- Security checklist before deployment

**Use when:** Building authentication, API routes, enforcing security policies

---

### [SEO.md](SEO.md) — Search Engine Optimization
Complete SEO strategy for ranking in search engines.

**Covers:**
- On-page SEO: meta tags, headings, structured data
- Technical SEO: sitemaps, Core Web Vitals, page speed
- Content strategy: keyword research, evergreen content
- Heading hierarchy and HTML semantics
- Internal linking strategies
- Open Graph tags for social sharing
- Sitemap.xml and robots.txt generation
- Lighthouse performance auditing
- SEO monitoring and tools

**Use when:** Creating new pages, publishing blog posts, optimizing performance

---

### [ACCESSIBILITY.md](ACCESSIBILITY.md) — WCAG 2.1 Compliance (Level AA)
Complete accessibility guide for inclusive web applications.

**Covers:**
- WCAG 2.1 principles: Perceivable, Operable, Understandable, Robust
- Color contrast requirements (minimum 4.5:1)
- Keyboard navigation and focus management
- Screen reader testing with NVDA/VoiceOver
- Alt text for images and captions for media
- Form accessibility and error handling
- ARIA attributes and semantic HTML
- Accessibility testing tools (axe, Lighthouse, WAVE)
- Accessibility testing checklist

**Use when:** Building interactive components, fixing accessibility issues, testing pages

---

### [TESTING.md](TESTING.md) — E2E & Unit Testing (Playwright + Jest)
Complete guide to comprehensive testing automation and quality assurance.

**Covers:**
- **E2E Testing:** Playwright browser automation framework
- **Unit Testing:** Jest configuration and React Testing Library patterns
- Running tests: headless, UI mode, debug mode, coverage reports
- Writing test cases: navigating, clicking, filling forms, component assertions
- Assertions and waiting strategies
- Page Object Model patterns (optional)
- Test fixtures and authentication setup
- React component testing best practices
- CI/CD integration with GitHub Actions
- Test coverage goals (50% minimum) and best practices
- Troubleshooting flaky and timeout issues

**Use when:** Writing tests, debugging failing tests, setting up CI/CD, adding new components/utilities

---

### [ARCHITECTURE_CLEANUP.md](ARCHITECTURE_CLEANUP.md) — Project Architecture & Cleanup Log
Complete documentation of project cleanup, fixes, and architecture verification.

**Covers:**
- Issues identified and fixed
- CSS styling refactoring
- .gitignore and .env.example setup
- Project structure validation
- Build and test verification
- Pre-deployment checklist
- Architecture status and metrics

**Use when:** Understanding what was cleaned up, verifying project quality, reviewing fixes

---

## 🎯 Current Project State

| Component | Status | Notes |
|-----------|--------|-------|
| **Frontend (Next.js)** | ✅ Complete | Organized into ui/, layout/, sections/ structure |
| **Blog System** | ✅ Enhanced | 11 posts with SVG images, categories, reading time, TOC, shares |
| **Backend (API)** | ✅ Complete | Authentication, blog, courses endpoints |
| **Database** | ✅ Complete | Prisma with SQLite (dev), PostgreSQL ready, 11 blog posts seeded |
| **Testing (E2E)** | ✅ Complete | Playwright: 6 test spec files |
| **Testing (Unit)** | ✅ Complete | Jest: 10+ test cases with React Testing Library |
| **Documentation** | ✅ Complete | 12 focused domain files, all reorganized |
| **Architecture** | ✅ Clean | Cleaned and debugged (see ARCHITECTURE_CLEANUP.md) |
| **Deployment** | ✅ Ready | Cloudflare Pages primary, ready for production |
| **CI/CD** | 🔄 In Progress | GitHub Actions setup for Jest + Playwright |
| **Monitoring** | 🔄 Planned | Sentry + Cloudflare Analytics setup coming |

---

## 🚀 Quick Start

### New to the project?
1. Start with [DEVELOPMENT.md](DEVELOPMENT.md) for technology understanding
2. Read [DESIGN.md](DESIGN.md) for visual design system
3. Run `npm run dev` in `next-app/` folder to start dev server

### Adding a new feature?
1. Check [DEVELOPMENT.md](DEVELOPMENT.md) for page/API patterns
2. Place components in appropriate directories: `ui/`, `layout/`, or `sections/`
3. If database changes needed, see [DATABASE.md](DATABASE.md)
4. Write component tests in `__tests__/components/` and utility tests in `__tests__/lib/`
5. Run tests: `npm run test` (unit) and `npm run test:e2e` (E2E)
6. Before publishing, use [SEO.md](SEO.md) and [ACCESSIBILITY.md](ACCESSIBILITY.md) checklists

### Fixing a bug?
1. Run E2E tests to understand expected behavior: `npm run test:e2e:ui`
2. Debug in interactive mode: `npm run test:e2e:debug`
3. Check console for errors and security warnings

### Optimizing performance?
1. Run Lighthouse audit through Chrome DevTools
2. Check [DEVELOPMENT.md](DEVELOPMENT.md) for optimization patterns
3. Review [SEO.md](SEO.md) for Core Web Vitals guidance
4. Run [DATABASE.md](DATABASE.md) query optimization tips if API is slow

---

## 📖 Project-Specific Resources

- **Design System** → [DESIGN.md](DESIGN.md) — Colors, typography, animations, layout grid
- **Current Status** → [DEBUG_REPORT.md](DEBUG_REPORT.md) — Known issues and workarounds
- **Deployment Steps** → [DEPLOYMENT.md](DEPLOYMENT.md) — How to deploy to Vercel
- **Git Workflow** → [BRANCHING.md](BRANCHING.md) — Branch naming and merge strategy
- **GitHub Setup** → [GITHUB_SETUP.md](GITHUB_SETUP.md) — Repository configuration

---

## ✅ Before Publishing Checklist

Required before deploying any new feature:

- [ ] **Tests pass:** `npm run test:e2e` succeeds
- [ ] **No console errors:** DevTools → Console is clean
- [ ] **Lighthouse ≥ 90:** Run PageSpeed Insights on final URL
- [ ] **Accessibility:** Tested keyboard navigation and screen reader
- [ ] **Mobile responsive:** Tested on 320px, 768px, 1440px viewports
- [ ] **SEO complete:** Meta tags, Open Graph, structured data added
- [ ] **Links verified:** All internal and external links working
- [ ] **Images optimized:** Compressed and have descriptive alt text
- [ ] **Security reviewed:** No sensitive data exposed, HTTPS enabled
- [ ] **Documentation updated:** Added new pages to navigation

---

## 🔗 Documentation Map

```
QAi Talks Project
├── 📋 SKILLS.md (YOU ARE HERE)
│   Master index linking all documentation
│
├── 📚 Domain-Specific Guides
│   ├── DEVELOPMENT.md — Frontend & Backend features
│   ├── DATABASE.md — Prisma ORM & data layer
│   ├── SECURITY.md — Auth, validation, secrets
│   ├── SEO.md — Search engine optimization
│   ├── ACCESSIBILITY.md — WCAG 2.1 compliance
│   └── TESTING.md — Playwright E2E tests
│
├── 🛠️ Supporting Documentation
│   ├── ARCHITECTURE_CLEANUP.md — Architecture fixes & cleanup log
│   ├── DESIGN.md — Visual design system
│   ├── DEBUG_REPORT.md — Known issues
│   ├── CLEAN_PROJECT_SUMMARY.md — Project status report
│   ├── PROJECT_STRUCTURE.md — Directory organization
│   ├── DEPLOYMENT.md — How to deploy
│   ├── BRANCHING.md — Git workflow
│   ├── GITHUB_SETUP.md — Repository config
│   └── FULLSTACK_PLAN.md — Project overview
│
└── ⚙️ Configuration Files
    ├── .env.example — Environment variables template
    ├── .gitignore — Git ignore patterns
    ├── next.config.ts — Next.js settings
    ├── package.json — Dependencies & scripts
    ├── tsconfig.json — TypeScript config
    ├── tailwind.config.ts — Styling setup
    └── prisma/schema.prisma — Database schema
```

---

## 🛠️ Common Commands

**Development:**
```bash
npm run dev              # Start dev server at localhost:3000
npm run build           # Build for production
npm run start           # Start production server
```

**Testing:**
```bash
# Unit Tests (Jest)
npm run test            # Run Jest unit tests
npm run test:watch      # Run Jest in watch mode
npm run test:coverage   # Generate coverage report

# E2E Tests (Playwright)
npm run test:e2e        # Run all E2E tests (headless)
npm run test:e2e:ui     # Run E2E tests with Playwright UI
npm run test:e2e:debug  # Debug single test in browser
```

**Database:**
```bash
npx prisma migrate dev --name <name>  # Create + apply migration
npx prisma db seed                     # Seed database
npx prisma studio                      # Open database GUI
```

**Linting & Format:**
```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking
```

---

## 📞 Contact & Maintenance

**Last Updated:** February 8, 2026  
**Maintainer:** QAi Talks Team  
**Next Review:** May 2026  

**Questions?**
- Check relevant documentation file linked above
- Review [DEBUG_REPORT.md](DEBUG_REPORT.md) for known issues
- See test files in `e2e/` for code examples
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for patterns and best practices

---

**Status:** ✅ Documentation reorganization complete. All domain-specific guides created and indexed here.

## 🔗 Documentation Map

```
SKILLS.md (This file - Master Index)
├─ DEVELOPMENT.md (Frontend/Backend patterns)
├─ DATABASE.md (Prisma, queries, optimization)
├─ SECURITY.md (Frontend/backend/infra security)
├─ SEO.md (Search engine optimization)
├─ ACCESSIBILITY.md (WCAG 2.1 compliance)
├─ TESTING.md (E2E with Playwright)
├─ DESIGN.md (Visual design system)
├─ DEPLOYMENT.md (How to deploy)
├─ BRANCHING.md (Git workflow)
└─ DEBUG_REPORT.md (Known issues)
```

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Production build
npm start               # Run production build locally

# Testing
npm run test:e2e        # Run E2E tests headless
npm run test:e2e:ui     # Interactive test UI (recommended)
npm run test:e2e:debug  # Step-through debugging
npm run test:e2e:report # View test report

# Database
npx prisma migrate dev  # Create migration
npx prisma studio      # Visual database browser
npm run db:seed        # Seed database with initial data

# Linting
npm run lint           # Check code quality
npm run lint:fix       # Auto-fix lint issues
```

---

## 📞 Contact & Maintenance

**Last Updated:** February 8, 2026  
**Maintainer:** QAi Talks Team  
**Next Review:** May 2026  

**Questions?**
- Check relevant documentation file linked above
- Review [DEBUG_REPORT.md](DEBUG_REPORT.md) for known issues
- See test files in `e2e/` for code examples
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for patterns and best practices

---

**Status:** ✅ Documentation reorganization complete. All domain-specific guides created and indexed here. 
