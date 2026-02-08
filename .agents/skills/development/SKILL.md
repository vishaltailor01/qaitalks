# Development Skill

## Overview
Frontend and backend development using Next.js 16, React 19, TypeScript, and Tailwind CSS.

## When to Use
- Adding new pages or components
- Creating API routes or database queries
- Styling components with Tailwind CSS
- Setting up form validation with zod
- Implementing layouts and routing

## Key Files
- **Guide:** `DEVELOPMENT.md` (in this directory)
- **Config:** `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- **Components:** `next-app/components/` and `next-app/app/`

## Quick Commands
```bash
npm run dev              # Start dev server
npm run type-check      # Check TypeScript errors
npm run lint            # Check code quality
npm run lint:fix        # Auto-fix issues
```

## Key Patterns
- Use Server Components by default in Next.js 16
- Mark interactive components with `"use client"` directive
- Props over state - pass data from Server Components to Client Components
- Define TypeScript interfaces for all data models
- Directory structure: `ui/` (atomic), `layout/`, `sections/`

## Output
When generating code:
1. Create TypeScript components with proper types
2. Use Tailwind CSS utility classes (no custom CSS)
3. Follow Next.js App Router conventions
4. Add proper imports and exports
5. Include JSDoc comments for complex functions
