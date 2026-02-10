# QAi Talks Documentation Hub

Complete technical documentation organized by task and technology.  

---

## ⚡ Quick Start

**New to the project?** Start here:

| What You Need | Where to Go |
|---------------|-------------|
| **Set up dev environment** | [DEVELOPMENT.md](DEVELOPMENT.md) → [Quick Start](DEVELOPMENT.md#quick-start) |
| **Run the app locally** | [../README.md](../README.md) → Quick Start section |
| **Deploy to production** | [DEPLOYMENT.md](DEPLOYMENT.md) → Initial Setup |
| **Common errors/fixes** | [../.agents/context/common-pitfalls.md](../.agents/context/common-pitfalls.md) |

**For AI Agents:**
- Read [../.agents/context/quick-reference.md](../.agents/context/quick-reference.md) FIRST (250 lines of essential context)
- Navigate to [SKILLS.md](SKILLS.md) for AI task skills and documentation index

---

## 📚 Documentation by Task

### 🚀 Getting Started
- **[../README.md](../README.md)** — Project overview, quick start, key features
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Frontend/backend development guide, best practices
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** — Directory structure, file organization
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** — Fast lookup for commands and patterns

### 🛠️ Building Features
- **[DATABASE.md](DATABASE.md)** — Prisma ORM, migrations, schema design
- **[DESIGN.md](DESIGN.md)** — Blueprint design system, color palette, typography
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** — WCAG 2.1 compliance, ARIA, keyboard navigation
- **[SEO.md](SEO.md)** — Metadata, structured data, performance optimization

### 🔒 Quality & Security
- **[TESTING.md](TESTING.md)** — Playwright E2E, Jest unit tests, CI/CD integration
- **[SECURITY.md](SECURITY.md)** — XSS prevention, CSRF, authentication, data protection
- **[PRODUCTION_READINESS.md](PRODUCTION_READINESS.md)** — Pre-launch checklist, monitoring

### 🚢 Deployment & Operations
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Cloudflare Pages, D1 database, CI/CD pipeline
- **[CI-CD.md](CI-CD.md)** — GitHub Actions, automated testing, deployment workflow
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** — Repository setup, secrets, branch protection
- **[BRANCHING.md](BRANCHING.md)** — Git workflow, feature branches, merge strategy

---

## 🔍 Find Documentation by Technology

| Technology | Primary Doc | Related Docs |
|------------|-------------|--------------|
| **Next.js 16** | [DEVELOPMENT.md](DEVELOPMENT.md) | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md), [QUICK_REFERENCE.md](QUICK_REFERENCE.md) |
| **React 19** | [DEVELOPMENT.md](DEVELOPMENT.md) | [ACCESSIBILITY.md](ACCESSIBILITY.md), [TESTING.md](TESTING.md) |
| **TypeScript** | [DEVELOPMENT.md](DEVELOPMENT.md) | [DATABASE.md](DATABASE.md) |
| **Tailwind CSS** | [DESIGN.md](DESIGN.md) | [DEVELOPMENT.md](DEVELOPMENT.md), [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| **Prisma ORM** | [DATABASE.md](DATABASE.md) | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **Playwright** | [TESTING.md](TESTING.md) | [CI-CD.md](CI-CD.md) |
| **Cloudflare** | [DEPLOYMENT.md](DEPLOYMENT.md) | [CI-CD.md](CI-CD.md) |
| **GitHub Actions** | [CI-CD.md](CI-CD.md) | [GITHUB_SETUP.md](GITHUB_SETUP.md) |

---

## 📖 How to Find What You Need

### "I want to..."
- **...add a new page** → [../.agents/skills/page-creation/SKILL.md](../.agents/skills/page-creation/SKILL.md)
- **...modify the database** → [../.agents/skills/database-changes/SKILL.md](../.agents/skills/database-changes/SKILL.md)
- **...create a component** → [../.agents/skills/component-patterns/SKILL.md](../.agents/skills/component-patterns/SKILL.md)
- **...write a blog post** → [../.agents/skills/blog-writing/SKILL.md](../.agents/skills/blog-writing/SKILL.md)
- **...plan a new feature** → [../.agents/skills/feature-planning-workflow/SKILL.md](../.agents/skills/feature-planning-workflow/SKILL.md)
- **...fix a bug** → [../.agents/context/common-pitfalls.md](../.agents/context/common-pitfalls.md)
- **...deploy to production** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **...set up CI/CD** → [CI-CD.md](CI-CD.md)
- **...improve accessibility** → [ACCESSIBILITY.md](ACCESSIBILITY.md)
- **...optimize SEO** → [SEO.md](SEO.md)
- **...secure the app** → [SECURITY.md](SECURITY.md)
- **...write tests** → [TESTING.md](TESTING.md)

### "I'm getting an error..."
1. Check [../.agents/context/common-pitfalls.md](../.agents/context/common-pitfalls.md) for quick fixes
2. Search relevant doc (dev server → [DEVELOPMENT.md](DEVELOPMENT.md), database → [DATABASE.md](DATABASE.md), etc.)
3. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common commands

### "I need to understand..."
- **System architecture** → [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Data models** → [DATABASE.md](DATABASE.md)
- **Design system** → [DESIGN.md](DESIGN.md)
- **Security practices** → [SECURITY.md](SECURITY.md)
- **Testing strategy** → [TESTING.md](TESTING.md)
- **Deployment process** → [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🗂️ Archive

Historical documentation preserved in [archive/](archive/):
- **ARCHITECTURE_CLEANUP.md** — Architecture cleanup report (Feb 8, 2026)
- **CLEAN_PROJECT_SUMMARY.md** — Project cleanup summary
- **DEBUG_REPORT.md** — Comprehensive debugging report
- **DEBUG_SUMMARY.md** — Debugging executive summary
- **DOCUMENTATION_UPDATE_SUMMARY.md** — Documentation reorganization log
- **LATEST_UPDATES.md** — Blog system enhancement log (Feb 9, 2026)
- **NEXTJS_SETUP.md** — Archived Next.js configuration guide
- **FULLSTACK_PLAN.md** — Archived architecture plan
- **ways-of-work/** — Feature planning documents (CV Review Tool)

See [archive/README.md](archive/README.md) for archive details.

---

## 🤖 AI Agent Guide

**If you're an AI agent, follow this workflow:**

1. **Start Session:** Read [../.agents/context/quick-reference.md](../.agents/context/quick-reference.md) (250 lines of essential context)
2. **For Specific Tasks:** Invoke relevant skill from [SKILLS.md](SKILLS.md)
3. **For Deep Dives:** Consult comprehensive docs above
4. **For Troubleshooting:** Check [../.agents/context/common-pitfalls.md](../.agents/context/common-pitfalls.md)

**Result:** 4-5x faster context loading vs reading full documentation.

---

**Documentation Version:** 2.0 (AI-optimized)  
**Last Updated:** February 9, 2026  
**Active Documentation Files:** 16  
**Archived Files:** 10
