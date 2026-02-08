# Database Skill

## Overview
Database design, Prisma ORM, migrations, and query optimization using SQLite (dev) and PostgreSQL (production).

## When to Use
- Modifying database schema or adding models
- Writing database queries with Prisma
- Creating migrations
- Optimizing slow queries
- Seeding database with initial data

## Key Files
- **Guide:** `DATABASE.md` (in this directory)
- **Schema:** `prisma/schema.prisma`
- **Seed:** `prisma/seed.ts`
- **Client:** `lib/db.ts`

## Quick Commands
```bash
npx prisma migrate dev --name <name>  # Create migration
npx prisma studio                      # Open database GUI
npm run db:seed                        # Seed database
npx prisma format                      # Format schema
```

## Key Patterns
- Use Prisma relations for data integrity
- Add `@unique` constraints for email, slug
- Always set `@default()` for timestamps
- Use Prisma relationships: `@relation()` for foreign keys
- Query optimization: avoid N+1 with `include` or `select`

## Output
When generating code:
1. Update `prisma/schema.prisma` with proper syntax
2. Create migration file (or let Prisma generate)
3. Write type-safe Prisma queries
4. Include proper error handling
5. Add input validation before database calls
