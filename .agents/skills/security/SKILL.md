# Security Skill

## Overview
Frontend, backend, and infrastructure security best practices including authentication, validation, and secrets management.

## When to Use
- Building authentication and authorization features
- Creating API routes with data validation
- Managing secrets and environment variables
- Preventing XSS, CSRF, and SQL injection
- Implementing rate limiting or API security

## Key Files
- **Guide:** `SECURITY.md` (in this directory)
- **Auth:** `lib/auth.ts`, `app/(auth)/` routes
- **Config:** `.env.local`, environment variables
- **API:** `app/api/` routes with validation

## Key Patterns
- Always validate input on both client and server
- Use NextAuth.js for OAuth and authentication
- Never expose secrets in code or frontend
- Implement rate limiting on API routes
- Use HTTPS in production
- Set proper CSP and security headers
- Sanitize user input to prevent XSS

## Security Checklist
- [ ] All API routes validate input with zod
- [ ] Secrets stored in `.env.local` (never in code)
- [ ] Authentication required for protected routes
- [ ] CORS configured if needed
- [ ] Rate limiting on public endpoints
- [ ] No sensitive data in console logs
- [ ] HTTPS enabled in production

## Output
When generating security code:
1. Always validate input with zod schema
2. Return proper error responses (no stack traces to client)
3. Check user authentication/authorization
4. Use environment variables for secrets
5. Add rate limiting for public endpoints
6. Implement proper CORS headers if needed
