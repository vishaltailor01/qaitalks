---
title: "ADR-002: Auth & Session Hardening"
status: accepted
date: 2026-02-13
---

Context
- Next.js App Router with Auth.js v5; free hosting on Cloudflare Pages.

Decision
- Use secure cookies: HttpOnly, Secure, SameSite=Lax (or Strict where feasible).
- Apply CSRF tokens to all POST/PUT/PATCH/DELETE routes.
- Rate-limit per IP and per user using KV buckets.

Consequences
- Reduces session hijack risk; mitigates abuse.

Implementation Notes
- Validate inputs with Zod; sanitize outputs; add Content Security Policy.
