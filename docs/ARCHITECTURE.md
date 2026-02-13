# QaiTAlk Architecture Overview

## Stack
- **Frontend:** Next.js 16 (App Router, React 19, TypeScript strict)
- **Backend:** Next.js API routes, FastAPI (planned), Node.js runtime
- **Database:** PostgreSQL (via Prisma ORM)
- **Styling:** TailwindCSS
- **Auth:** NextAuth.js (GitHub, Google, Prisma adapter)
- **Testing:** Jest, Playwright, axe-core (a11y), Lighthouse CI
- **Deployment:** Cloudflare Pages + D1

## Key Modules
- **CV Review Tool:** AI-powered, streaming, Zod-validated, rate-limited, XSS/prompt-injection sanitized
- **Blog:** Static and dynamic blog post support, Prisma-backed
- **Curriculum:** Modular, accessible, responsive curriculum explorer
- **User:** GDPR endpoints for data export and deletion

## Security & Compliance
- Zod validation and sanitization on all user input
- Rate limiting on sensitive endpoints
- CSRF/origin checks on POST/PUT
- GDPR: Data export & deletion endpoints
- Auth required for all user data access

## CI/CD & Quality
- Lint, type-check, unit/integration/E2E tests
- Playwright a11y tests (axe-core)
- Lighthouse CI for performance & accessibility
- GitHub Actions workflows for all checks

## Extensibility
- Modular lib/ structure for business logic
- All API input/output types enforced
- Ready for Python/FastAPI migration (planned)

---
See `docs/PROJECT_STRUCTURE.md` and `docs/ways-of-work/plan/` for more details.
