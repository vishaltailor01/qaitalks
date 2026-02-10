# Next.js Full-Stack Setup Guide

Your Next.js full-stack app is ready! Here's how to proceed:

---

## What's Been Created

✅ **Next.js 16** - App Router with TypeScript
✅ **Tailwind CSS** - Modern styling
✅ **Prisma ORM** - Database layer with SQLite
✅ **NextAuth.js** - Authentication with OAuth
✅ **Project Structure** - Ready for development

---

## Next Steps

### Step 1: Initialize Database

```bash
cd next-app

# Create initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create dev.db (SQLite file)
# 2. Run migrations
# 3. Generate Prisma client
```

### Step 2: Set Up NextAuth.js

Create: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Step 3: Update .env File

Add to `.env.local`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# GitHub OAuth
GITHUB_ID=your_github_app_id
GITHUB_SECRET=your_github_app_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 4: Create Lib Utilities

Create: `lib/db.ts`
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

Create: `lib/auth.ts`
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}
```

### Step 5: Create Key Pages

- `app/page.tsx` - Home (hero + course preview)
- `app/courses/page.tsx` - All courses listing
- `app/dashboard/page.tsx` - User dashboard
- `app/(auth)/login/page.tsx` - Login page

### Step 6: Start Development Server

```bash
npm run dev
```

Then visit: http://localhost:3000

---

## File Structure

```
next-app/
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/
│   │       └── route.ts          # NextAuth configuration
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx              # Protected route (logged-in users)
│   ├── courses/
│   │   ├── page.tsx              # All courses
│   │   └── [id]/
│   │       └── page.tsx          # Course details
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css
├── components/
│   ├── Navbar.tsx                # Navigation
│   ├── Footer.tsx                # Footer
│   └── CourseCard.tsx            # Reusable component
├── lib/
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # Auth utilities
│   └── utils.ts                  # Helper functions
├── prisma/
│   ├── schema.prisma             # Database models
│   └── migrations/               # Database migrations
├── public/
│   └── branding/                 # Logos, favicons
├── .env.local                    # Environment variables
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## Database Migrations

```bash
# Create new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Example: npx prisma migrate dev --name add_blog_posts

# Push schema without creating migration (dev only)
npx prisma db push

# View database in Prisma Studio
npx prisma studio
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server on :3000

# Build & Production
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma migrate dev  # Create & run migration
npx prisma generate    # Generate Prisma client
npx prisma studio     # Open database GUI

# Type checking
npm run type-check      # Check TypeScript errors
```

---

## Deployment (Cloudflare Pages)

### 1. Configure for Cloudflare

```bash
npm install -D @cloudflare/next-on-pages wrangler
```

### 2. Update wrangler.toml

```toml
name = "qaitalks"
type = "javascript"
account_id = "your_account_id"
workers_dev = true

[[d1_databases]]
binding = "DB"
database_name = "qaitalks-db"
database_id = "your_database_id"

[[kv_namespaces]]
binding = "CACHE"
id = "your_kv_id"
```

### 3. Update GitHub Secrets

Add to: https://github.com/vishaltailor01/qaitalks/settings/secrets/actions

```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
DATABASE_URL (D1 connection string)
NEXTAUTH_SECRET
GITHUB_ID
GITHUB_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

### 4. Deploy

```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy next-app/.next/static

# Or with CI/CD (automatic on git push)
```

---

## API Endpoints (To Build)

### Courses API
- `GET /api/courses` - List all courses
- `GET /api/courses/[id]` - Get course details
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/[id]` - Update course (admin)

### Enrollments API
- `POST /api/enrollments` - Enroll user
- `GET /api/enrollments` - Get user's enrollments
- `PUT /api/enrollments/[id]` - Update progress

### Blog API
- `GET /api/blog` - List all posts
- `GET /api/blog/[slug]` - Get post details

---

## Testing

```bash
# Run tests
npm test

# With coverage
npm test -- --coverage
```

---

## Troubleshooting

### "Database lock" error
- Prisma Studio might be open
- Close it: `Ctrl + C` in Prisma Studio terminal

### OAuth not working
- Check GitHub/Google credentials in `.env.local`
- Verify redirect URI matches configuration

### Build fails on Cloudflare
- Check `wrangler.toml` configuration
- Ensure D1 database binding is set up
- Verify environment secrets are added

---

## Key Technologies

| Purpose | Library | Version |
|---------|---------|---------|
| **Framework** | Next.js | 16+ |
| **Runtime** | Node.js | 20+ |
| **Language** | TypeScript | 5+ |
| **Styling** | Tailwind CSS | 3+ |
| **ORM** | Prisma | 6+ |
| **Auth** | NextAuth.js | 5+ |
| **Database** | SQLite (Prisma) | - |
| **Hosting** | Cloudflare Pages | - |

---

## Next: Migrate Static Content

Once set up, migrate from `/site/public` to `next-app`:
1. Copy branding files to `public/`
2. Convert HTML pages to React components
3. Move content to database
4. Update links & routes
5. Test thoroughly

---

## Progress Checklist

- [ ] `npm install` completed
- [ ] `.env.local` configured
- [ ] `npx prisma migrate dev --name init` ran
- [ ] NextAuth route created
- [ ] `npm run dev` works
- [ ] http://localhost:3000 loads
- [ ] Create first course via Prisma Studio
- [ ] Set up OAuth with GitHub/Google
- [ ] Test login flow
- [ ] Deploy to staging/production

---

**Last Updated:** February 6, 2026  
**Get Started:** `cd next-app && npm run dev`  
**Questions?** Check FULLSTACK_PLAN.md for detailed architecture
