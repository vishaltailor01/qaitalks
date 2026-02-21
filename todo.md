
# QaiTalk Implementation Todo List

## 1. CV Review & Interview Tool (Complete/Polish)
- [ ] Review and refactor AI service layer for multi-provider fallback (Gemini → HuggingFace)
- [ ] Implement robust rate limiting (10 reviews/IP/24h, Cloudflare KV upgradeable)
- [ ] Add PDF export for all result sections (CV, cover letter, interview Qs, gap analysis)
- [ ] Improve error handling and user feedback for failed generations
	- All error responses must include clear, actionable, user-friendly messages (e.g., "Your resume is too short. Please provide at least 100 characters.").
	- Rate limit errors must include retry time and a helpful explanation.
	- AI provider failures should show "Our AI is temporarily unavailable. Please try again in a few minutes."
	- Unexpected errors should show "An unexpected error occurred. Please try again." and be logged for diagnostics.
	- All errors (validation, sanitization, AI provider, internal) must be logged with requestId, error type, and metadata.
	- Integrate Sentry (or similar) for error tracking in production.
	- Track error rate and response time in metricsStore for SLO monitoring.
	- All error logs must include enough context (requestId, endpoint, user agent, input summary) for debugging.
	- Never leak sensitive user data in error messages or logs.
	- Sanitize all user input and output, and validate with Zod.
	- Add unit and E2E tests for all error scenarios: rate limit, invalid input, sanitization failure, AI provider failure, and internal error.
- [ ] Add E2E and unit tests for all critical paths
- [ ] Document API and UI usage for maintainers

## 2. Dashboard Enhancements
- [ ] Integrate authentication (NextAuth or similar)
	- Use NextAuth.js (Auth.js v5) with GitHub and Google providers, Prisma adapter for persistence.
	- Use secure cookies: HttpOnly, Secure, SameSite=Lax (or Strict where feasible).
	- Sessions expire after 30 days, rolling update every 24 hours.
	- /dashboard and /profile pages require authentication; unauthenticated users are redirected to /auth/signin.
	- Authenticated users can view/edit their profile; API endpoints for profile data require a valid session.
	- All POST/PUT/PATCH/DELETE routes must have CSRF protection (origin check).
	- Rate-limit per IP and per user using KV buckets.
	- Add E2E tests for login, logout, and access control to protected pages.
- [ ] Add user profile page (editable info, avatar, badges)
- [ ] Display personalized course/module recommendations
- [ ] Show real user progress (courses, blog, CV reviews)
- [ ] Add certificate/badge display and download
- [ ] Prepare for future discussion/forum integration

## 3. QA Application Pack (Paid Feature)
- [ ] Design and implement Stripe payment flow (one-off, per pack)
	- After free CV Quick Check, show upsell panel for Application Pack.
	- Clicking upsell triggers Stripe Checkout for one-off payment (£4.99–£7.99).
	- On payment success, generate and display full pack (rewritten CV, before/after bullets, tailored cover letter, interview pack).
	- User can copy, download, or save pack to dashboard.
	- Integrate Stripe for one-off payments (no subscriptions).
	- Implement API endpoints:
		- POST /api/application-pack/purchase (initiate Stripe checkout)
		- POST /api/application-pack/generate (trigger pack generation after payment)
		- GET /api/application-pack/:id (fetch pack content)
		- GET /api/user/application-packs (list user’s packs)
	- Securely store pack content and payment status.
	- Dashboard displays purchased packs and allows download.
	- No sensitive payment data stored on QaiTalk servers (Stripe only).
	- Pack content only accessible to purchasing user; all endpoints require authentication.
	- Payment failures show clear, actionable messages and allow retry.
	- Generation failures show helpful error and allow retry or refund.
	- All errors logged for diagnostics.
	- E2E tests for payment flow, pack generation, and dashboard integration.
	- Unit tests for API endpoints and error scenarios.
- [ ] Build API endpoints for pack purchase, generation, and retrieval
- [ ] Generate and store pack content (rewritten CV, cover letter, interview pack)
- [ ] Integrate pack access/download into dashboard
- [ ] Add E2E tests for purchase and delivery flow

## 4. Micro-Credential Courses & Badges
	- [ ] Build course catalogue page and course detail view
	- [ ] Implement enrollment/payment (Stripe)
	- [ ] Create module player (video, reading, quiz)
	- [ ] Add quiz/exam backend and scoring logic
	- [ ] Award digital badges on completion (profile + CV integration)
	- [ ] Add badge verification endpoint and public badge page
		- On passing a course final exam (≥75%), award a digital badge immediately and store in DB (userId, courseId, awardedAt, verifiedUrl).
		- Badge appears in user’s profile (/profile/badges), CV Application Packs, and as a public share link.
		- Each badge includes course name, issue date, and a verification link.
		- Implement GET /api/badges/:id/verify endpoint (public, returns badge metadata, no sensitive user data).
		- Public badge page at /badges/:id shows badge details, course, issue date, and verifies authenticity.
		- “Verified by QaiTalk” indicator and share options on public badge page.
		- Only badge owner and public verification endpoint can access badge details; no sensitive user data exposed.
		- E2E tests for badge awarding, display, and verification; unit tests for endpoint and privacy controls.

## 5. Internationalization (i18n)
- [ ] Integrate i18n library (next-i18next or similar) with Next.js App Router support; externalize all strings to locale files.
- [ ] Add language switcher to UI, visible on all pages; persist language preference.
- [ ] Translate all core pages: homepage, about, curriculum, dashboard, blog, CV review, sign-in/out, error pages.
- [ ] Localize date, currency, and number formats per user locale.
- [ ] Initial support for English (default), Spanish, French, German; prepare for RTL (Arabic, Hebrew).
- [ ] Ensure layout/components support RTL (test with dummy translations).
- [ ] Prepare for community-contributed blog translations.
- [ ] E2E tests for language switching, page rendering in all supported languages, and RTL layout; manual QA for translation accuracy and layout.

## 6. Blog Content Expansion
- [ ] Add new technical articles per content roadmap
- [ ] Implement scheduled publishing and draft preview
- [ ] Add author bios and social links
- [ ] Improve blog SEO (schema, meta, OG tags)
	- All blog pages include unique, descriptive meta tags (title, description, keywords) optimized for target keywords.
	- Add Open Graph tags (title, description, image, URL) and Twitter Card tags for all blog posts.
	- Implement structured data (JSON-LD) for Article, FAQ, and Organization schema; validate for rich results.
	- Add internal links to related blog posts; ensure navigation/sidebar promote content discovery.
	- Use target keywords in headings and content; optimize for featured snippets (Q&A, summary blocks).
	- Ensure all blog pages are fully responsive and mobile-friendly.
	- Use Lighthouse, Google Search Console, and schema.org validator to verify SEO improvements.
	- Add E2E tests for meta tags, Open Graph, and schema presence.
- [ ] Add blog search and category filtering