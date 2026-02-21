# QaiTAlk Developer Onboarding

## 1. Prerequisites
- Node.js 20+, npm 9+
- PostgreSQL (local or Supabase)
- Cloudflare account (for deployment)

## 2. Setup
```bash
# Clone repo
 git clone <repo-url>
 cd QaiTAlk/apps/web

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
- Accessibility: `npx playwright test apps/web/e2e/a11y.spec.ts`
- Performance: `npx lhci autorun --config=lighthouserc.js`

## 4. Key Architecture
- See `docs/ARCHITECTURE.md` for stack and module overview
- All user input is Zod-validated and sanitized
- Auth required for user data endpoints
- GDPR endpoints: `/api/user/data` (GET for export, DELETE for removal)

## 5. Contribution

## QaiTalk Onboarding Guide (2026)

> **Note:** The project folder structure was reorganized in February 2026 for clarity, scalability, and best practices. Please follow the new structure below for all development and documentation.

## Project Folder Structure

```
QaiTAlk/
│
├── apps/
│   └── web/                # Next.js app (was next-app/)
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       ├── prisma/
│       ├── __tests__/
│       ├── e2e/
│       ├── types/
│       ├── package.json
│       └── ...etc
│
├── docs/                   # All documentation, ADRs, onboarding, design system
│   ├── architecture/
│   ├── DESIGN_SYSTEM.md
│   ├── ONBOARDING.md
│   └── ...etc
│
├── infra/                  # Infrastructure as code (was aws/)
│   ├── aws/
│   └── ...etc
│
├── scripts/                # Utility scripts (if any)
│
├── .github/                # GitHub workflows, issue templates, instructions
│
├── package.json            # Root (for monorepo scripts, lint, format, etc.)
└── README.md
```

## Onboarding Steps

1. **Clone the repository:**
	```sh
	git clone <repo-url>
	cd QaiTAlk
	```

2. **Install dependencies:**
	```sh
	cd apps/web
	npm install
	```

3. **Set up environment variables:**
	- Copy `.env.example` to `.env` in `apps/web/` and fill in required values.

4. **Database setup:**
	- Run migrations from `apps/web/prisma/` as needed.

5. **Run the development server:**
	```sh
	npm run dev
	```

6. **Testing:**
	- Unit tests: `npm run test`
	- E2E tests: `npm run test:e2e`

7. **Documentation:**
	- All docs are in `/docs`. See `DESIGN_SYSTEM.md` for UI/UX standards.
	- ADRs and architecture decisions are in `/docs/architecture/`.

8. **Contributing:**
	- Please read `CONTRIBUTING.md` (to be added) for code style, PR, and review process.

## Notes

- All new features and fixes must follow the [Design System](DESIGN_SYSTEM.md) and accessibility guidelines.
- Keep infra code in `/infra` and app code in `/apps/web`.
- Update documentation as you go.

---

For questions, contact the maintainers or open an issue on GitHub.

## 6. Design System
- All UI work must follow the Stitch-inspired design system (see `docs/DESIGN_SYSTEM.md`).
- Use only tokens and patterns defined in `tailwind.config.ts` and global CSS.

---
For more, see `docs/PROJECT_STRUCTURE.md`, `docs/DESIGN_SYSTEM.md`, and `docs/ways-of-work/plan/`.
