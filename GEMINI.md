# GEMINI.md - QAi Talks Project Context

## Project Overview
**QAi Talks** is a comprehensive full-stack educational AI platform built with modern web technologies. It features a technical blog system, a modular course curriculum, and an AI-powered CV review tool.

- **Primary Stack:** Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS.
- **Backend & Database:** Next.js API Routes, Prisma ORM, SQLite (Dev), PostgreSQL (Prod), Cloudflare D1.
- **Authentication:** NextAuth.js v4 (GitHub, Google, Email/Password).
- **AI Integration:** Google Gemini API (via `@google/generative-ai`) and Hugging Face.
- **Ingestion Service:** A specialized Python FastAPI service (`ingest-service`) for document parsing and chunking.
- **Testing:** Playwright (E2E & A11y), Jest (Unit & Integration), Lighthouse CI.

## Directory Structure
- `next-app/`: The core Next.js application (Frontend & Main API).
- `ingest-service/`: Python FastAPI service for processing PDFs and other documents.
- `.agents/`: Project-specific instructions and skills for AI agents (Copilot/Gemini).
- `docs/`: Extensive documentation including `ARCHITECTURE.md`, `PRD.md`, and `DESIGN_SYSTEM.md`.
- `aws/`: Infrastructure configurations (S3, CORS policies).

## Building and Running

### Main Web Application (`next-app/`)
```bash
cd next-app
npm install              # Install dependencies
npm run dev             # Start development server at localhost:3000
npm run db:seed        # Seed database with sample data
npm run build           # Build for production
```

### Ingestion Service (`ingest-service/`)
```bash
cd ingest-service
# Local Setup
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Docker Setup
docker compose -f docker-compose.ingest.yml up --build
```

### Database Management
```bash
npx prisma studio                      # Visual database browser
npx prisma migrate dev --name <name>   # Create database migration
npm run db:seed                        # Seed database (runs prisma/seed.ts)
```

## Testing and Quality
- **Unit/Integration:** `npm run test` (Jest)
- **E2E Testing:** `npm run test:e2e` (Playwright)
- **A11y/Accessibility:** Playwright tests include `axe-core` checks.
- **Linting:** `npm run lint` and `npm run type-check`.
- **Target Coverage:** Minimum 50% code coverage.

## Development Conventions

### General Principles
- **React 19:** Use Server Components by default; `"use client"` only when necessary for interactivity.
- **TypeScript:** Strict mode is mandatory. Avoid `any`. Define interfaces for all props and API responses.
- **Styling:** Use Tailwind CSS utility classes exclusively. Follow the design system in `docs/DESIGN_SYSTEM.md`.
- **Accessibility:** Adhere to WCAG 2.1 Level AA compliance.
- **Validation:** Use `zod` for all input and API request validation.

### Naming Conventions
- **Components:** PascalCase (e.g., `UserCard.tsx`) in `components/`.
- **Utilities/Hooks:** camelCase (e.g., `useAuth.ts`, `formatDate.ts`) in `lib/` or `hooks/`.
- **Files/Directories:** kebab-case for non-component files and folders.

### AI & Security
- **Sanitization:** All user input must be sanitized to prevent XSS and prompt injection.
- **Rate Limiting:** Implemented on sensitive endpoints (e.g., CV review).
- **Secrets:** Never commit `.env` files. Use `.env.example` as a template.

## Key Skill References
Detailed instructions for specific domains are located in `.agents/skills/`:
- `development/`: Frontend, Backend, and API routes.
- `database/`: Prisma schema and query optimization.
- `security/`: Auth, validation, and API protection.
- `testing/`: Jest and Playwright patterns.
- `accessibility/`: WCAG compliance and ARIA patterns.
- `seo/`: Meta tags and performance optimization.
