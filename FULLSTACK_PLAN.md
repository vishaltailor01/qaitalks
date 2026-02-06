# Full-Stack Migration Plan

## Overview
Converting QAi Talks from static HTML to Next.js full-stack app with Cloudflare Workers, D1 database, OAuth authentication, and Tailwind UI.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Next.js App (App Router)        │
│  (React Components + API Routes)        │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┴──────────┐
     │                    │
┌────▼──────────┐  ┌─────▼────────────┐
│  API Routes   │  │ Static Pages    │
│  (Database)   │  │ (SSG/ISR)       │
└────┬──────────┘  └─────┬────────────┘
     │                    │
     └─────────┬──────────┘
               │
      ┌────────▼──────────┐
      │  Cloudflare Pages │
      │  + Workers (Edge) │
      └────────┬──────────┘
               │
      ┌────────▼──────────┐
      │  Cloudflare D1    │
      │  (SQLite)         │
      └───────────────────┘
```

---

## Phase 1: Project Setup (1-2 days)

### Step 1.1: Create Next.js Project

```bash
npx create-next-app@latest qaitalks --typescript --tailwind --eslint --app
cd qaitalks
```

### Step 1.2: Install Dependencies

```bash
npm install next-auth @next-auth/prisma-adapter
npm install @prisma/client prisma
npm install shadcn-ui
npm install zustand axios
npm install -D @types/node typescript
```

### Step 1.3: Project Structure

```
qaitalks/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts
│   │   ├── users/
│   │   │   └── route.ts
│   │   ├── courses/
│   │   │   └── route.ts
│   │   └── enrollments/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── courses/
│   ├── courses/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── CourseCard.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   └── types.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── branding/
│   └── images/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Phase 2: Database & ORM (1 day)

### Step 2.1: Set Up Prisma

```bash
npx prisma init
npx prisma db push  # Sync to D1
```

### Step 2.2: Database Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String    @default("student")  // student, instructor, admin
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  enrollments   Enrollment[]
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Course {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String
  image       String?
  level       String   @default("beginner")  // beginner, intermediate, advanced
  duration    Int      // minutes
  modules     Int      // number of modules
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  enrollments Enrollment[]
  lessons     Lesson[]
}

model Lesson {
  id          String   @id @default(cuid())
  courseId    String
  title       String
  slug        String
  content     String   // HTML or Markdown
  videoUrl    String?
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([courseId, slug])
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  progress  Int      @default(0)  // 0-100%
  completed Boolean  @default(false)
  startedAt DateTime @default(now())
  completedAt DateTime?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
}

model BlogPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String
  content     String   // HTML or Markdown
  author      String
  image       String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Phase 3: Authentication (1 day)

### Step 3.1: NextAuth.js Configuration (`app/api/auth/[...nextauth]/route.ts`)

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
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Step 3.2: Environment Variables (`.env.local`)

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# OAuth
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database (D1)
DATABASE_URL=file:./dev.db
```

---

## Phase 4: Core Pages (2-3 days)

### Step 4.1: Home Page (`app/page.tsx`)

- Hero section (keep Blueprint design)
- Course preview cards
- Testimonials
- CTA buttons

### Step 4.2: Courses Page (`app/courses/page.tsx`)

- All courses displayed as cards
- Filter/search functionality
- "Enroll now" buttons

### Step 4.3: Dashboard (`app/dashboard/page.tsx`)

- User enrolled courses
- Progress bars
- Continue learning buttons

### Step 4.4: Auth Pages

- Login with OAuth buttons
- Register page
- Profile page

---

## Phase 5: API Endpoints (1 day)

### Step 5.1: Courses API

```
GET    /api/courses              → List all courses
GET    /api/courses/[id]         → Get course details
POST   /api/courses              → Create course (admin)
PUT    /api/courses/[id]         → Update course (admin)
DELETE /api/courses/[id]         → Delete course (admin)
```

### Step 5.2: Enrollments API

```
POST   /api/enrollments          → Enroll in course
GET    /api/enrollments          → User's enrollments
PUT    /api/enrollments/[id]     → Update progress
DELETE /api/enrollments/[id]     → Unenroll
```

### Step 5.3: Blog API

```
GET    /api/blog                 → List all posts
GET    /api/blog/[slug]          → Get post details
```

---

## Phase 6: Styling & Components (1 day)

### Step 6.1: Set Up Shadcn/ui

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select form
```

### Step 6.2: Custom Components

- Navbar (with auth state)
- Footer
- Course card
- Enrollment card
- Hero section

### Step 6.3: Themes

- Keep Blueprint colors (#0A2540, #00D4FF, #FFB800)
- Use Tailwind for utilities
- Create theme config

---

## Phase 7: Deployment to Cloudflare (1 day)

### Step 7.1: Configure for Cloudflare Pages

```bash
npm install -D @cloudflare/next-on-pages wrangler
npx wrangler pages project create qaitalks --production-branch main
```

### Step 7.2: Update `next.config.ts`

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    runtime: "nodejs_latest",
  },
}

export default nextConfig
```

### Step 7.3: D1 Database on Cloudflare

```bash
# Create D1 database
npx wrangler d1 create qaitalks-db

# Migrate schema
npx wrangler d1 execute qaitalks-db --file ./prisma/migrations/001_init/migration.sql

# Update wrangler.toml
```

### Step 7.4: Environment for Production

```bash
# Set Cloudflare environment secrets
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put GITHUB_ID
npx wrangler secret put GITHUB_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

---

## Phase 8: CI/CD Updates (1 day)

### Step 8.1: Update GitHub Actions Workflow

- Build Next.js app
- Run tests
- Deploy to Cloudflare Pages
- Database migrations

### Step 8.2: Staging & Production

- Staging: `develop` branch
- Production: `main` branch

---

## Timeline

```
Week 1:
  Day 1-2: Project setup & dependencies
  Day 3-4: Database schema & Prisma
  Day 5: Authentication

Week 2:
  Day 1-2: Core pages (home, courses, dashboard)
  Day 3: API endpoints
  Day 4: Styling & components

Week 3:
  Day 1: Deployment setup
  Day 2-3: CI/CD configuration
  Day 4-5: Testing & bug fixes
```

**Total: ~2-3 weeks** depending on complexity

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current static site
- [ ] Document current URLs & routes
- [ ] Review analytics (traffic patterns)
- [ ] Create database schema
- [ ] Plan SEO redirects

### During Migration
- [ ] Set up Next.js project
- [ ] Database setup & migrations
- [ ] Create all pages
- [ ] Set up authentication
- [ ] Configure CI/CD
- [ ] Test locally
- [ ] Deploy to staging
- [ ] QA testing on staging
- [ ] Create redirects for old URLs

### Post-Migration
- [ ] Monitor error logs (Sentry)
- [ ] Check Core Web Vitals
- [ ] Verify analytics (Google Analytics)
- [ ] Update sitemap.xml
- [ ] Submit to Google Search Console
- [ ] Monitor performance

---

## Key Benefits

✅ Database-driven courses (scalable)
✅ User authentication (GitHub/Google login)
✅ Enrollment tracking (progress, certificates)
✅ Admin panel (add courses, manage users)
✅ Dynamic blog (from database)
✅ Better performance (ISR, caching)
✅ Edge deployment (Cloudflare)
✅ Automatic deployments (CI/CD)

---

## Potential Challenges

⚠️ Database migration from static to dynamic
⚠️ URL structure changes (redirects needed)
⚠️ Learning curve (React, Next.js concepts)
⚠️ D1 SQLite limitations (for large scale)
⚠️ Testing complexity

---

## Next Steps

1. Confirm migration plan
2. Set up Next.js project
3. Create database schema
4. Implement Phase 1-3 (foundation)
5. Deploy to staging for testing

---

**Last Updated:** February 6, 2026  
**Estimated Start:** Immediately  
**Estimated Completion:** ~2-3 weeks
