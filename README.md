# QAi Talks - Educational AI Platform

## 🚀 Quick Start

This is a **full-stack Next.js application** teaching AI and technology education. Built with React 19, TypeScript, Tailwind CSS, Prisma, and tested with Playwright.

### Prerequisites
- Node.js 18+ installed
- `npm` package manager

### Start Development
```bash
cd next-app
npm install              # Install dependencies
npm run dev             # Start dev server at localhost:3000
npm run db:seed        # Seed database with sample data
```

**That's it!** Open [localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
QAi Talks/
├── next-app/                    # Main Next.js application
│   ├── app/                     # Next.js App Router (pages + API routes)
│   ├── components/              # React components
│   ├── lib/                     # Utility functions, auth, database
│   ├── __tests__/               # Unit tests (Jest)
│   ├── e2e/                     # E2E tests (Playwright)
│   ├── prisma/                  # Database schema and migrations
│   └── public/                  # Static assets
├── .agents/                     # GitHub Copilot skills & instructions
└── [Documentation files]        # Setup & reference guides
```

---

## 🎯 Key Features

- ✅ **Blog System** — 11 technical articles with professional SVG images
  - 📖 **Reading Time Estimates** — Word count-based reading time on all posts
  - 🏷️ **Category Badges** — Color-coded categories (Testing, Database, Frontend, Security, SEO, Accessibility, etc.)
  - 📑 **Table of Contents** — Auto-extracted headings with smooth scroll links on detail pages
  - 📤 **Social Sharing** — Share buttons for Twitter/X and LinkedIn
  - 💾 **Complete Content** — 2000-4000 word posts with internal cross-links
- ✅ **Course Curriculum** — Comprehensive 12-week learning program
- ✅ **Responsive Design** — Mobile, tablet, desktop optimized
- ✅ **Database** — SQLite (dev), PostgreSQL (production), 11 blog posts seeded
- ✅ **Testing** — Playwright E2E + Jest unit tests
- ✅ **Accessibility** — WCAG 2.1 Level AA compliant
- ✅ **SEO Optimized** — Meta tags, structured data, fast performance

---

## 🔧 Essential Commands

### Development
```bash
npm run dev              # Start dev server with hot reload
npm run build           # Build for production
npm run start           # Start production server
```

### Testing
```bash
npm run test            # Run unit tests
npm run test:watch     # Watch mode for unit tests
npm run test:e2e       # Run E2E tests
npm run test:e2e:ui    # Interactive E2E test UI (great for debugging)
```

### Database
```bash
npx prisma studio                      # Visual database browser
npx prisma migrate dev --name change   # Create database migration
npm run db:seed                        # Seed database
```

### Code Quality
```bash
npm run lint            # Check code quality
npm run lint:fix        # Auto-fix linting issues
npm run type-check     # Check TypeScript errors
```

---

## 📚 Documentation

For detailed guides on specific topics, see:

| Topic | File | Use When |
|-------|------|----------|
| Frontend & Backend Development | [.agents/skills/development/DEVELOPMENT.md](.agents/skills/development/DEVELOPMENT.md) | Adding pages, components, API routes |
| Database & Prisma | [.agents/skills/database/DATABASE.md](.agents/skills/database/DATABASE.md) | Modifying schema, writing queries |
| Testing (Playwright + Jest) | [.agents/skills/testing/TESTING.md](.agents/skills/testing/TESTING.md) | Writing tests, debugging failures |
| Security (Auth, validation) | [.agents/skills/security/SECURITY.md](.agents/skills/security/SECURITY.md) | Building secure features |
| Accessibility (WCAG 2.1) | [.agents/skills/accessibility/ACCESSIBILITY.md](.agents/skills/accessibility/ACCESSIBILITY.md) | Making features accessible |
| SEO & Performance | [.agents/skills/seo/SEO.md](.agents/skills/seo/SEO.md) | Optimizing for search & speed |
| Visual Design System | [.agents/skills/design/DESIGN.md](.agents/skills/design/DESIGN.md) | Colors, typography, spacing |
| Deployment Guide | [DEPLOYMENT.md](DEPLOYMENT.md) | Deploying to production |
| GitHub Setup | [GITHUB_SETUP.md](GITHUB_SETUP.md) | Repository configuration |
| Branching & Git Workflow | [BRANCHING.md](BRANCHING.md) | Branch naming strategy |

---

## 🤖 GitHub Copilot Integration

This project is optimized for GitHub Copilot code generation. Copilot skills are organized in `.agents/`:

```
.agents/
├── .copilot-instructions.md     # Main Copilot guidelines
└── skills/                      # Domain-specific skills
    ├── development/
    ├── database/
    ├── testing/
    ├── security/
    ├── accessibility/
    ├── seo/
    └── design/
```

For comprehensive Copilot instructions, see [.agents/.copilot-instructions.md](.agents/.copilot-instructions.md)

---

## 📊 Project Status

| Component | Status |
|-----------|--------|
| Frontend (Next.js + React 19) | ✅ Complete |
| Backend (API + Authentication) | ✅ Complete |
| Database (Prisma + SQLite/PostgreSQL) | ✅ Complete |
| E2E Testing (Playwright) | ✅ Complete |
| Unit Testing (Jest) | ✅ Complete |
| Accessibility (WCAG 2.1 AA) | ✅ Complete |
| SEO Optimization | ✅ Complete |
| Documentation | ✅ Complete |
| CI/CD (GitHub Actions) | 🔄 In Progress |
| Monitoring (Sentry + Analytics) | 🔄 Planned |

---

## ⚙️ Tech Stack

**Frontend**
- Next.js 16 with React 19
- TypeScript (strict mode)
- Tailwind CSS
- React Hook Form + zod validation

**Backend**
- Next.js API Routes
- NextAuth.js v4 (OAuth + email/password)
- REST API architecture

**Database**
- Prisma ORM
- SQLite (development)
- PostgreSQL (production)

**Testing**
- Playwright for E2E browser automation
- Jest for unit testing
- React Testing Library

**Hosting**
- Cloudflare Pages (primary)
- Vercel (backup option)

---

## 🔒 Environment Setup

Create `.env.local` in `next-app/` with:

```env
# Database
DATABASE_URL="file:./dev.db"        # SQLite (dev)

# NextAuth.js
NEXTAUTH_SECRET="your-random-string-generated-by-openssl"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## 🎬 For Video Creators

This project is structured for clear, step-by-step video tutorials:

1. **Clear Architecture** — Easy to explain structure and patterns
2. **Well-Documented** — Guides in `.agents/skills/` for reference
3. **Test Coverage** — Show working features via tests
4. **Progressive Complexity** — Start simple, build features incrementally
5. **GitHub Copilot Ready** — Use Copilot for code generation
6. **Production Ready** — Deploy to Cloudflare Pages or Vercel

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run tests: `npm run test && npm run test:e2e`
4. Commit with clear messages
5. Push and create a pull request

See [BRANCHING.md](BRANCHING.md) for detailed git workflow.

---

## 📞 Support

- 📚 Check documentation in `.agents/skills/` directory
- 🐛 See [DEBUG_REPORT.md](DEBUG_REPORT.md) for known issues
- 💬 Review test files in `e2e/` for code examples
- 🔍 Search relevant guides using keywords from this README

---

**Started:** January 2026  
**Last Updated:** February 8, 2026  
**Node Version:** 18+ required  
**License:** MIT

---

**Ready to start?** Run `npm run dev` in the `next-app/` folder! 🚀
