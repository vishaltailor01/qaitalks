# QAi Talks - Database Guide

Complete guide to database design, Prisma ORM, migrations, and query optimization.

---

## Database Architecture

### Technology Stack
- **Development:** SQLite (`dev.db` - quick, local, no setup)
- **Production:** PostgreSQL (reliable, scalable, proven for production)
- **ORM:** Prisma (type-safe, excellent migrations, auto-generates types)

### Database Models

Current schema in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"  // Switch to "postgresql" for production
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  image         String?
  emailVerified DateTime?
  password      String?
  role          String    @default("student")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // OAuth provider accounts
  accounts      Account[]
  sessions      Session[]
  
  // User's blog posts
  blogPosts     BlogPost[] @relation("author")
}

model BlogPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String
  content     String
  image       String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  authorId    String
  
  author      User     @relation("author", fields: [authorId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Account {
  id                 String  @id @default(cuid())
  userId             String  @map("user_id")
  type               String
  provider           String
  providerAccountId  String  @map("provider_account_id")
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
  userId       Int
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

---

## Prisma ORM

### Setup & Installation

```bash
# Initialize Prisma
npm install @prisma/client
npm install -D prisma

# Initialize
npx prisma init

# Set DATABASE_URL in .env.local
# DATABASE_URL="file:./dev.db"  (SQLite)
# or
# DATABASE_URL="postgresql://user:password@localhost:5432/qaitalks"  (PostgreSQL)
```

### Migrations

Migrations track schema changes and are essential for team collaboration and production deployments.

#### Create a Migration

```bash
# Make changes to prisma/schema.prisma
# Then create migration:
npx prisma migrate dev --name add_new_model

# This will:
# 1. Generate migration file in prisma/migrations/
# 2. Apply it to dev database
# 3. Regenerate Prisma Client
```

#### Apply Existing Migrations

```bash
# In production or CI/CD pipeline
npx prisma migrate deploy

# This applies all pending migrations (doesn't prompt for changes)
```

#### Reset Database (Development Only)

```bash
# Warning: Deletes all data!
npx prisma migrate reset

# This will:
# 1. Drop database
# 2. Create new database
# 3. Apply all migrations
# 4. Run seed script
```

### Prisma Client

#### Querying Data

```tsx
import { prisma } from '@/lib/db';

// Find all posts
const posts = await prisma.blogPost.findMany();

// Find with filtering
const published = await prisma.blogPost.findMany({
  where: { published: true },
});

// Find with sorting and limiting
const recent = await prisma.blogPost.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// Find with pagination
const page1 = await prisma.blogPost.findMany({
  skip: 0,
  take: 20,
  orderBy: { createdAt: 'desc' },
});

// Find with related data
const postWithAuthor = await prisma.blogPost.findUnique({
  where: { slug: 'my-post' },
  include: { author: true },
});

// Find by ID
const post = await prisma.blogPost.findUnique({
  where: { id: 1 },
});

// Count records
const totalPosts = await prisma.blogPost.count();

// Check if exists
const exists = await prisma.blogPost.findUnique({
  where: { slug: 'contract-testing' },
});

if (!exists) {
  // Handle not found
}
```

#### Creating Data

```tsx
// Create single record
const newPost = await prisma.blogPost.create({
  data: {
    slug: 'new-post',
    title: 'New Post Title',
    content: 'Post content...',
    published: true,
    author: {
      connect: { id: 1 }, // Connect to existing user
    },
  },
});

// Create with nested data
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    blogPosts: {
      create: [
        {
          slug: 'first-post',
          title: 'First Post',
          content: '...',
        },
      ],
    },
  },
});

// Create many records
const posts = await prisma.blogPost.createMany({
  data: [
    { slug: 'post1', title: 'Post 1', content: '...', authorId: 1 },
    { slug: 'post2', title: 'Post 2', content: '...', authorId: 1 },
  ],
});
```

#### Updating Data

```tsx
// Update single record
const updated = await prisma.blogPost.update({
  where: { id: 1 },
  data: {
    title: 'Updated Title',
    published: true,
  },
});

// Update or create (upsert)
const post = await prisma.blogPost.upsert({
  where: { slug: 'my-post' },
  update: { content: 'Updated content' },
  create: {
    slug: 'my-post',
    title: 'New Post',
    content: 'New content',
    authorId: 1,
  },
});

// Update many records
const updated = await prisma.blogPost.updateMany({
  where: { published: false },
  data: { published: true },
});
```

#### Deleting Data

```tsx
// Delete single record
const deleted = await prisma.blogPost.delete({
  where: { id: 1 },
});

// Delete many records
const deleted = await prisma.blogPost.deleteMany({
  where: { published: false },
});

// Delete all (careful!)
await prisma.blogPost.deleteMany();
```

### Database Seeding

Seed scripts populate database with initial data (test users, blog posts, etc.)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.blogPost.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@qaitalks.com',
      name: 'Admin User',
      emailVerified: new Date(),
    },
  });

  // Create blog posts (11 total: 3 original + 8 skill-based)
  // Each post now includes:
  // - Professional SVG featured image (gradient background)
  // - 2000-4000 word HTML content
  // - Category badge and reading time automatically calculated
  // - Author attribution and publication date
  // - Table of contents auto-extracted from H2/H3 headings
  // - Social share buttons (Twitter/X, LinkedIn)
  
  const posts = [
    // Original posts (3)
    {
      slug: 'pom-is-dead',
      title: 'Why Page Object Model is Dead',
      description: 'POM is obsolete. Screenplay pattern and component-based testing...',
      content: '<h2>The Evolution of Test Architecture</h2>...',
      image: '/blog/pom-is-dead.svg',
      published: true,
      publishedAt: new Date('2026-10-24'),
      authorId: admin.id,
    },
    // ... remaining 10 posts follow same structure
  ];

  for (const post of posts) {
    await prisma.blogPost.create({ data: post });
  }

  console.log('✅ Database seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npm run db:seed
```

---

## Query Optimization

### Best Practices

#### 1. Avoid N+1 Queries
```tsx
// BAD: N+1 query problem
const posts = await prisma.blogPost.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
  });
  // Now you have N+1 queries (1 for posts + N for each author)
}

// GOOD: Use include to fetch relations
const posts = await prisma.blogPost.findMany({
  include: { author: true }, // Fetch author in single query
});
// Now you have only 1 query (includes author data)
```

#### 2. Select Only Needed Fields
```tsx
// BAD: Fetch all fields
const posts = await prisma.blogPost.findMany();
// Transfers unnecessary data

// GOOD: Select specific fields
const posts = await prisma.blogPost.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    createdAt: true,
    // Skip content field if not needed
  },
});
```

#### 3. Use Pagination
```tsx
// BAD: Fetch all posts
const allPosts = await prisma.blogPost.findMany();
// Could be millions of records!

// GOOD: Use pagination
const page = 1;
const pageSize = 20;

const posts = await prisma.blogPost.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

const total = await prisma.blogPost.count();
const pages = Math.ceil(total / pageSize);
```

#### 4. Filter on Database
```tsx
// BAD: Filter in application
const allPosts = await prisma.blogPost.findMany();
const published = allPosts.filter(p => p.published);
// Transfers unnecessary data

// GOOD: Filter on database
const published = await prisma.blogPost.findMany({
  where: { published: true },
});
```

#### 5. Create Database Indexes
```prisma
// For frequently queried fields
model BlogPost {
  slug      String  @unique  // Unique index
  published Boolean @default(false)
  createdAt DateTime @default(now())

  @@index([published])  // Index for filtering
  @@index([createdAt])  // Index for sorting
}
```

---

## Database Connection

### In Server Components or API Routes

```tsx
// lib/db.ts
import { PrismaClient } from '@prisma/client';

// Use singleton pattern to avoid creating multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Import and use:
```tsx
import { prisma } from '@/lib/db';

// In Server Component
export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    include: { author: true },
  });

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author.name}</p>
        </article>
      ))}
    </div>
  );
}

// In API Route
export async function GET() {
  const posts = await prisma.blogPost.findMany();
  return Response.json(posts);
}
```

---

## Schema Design Best Practices

### Relationships

```prisma
// One-to-Many: User has many BlogPosts
model User {
  id        Int       @id @default(autoincrement())
  name      String
  blogPosts BlogPost[] // Array of posts
}

model BlogPost {
  id       Int  @id @default(autoincrement())
  title    String
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### Indexes

```prisma
model BlogPost {
  // Frequently searched fields
  slug      String  @unique        // Unique index automatically created
  published Boolean @default(false)
  createdAt DateTime @default(now())

  // Create composite index for common queries
  @@index([published, createdAt])
}
```

### Defaults and Constraints

```prisma
model BlogPost {
  // Auto-generated values
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Constraints
  title     String   @db.VarChar(255)
  content   String   // Text type
  published Boolean  @default(false)
}
```

---

## Production Deployment

### PostgreSQL Connection

```env
# .env.local for production
DATABASE_URL="postgresql://user:password@host:5432/qaitalks_db"
```

### Connection Pool

```env
# PostgreSQL connection pooling (recommended)
DATABASE_URL="postgresql://user:password@host:5432/qaitalks_db?schema=public&connection_limit=5"
```

### Backup Strategy

```bash
# Daily backup (add to cron)
pg_dump postgresql://user:password@host:5432/qaitalks_db > backup_$(date +%Y%m%d).sql

# Restore from backup (if needed)
psql postgresql://user:password@host:5432/qaitalks_db < backup_20260208.sql
```

---

## Troubleshooting

### "Timed out acquiring a database connection"
- Database connection pool exhausted
- Solution: Use connection pooling with Prisma's `connection_limit` parameter

### "Unique constraint violated"
- Attempting to insert duplicate value in unique field
- Solution: Check if record exists before creating, or use `upsert`

### "Foreign key constraint failed"
- Trying to create record with non-existent related record
- Solution: Ensure related record exists before creating

### Slow Queries
- Use `@@index()` on frequently queried fields
- Use `select` to fetch only needed fields
- Use pagination to limit result set

---

## Useful Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Database Best Practices](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)

---

**Last Updated:** February 8, 2026
**See Also:** [DEVELOPMENT.md](DEVELOPMENT.md), [SECURITY.md](SECURITY.md)
