# QAi Talks - Security Guide

Comprehensive security practices for Next.js applications covering frontend, backend, authentication, and infrastructure.

---

## Frontend Security

### 1. Cross-Site Scripting (XSS) Prevention

XSS attacks inject malicious scripts into web pages. Prevent with:

#### Automatic Protection with React/JSX
```tsx
// SAFE: React escapes content by default
export default function Post({ content }: { content: string }) {
  return <div>{content}</div>; // Content is escaped automatically
}

// UNSAFE: Using dangerouslySetInnerHTML
export default function Post({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
  // Only use if content is from trusted source and sanitized
}

// SAFE: Sanitize if necessary
import DOMPurify from 'isomorphic-dompurify';

export default function Post({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

#### Content Security Policy (CSP)
Add to `next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.github.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default config;
```

#### Input Validation
```tsx
import { z } from 'zod';

// Schema enforces data type
const BlogPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(10000),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export default function CreatePost() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (formData: FormData) => {
    try {
      const data = Object.fromEntries(formData);
      const validated = BlogPostSchema.parse(data);
      // Safe to use now
      await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(validated),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit}>
      <input name="title" type="text" />
      {errors.title && <span>{errors.title}</span>}
      {/* ... */}
    </form>
  );
}
```

### 2. Cross-Site Request Forgery (CSRF) Prevention

Prevent unauthorized requests to your API.

#### CSRF Token Handling
Implement CSRF protection with tokens in forms:
```tsx
export default function Form() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('/api/csrf-token').then(res => res.json()).then(data => setCsrfToken(data.token));
  }, []);

  return (
    <form method="POST" action="/api/submit">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* ... */}
    </form>
  );
}
```

// API route
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get('csrfToken');

  // Verify token
  if (!verifyCSRFToken(token)) {
    return NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 });
  }

  // Process form
  return NextResponse.json({ success: true });
}
```

### 3. Secure Headers

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default config;
```

### 4. Public Access & API Security

This application has public access to all pages and API endpoints. When adding authentication in the future, implement proper session management and authorization checks.

#### API Route Security Best Practices
```tsx
// Validate all API inputs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize inputs before processing
    const sanitized = {
      email: body.email.toLowerCase().trim(),
      content: DOMPurify.sanitize(body.content),
    };

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Backend Security

### 1. API Route Security

#### Input Validation
```tsx
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  published: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = PostSchema.parse(body);

    // Safe to use validated data
    const post = await prisma.blogPost.create({
      data: validated,
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### SQL Injection Prevention
```tsx
// ✅ SAFE: Prisma parameterizes queries
const user = await prisma.user.findUnique({
  where: { email: userInput }, // Safely escaped
});

// ✅ SAFE: Raw queries with parameters
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${email}
`;

// ❌ UNSAFE: String concatenation (never do this!)
const query = `SELECT * FROM User WHERE email = '${email}'`;
```

#### Rate Limiting
```tsx
// npm install next-rate-limit
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
});

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Process request
  return NextResponse.json({ success: true });
}
```

#### Error Handling (Don't Leak Information)
```tsx
// ❌ BAD: Exposes sensitive information
export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(request.nextUrl.searchParams.get('id')!) },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: error.message }, // Reveals database errors!
      { status: 500 }
    );
  }
}

// ✅ GOOD: Generic error messages
export async function GET(request: NextRequest) {
  try {
    const id = parseInt(request.nextUrl.searchParams.get('id') || '');
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error); // Log internally
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. Authentication & Authorization

```tsx
// lib/auth.ts
import { JWT } from 'next-auth/jwt';

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

// Verify user role
export async function requireRole(role: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== role) {
    throw new Error('Insufficient permissions');
  }

  return session;
}

// In API route
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Only admin can delete posts
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can delete posts' },
      { status: 403 }
    );
  }

  const id = parseInt(request.nextUrl.searchParams.get('id') || '');
  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

### 3. Environment Variables Security

```env
# .env.local (NEVER commit to git)
DATABASE_URL="postgresql://user:password@host:5432/db"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"
```

Configuration in `next.config.ts`:
```typescript
// publicRuntimeConfig for client-side (don't put secrets here!)
// serverRuntimeConfig for server-side only

export const config = {
  publicRuntimeConfig: {
    APP_NAME: 'QAi Talks',
  },
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};
```

---

## Infrastructure Security

### 1. HTTPS Support

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS (in production)
  ...(process.env.NODE_ENV === 'production' && {
    async redirects() {
      return [
        {
          source: '/:path*',
          destination: 'https://qaitalks.com/:path*',
          permanent: true,
        },
      ];
    },
  }),
};

export default config;
```

### 2. Database Connection Security

```typescript
// Prisma connection with SSL
// .env.local
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

// Or with certificate
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require&sslcert=/path/to/cert.pem"
```

### 3. Secrets Management

Use environment variables for sensitive data:
```env
# Vercel (production)
# Set these in Settings > Environment Variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"
```

Generate secure secrets:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -hex 32
# Output: a1b2c3d4e5f6...

# Add to .env.local local development
# Add to Vercel dashboard for production
```

### 4. Dependency Security

Check for vulnerabilities:
```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update
```

Add to CI/CD pipeline (GitHub Actions):
```yaml
name: Security Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm audit --audit-level moderate
```

### 5. Logging & Monitoring

```tsx
// lib/logger.ts
export function logSecurityEvent(event: string, details: Record<string, any>) {
  // In production, send to monitoring service (Sentry, LogRocket, etc.)
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    details,
    environment: process.env.NODE_ENV,
  };

  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    fetch('https://monitoring-service.com/log', {
      method: 'POST',
      body: JSON.stringify(logEntry),
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    console.log(logEntry);
  }
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    logSecurityEvent('unauthorized_access_attempt', {
      path: request.nextUrl.pathname,
      ip: request.ip,
    });

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    logSecurityEvent('api_error', {
      path: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Security Checklist

Before deploying to production:

- [ ] Environment variables set in production (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- [ ] HTTPS enforced (Strict-Transport-Security header)
- [ ] Content Security Policy configured
- [ ] All API routes require authentication (where applicable)
- [ ] Input validation on all endpoints
- [ ] Error messages don't reveal sensitive information
- [ ] Database backups configured
- [ ] Dependency vulnerabilities audited (`npm audit`)
- [ ] Secrets (passwords, tokens) never in code or git
- [ ] Security headers configured (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Rate limiting on sensitive endpoints
- [ ] Logging and monitoring configured
- [ ] CORS properly configured (if needed)
- [ ] NoSQL injection prevention (if using NoSQL)

---

## Incident Response

If a security issue is discovered:

1. **Contain:** Disable affected functionality if necessary
2. **Assess:** Determine scope and impact
3. **Rotate:** Change compromised secrets immediately
4. **Patch:** Apply fix and deploy to production
5. **Communicate:** Notify users if data was affected
6. **Review:** Post-incident review to prevent recurrence

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Next-Auth.js Documentation](https://next-auth.js.org/)
- [Prisma Security](https://www.prisma.io/docs/concepts/database-connectors/postgresql#securing-the-connection)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Last Updated:** February 8, 2026
**See Also:** [DEVELOPMENT.md](DEVELOPMENT.md), [DATABASE.md](DATABASE.md)
