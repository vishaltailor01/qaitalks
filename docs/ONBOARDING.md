# QaiTAlk Developer Onboarding

## 1. Prerequisites
- Node.js 20+, npm 9+
- PostgreSQL (local or Supabase)
- Cloudflare account (for deployment)

## 2. Setup
```bash
# Clone repo
 git clone <repo-url>
 cd QaiTAlk/next-app

# Install dependencies
 npm ci

# Setup environment variables
 cp .env.example .env
 # Fill in DB, Auth, and API keys

# Run database migrations
 npx prisma migrate dev --name init

# Seed test data
 npm run db:seed

# Start dev server
 npm run dev
```

## 3. Testing & Quality
- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Accessibility: `npx playwright test e2e/a11y.spec.ts`
- Performance: `npx lhci autorun --config=lighthouserc.js`

## 4. Key Architecture
- See `docs/ARCHITECTURE.md` for stack and module overview
- All user input is Zod-validated and sanitized
- Auth required for user data endpoints
- GDPR endpoints: `/api/user/data` (GET for export, DELETE for removal)

## 5. Contribution
- Follow code style and naming conventions in `.github/copilot-instructions.md`
- Write tests for all new features
- Document complex logic inline and in `docs/`
- Use feature branches and PRs for all changes

---
For more, see `docs/PROJECT_STRUCTURE.md` and `docs/ways-of-work/plan/`.
