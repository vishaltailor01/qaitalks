# ADR-005: Security Headers, CSP, and CSRF Protection

Date: 2026-02-13

## Status
Accepted

## Context
The application runs on Cloudflare Pages/Workers with a goal of operating securely on free tiers at ~1k DAU. We stream AI responses via SSE and accept POST requests to API routes. We need baseline protections without introducing heavy dependencies.

## Decision
Implement security headers and CSP globally via `next.config.ts` and add simple CSRF protection and input validation to critical POST routes.

### Measures
- Content-Security-Policy with strict defaults, permitting SSE/fetch to same origin.
- Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy; HSTS in production.
- CSRF: same-origin check on POST requests by comparing `Origin` to `request.nextUrl.origin`.
- Input validation: Zod schemas for API payloads (min lengths, type safety).

## Rationale
- Headers and CSP provide defense-in-depth for XSS, clickjacking, and mixed content without runtime cost.
- Same-origin CSRF check is effective for our use-case (no cross-site POSTs) and complements `next-auth` session cookies.
- Zod ensures structured, typed inputs and reduces server-side error surface.

## Consequences
- In development, CSP allows inline/eval for HMR; production CSP is stricter.
- External connections must be explicitly whitelisted in CSP if added (e.g., telemetry endpoints).
- Future: consider `@next-safe/middleware` or token-based CSRF if we introduce cross-origin scenarios.

## Links
- OWASP Cheat Sheet Series — Security Headers
- Next.js `headers()` configuration