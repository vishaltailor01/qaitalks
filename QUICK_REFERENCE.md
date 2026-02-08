# Quick Reference Guide

Fast lookup for commands, patterns, and common tasks. Full guides in `.agents/skills/`.

---

## ⚡ Commands at a Glance

### Development
```bash
npm run dev              # Start dev server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run type-check     # Check TypeScript errors
npm run lint            # Check code quality
npm run lint:fix        # Auto-fix linting issues
```

### Testing
```bash
npm run test            # Run all unit tests
npm run test:watch     # Watch mode (re-run on file change)
npm run test:coverage  # Generate coverage report
npm run test:e2e       # Run E2E tests (headless, fast)
npm run test:e2e:ui    # Interactive Playwright UI (recommended)
npm run test:e2e:debug # Debug single test in browser
```

### Database
```bash
npx prisma migrate dev --name <description>   # Create migration + apply
npx prisma migrate dev                        # Apply pending migration
npx prisma studio                             # Open database GUI (visual editor)
npm run db:seed                               # Seed with initial data
npx prisma format                             # Format schema.prisma
npx prisma validate                           # Validate schema
```

---

## 🎯 Code Patterns

### Create a New Page
```tsx
// app/my-feature/page.tsx
export const metadata = {
  title: "My Feature",
  description: "Feature description",
};

export default function MyFeaturePage() {
  return (
    <main>
      <h1>My Feature</h1>
      {/* Page content */}
    </main>
  );
}
```

### Create a Server Component (Data Fetching)
```tsx
// components/PostList.tsx
import { db } from "@/lib/db";

export async function PostList() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

### Create a Client Component (Interactivity)
```tsx
"use client";

import { useState } from "react";

interface CounterProps {
  initialValue?: number;
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### API Route (GET)
```tsx
// app/api/posts/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const posts = await db.blogPost.findMany();
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
```

### API Route (POST with Validation)
```tsx
// app/api/posts/route.ts
import { z } from "zod";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const CreatePostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  slug: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePostSchema.parse(body);
    
    const post = await db.blogPost.create({
      data: validatedData,
    });
    
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Database Query (Prisma)
```tsx
import { db } from "@/lib/db";

// Create
const user = await db.user.create({
  data: { email: "user@example.com", name: "John" },
});

// Read (one)
const post = await db.blogPost.findUnique({
  where: { slug: "my-post" },
});

// Read (many) with filtering
const posts = await db.blogPost.findMany({
  where: { published: true },
  orderBy: { createdAt: "desc" },
  take: 10,
});

// Update
await db.user.update({
  where: { id: "user-123" },
  data: { name: "Jane" },
});

// Delete
await db.post.delete({
  where: { id: "post-456" },
});
```

### Database Query (N+1 Prevention)
```tsx
// ❌ AVOID: Causes N+1 query problem
const users = await db.user.findMany();
const postsForUsers = await Promise.all(
  users.map(u => db.blogPost.findMany({ where: { authorId: u.id } }))
);

// ✅ CORRECT: Use include() to fetch relationships
const usersWithPosts = await db.user.findMany({
  include: { blogPosts: true }, // Fetches posts in one query
});
```

### Form with Validation
```tsx
"use client";

import { useState } from "react";
import { z } from "zod";

const FormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20),
});

export function PostForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      const validatedData = FormSchema.parse(data);
      const response = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(validatedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        setErrors(error.error);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      {errors.title && <span className="text-red-500">{errors.title}</span>}
      
      <textarea name="content" required />
      {errors.content && <span className="text-red-500">{errors.content}</span>}
      
      <button type="submit">Create Post</button>
    </form>
  );
}
```

### Styling with Tailwind
```tsx
// Use utility classes for all styling
<div className="flex items-center justify-between gap-4 p-6 bg-blue-50 rounded-lg">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>

// Dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### Unit Test (Jest)
```tsx
// __tests__/components/Counter.test.tsx
import { render, screen } from "@testing-library/react";
import { Counter } from "@/components/Counter";

describe("Counter Component", () => {
  it("should render with initial value", () => {
    render(<Counter initialValue={5} />);
    expect(screen.getByText("Count: 5")).toBeInTheDocument();
  });
  
  it("should increment on click", async () => {
    const { user } = render(<Counter />);
    const button = screen.getByRole("button");
    
    await user.click(button);
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });
});
```

### E2E Test (Playwright)
```tsx
// e2e/homepage.spec.ts
import { test, expect } from "@playwright/test";

test("homepage should load", async ({ page }) => {
  await page.goto("http://localhost:3000");
  
  expect(await page.title()).toContain("QAi Talks");
  
  const heading = page.locator("h1");
  await expect(heading).toBeVisible();
  await expect(heading).toContainText("Welcome");
});

test("navigation should work", async ({ page }) => {
  await page.goto("http://localhost:3000");
  
  await page.click("a:has-text('Blog')");
  await page.waitForNavigation();
  
  expect(page.url()).toContain("/blog");
});
```

---

## 🎨 Design Tokens

### Colors
```css
Primary: bg-blue-600, text-blue-600
Secondary: bg-purple-600, text-purple-600
Accent: bg-orange-500, text-orange-500
Success: bg-green-600
Warning: bg-yellow-500
Error: bg-red-600
Neutral: text-gray-900 bg-gray-50
```

### Typography
```css
Headings: font-bold (font-weight: 700)
Body: font-normal (font-weight: 400)
Small: text-sm
Large: text-lg, text-xl
Extra Large: text-2xl, text-3xl
```

### Spacing (8px Grid)
```css
p-2  = 8px padding
p-4  = 16px padding
p-6  = 24px padding
p-8  = 32px padding
gap-4 = 16px gap between items
```

---

## 🔐 Security Checklist

- [ ] Validate input on server with zod schema
- [ ] Check user authentication on protected routes
- [ ] No sensitive data in frontend code
- [ ] Use environment variables for secrets
- [ ] HTTPS enabled in production
- [ ] CSRF protection (NextAuth.js handles it)
- [ ] Rate limiting on public APIs

---

## ♿ Accessibility Checklist

- [ ] All buttons and links keyboard accessible
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Alt text on all images
- [ ] Form labels associated with inputs
- [ ] Focus indicators visible
- [ ] Semantic HTML used
- [ ] Error messages clear and helpful

---

## 🔍 SEO Checklist

- [ ] Page title set (50-60 characters)
- [ ] Meta description added (150-160 characters)
- [ ] Open Graph tags for social sharing
- [ ] H1 tag used once per page
- [ ] Heading hierarchy: H1 → H2 → H3
- [ ] Images have descriptive alt text
- [ ] Links have descriptive text (not "click here")
- [ ] Internal links to related pages

---

## 📁 File Locations

| Item | Location |
|------|----------|
| Components | `next-app/components/` |
| Pages | `next-app/app/` |
| API Routes | `next-app/app/api/` |
| Utilities | `next-app/lib/` |
| Database Client | `next-app/lib/db.ts` |
| Authentication | `next-app/lib/auth.ts` |
| Database Schema | `next-app/prisma/schema.prisma` |
| Migrations | `next-app/prisma/migrations/` |
| Unit Tests | `next-app/__tests__/` |
| E2E Tests | `next-app/e2e/` |
| Global Styles | `next-app/app/globals.css` |
| Tailwind Config | `next-app/tailwind.config.ts` |
| Config Files | Root of `next-app/` |

---

## 🚀 Deployment Commands

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel
vercel deploy --prod

# Deploy to Cloudflare Pages
npx wrangler pages deploy
```

---

## 🐛 Debugging Tips

```bash
# Debug unit tests
npm run test -- --debug

# Debug E2E tests in browser
npm run test:e2e:debug

# View browser console/errors
# Use test:e2e:ui and open DevTools

# Check database with GUI
npx prisma studio

# View database migrations
npx prisma migrate status

# Check TypeScript errors
npm run type-check

# Check for unused dependencies
npm ls --all
```

---

**Last Updated:** February 8, 2026  
Full guides: `.agents/skills/` directory
