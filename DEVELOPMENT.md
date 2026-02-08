# QAi Talks - Development Guide

Comprehensive guide for frontend and backend development using Next.js 16, React 19, and TypeScript.

---

## Frontend Development (Next.js 16)

### Core Technologies
- **Next.js 16** — React framework with App Router, server/client components, dynamic routing, API routes, and image optimization
- **React 19** — Server Components for data fetching, Client Components for interactivity. Use `"use client"` directive for client-side code
- **TypeScript** — Strict type checking. Write interfaces for data models, validate component props, use type inference where possible
- **Tailwind CSS** — Utility-first styling with custom design system colors and animations
- **Custom Design System** — Colors, fonts, spacing (8px/16px grid), animations defined in `tailwind.config.ts` and `globals.css`

### Frontend Best Practices

#### Next.js App Router
- **Server Components (Default)** — Use for data fetching, database queries, API calls. Automatically run on the server
- **Client Components** — Mark with `"use client"` directive only when needed (state, event handlers, hooks)
- **Dynamic Routing** — Use `[slug]` for dynamic segments. Example: `app/blog/[slug]/page.tsx` for blog posts
- **Layout** — Place `layout.tsx` in directories to create shared layouts for all pages in that segment
- **API Routes** — Create endpoints in `app/api/`. Each file exports named functions: `GET`, `POST`, `PUT`, `DELETE`

#### React Best Practices
- **Server Components for Data** — Fetch data in Server Components, pass as props to Client Components
- **Minimize Client-Side State** — Prefer Server Components. Use `useState` only for interaction (forms, toggles, filters)
- **Hooks** — Use `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo` as needed. Always mark components with `"use client"`
- **Props Over State** — Pass data as props from parent Server Components to child Client Components
- **Conditional Rendering** — Use ternary operators or logical operators. Keep JSX readable

#### TypeScript
- **Strict Mode** — Enable in `tsconfig.json`. Catch errors at compile time
- **Define Interfaces** — For API responses, database models, component props:
  ```tsx
  interface BlogPost {
    id: number;
    slug: string;
    title: string;
    content: string;
    published_at: Date;
  }
  ```
- **Props Type** — Define for every component:
  ```tsx
  interface PostCardProps {
    post: BlogPost;
    featured?: boolean;
  }
  
  export function PostCard({ post, featured = false }: PostCardProps) { ... }
  ```
- **Type Inference** — Let TypeScript infer types from context to reduce boilerplate

### Component Architecture

#### Page Components
```tsx
// app/page-name/page.tsx
import { ReactNode } from 'react';

export const metadata = {
  title: "Page Title | QAi Talks",
  description: "SEO description here...",
  openGraph: {
    title: "Page Title",
    description: "SEO description here...",
    url: "https://qaitalks.com/page-name",
  },
};

export default function PageName(): ReactNode {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page content */}
    </main>
  );
}
```

#### Reusable Components
```tsx
// components/ExampleComponent.tsx
"use client";

import { useState } from 'react';

interface ExampleComponentProps {
  title: string;
  description?: string;
  onSubmit?: (data: string) => void;
}

export function ExampleComponent({
  title,
  description,
  onSubmit,
}: ExampleComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // Handle click...
    setIsLoading(false);
  };

  return (
    <div className="bg-deep-blueprint text-white p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="text-sm mt-2">{description}</p>}
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click Me'}
      </button>
    </div>
  );
}
```

### Styling with Tailwind CSS

#### Design System Colors
```tsx
// Use these colors from tailwind.config.ts
<div className="bg-deep-blueprint">      {/* #001B44 - Primary navy */}
<div className="text-logic-cyan">        {/* #00B4D8 - Accent teal */}
<div className="border-warning-amber">   {/* #FFB700 - CTA amber */}
<div className="text-text-slate">       {/* #1E293B - Body text */}
```

#### Responsive Design (Mobile-First)
```tsx
// Start with mobile, enhance for larger screens
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text size
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive grid (1 col mobile, 2 tablet, 3 desktop)
</div>

<div className="px-4 sm:px-8 md:px-12">
  Responsive padding
</div>
```

#### Custom Animations
```tsx
// Defined in tailwind.config.ts, use via class names
<div className="animate-float">         {/* 3s ease-in-out */}
<div className="animate-gridMove">      {/* 20s linear */}
<div className="animate-pulse">         {/* Built-in Tailwind */}
```

#### Utility-First Approach
```tsx
// Good: Use Tailwind utilities
<button className="bg-logic-cyan text-white px-4 py-2 rounded-lg hover:opacity-90">
  Click Me
</button>

// Avoid: Inline styles or custom CSS
<button style={{ backgroundColor: '#00B4D8' }}>
  Click Me
</button>
```

### Form Handling

#### Client-Side Form with useState
```tsx
"use client";

import { useState } from 'react';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name too short"),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [data, setData] = useState<FormData>({ email: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validated = schema.parse(data);
      
      // Send to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!response.ok) throw new Error('Failed to submit');
      
      setData({ email: "", name: "" });
      // Show success message
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-logic-cyan text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Image Optimization

```tsx
import Image from 'next/image';

// Good: Use next/image for automatic optimization
<Image
  src="/images/logo.png"
  alt="QAi Talks logo"
  width={100}
  height={100}
  priority // Load immediately for above-fold images
/>

// SVGs: Import directly
import { LogoIcon } from '@/components/icons';
<LogoIcon className="w-8 h-8" />

// Avoid: Plain <img> tags
<img src="/images/logo.png" alt="logo" /> {/* No optimization */}
```

### Performance Best Practices

- **Code Splitting** — Use `dynamic()` for large components:
  ```tsx
  import dynamic from 'next/dynamic';
  const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
    loading: () => <div>Loading...</div>,
  });
  ```

- **Lazy Loading** — Use `loading="lazy"` for off-screen images:
  ```tsx
  <Image src="/img.png" alt="..." loading="lazy" />
  ```

- **Font Optimization** — Define fonts in `app/layout.tsx`:
  ```tsx
  import { Inter, JetBrains_Mono, Indie_Flower } from 'next/font/google';
  
  const inter = Inter({ subsets: ['latin'] });
  export default function RootLayout({ children }) {
    return <html className={inter.className}>{children}</html>;
  }
  ```

---

## Backend Development (Node.js + NextAuth)

### API Route Structure

```tsx
// app/api/endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

// Protect with authentication
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data
    const data = await prisma.model.findMany();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create record
    const record = await prisma.model.create({
      data: body,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Input Validation with Zod

```tsx
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 chars").max(200),
  content: z.string().min(100, "Content must be detailed"),
  published: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

// In API route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPostSchema.parse(body);
    // Use validated data...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### NextAuth Configuration

```tsx
// lib/auth.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

### Environment Variables

Create `.env.local` (never commit):

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# GitHub OAuth
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# Google OAuth
GOOGLE_ID="your-google-id"
GOOGLE_SECRET="your-google-secret"

# Only expose to client if needed (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
```

---

## Additional Skills

### NextAuth.js & Authentication
- **OAuth Configuration** — GitHub and Google OAuth providers configured in `lib/auth.ts`. Store secrets in `.env.local`
- **Session Management** — Sessions stored in database via Prisma. Access via `getServerSession()` (Server) or `useSession()` (Client)
- **Protected Routes** — Redirect unauthenticated users to login. Check session at route level or component level
- **Role-Based Access Control** — Store user role in database. Verify permissions on API routes

### Documentation & Code Quality
- **Markdown Best Practices** — Clear, well-structured docs with headings, code blocks, tables
- **Component Documentation** — Add JSDoc comments for props:
  ```tsx
  /**
   * Renders a blog post preview card
   * @param post - The blog post data
   * @param featured - Whether to highlight this card
   */
  export function PostCard({ post, featured }: PostCardProps) { ... }
  ```
- **Code Comments** — Mark complex logic, explain why not just what. Example: `// Debounce input to avoid excessive API calls`
- **Git Hygiene** — Clear commit messages: `feat(blog): add search functionality` or `fix(nav): mobile menu z-index`

### Development Tools
- **VS Code Extensions** — Prettier (formatting), ESLint (linting), Thunder Client (API testing)
- **Browser DevTools** — Chrome/Firefox DevTools for debugging, React DevTools for component inspection
- **Git Tools** — GitHub Desktop, GitKraken, or CLI

---

## Workflow Checklist

### Adding a New Page
- [ ] Create `app/page-name/page.tsx`
- [ ] Add metadata (title, description, OG tags)
- [ ] Implement responsive layout (test at 320px, 768px, 1024px)
- [ ] Use design system colors (deep-blueprint, logic-cyan, warning-amber)
- [ ] Update navbar/footer with navigation link
- [ ] Test all links work
- [ ] Check accessibility (keyboard nav, screen reader)
- [ ] Verify no console errors
- [ ] Add E2E test in `e2e/*.spec.ts`

### Creating an API Endpoint
- [ ] Create `app/api/endpoint/route.ts`
- [ ] Add authentication check if needed
- [ ] Validate input with zod
- [ ] Handle errors with proper HTTP status codes
- [ ] Use consistent response format
- [ ] Test with curl/Postman
- [ ] Add unit test if complex logic
- [ ] Document endpoint (comment with example)

### Styling a Component
- [ ] Use Tailwind utilities, avoid inline styles
- [ ] Use design system colors (not arbitrary colors)
- [ ] Make responsive with `sm:`, `md:`, `lg:` breakpoints
- [ ] Ensure 4.5:1 contrast ratio for text
- [ ] Verify mobile layout at 320px viewport
- [ ] Use custom animations from design system

---

**Last Updated:** February 8, 2026
**See Also:** [DATABASE.md](DATABASE.md), [TESTING.md](TESTING.md), [SECURITY.md](SECURITY.md)
