# CV Review Tool - GitHub Issues

## Overview

This document contains the breakdown of the CV Review Tool feature into actionable GitHub issues following product management best practices.

**Feature:** AI-Powered CV Review & Interview Preparation Tool  
**Epic:** QaiTalk Platform Enhancement - AI Tools Integration  
**Total Issues:** 23 (7 Small, 11 Medium, 5 Large)  
**Estimated Timeline:** 3 weeks

---

## Issue Sizing Guidelines

- **Small (S):** < 3 days, single responsibility, clear implementation
- **Medium (M):** 4-7 days, moderate complexity, multiple files
- **Large (L):** 8+ days, complex integration, requires Epic breakdown

---

## Epic Structure

```mermaid
graph TD
    Epic[CV Review Tool Epic] --> Phase1[Phase 1: Backend Foundation]
    Epic --> Phase2[Phase 2: Frontend Components]
    Epic --> Phase3[Phase 3: Polish & Integration]
    Epic --> Phase4[Phase 4: Testing & Deployment]
    
    Phase1 --> IR1[AI Service Layer]
    Phase1 --> IR2[API Route]
    Phase1 --> IR3[Rate Limiting]
    Phase1 --> IR4[Security Hardening]
    
    Phase2 --> IR5[CV Review Page]
    Phase2 --> IR6[Form Components]
    Phase2 --> IR7[Output Components]
    Phase2 --> IR8[localStorage Integration]
    
    Phase3 --> IR9[PDF Export]
    Phase3 --> IR10[Dashboard Integration]
    Phase3 --> IR11[Error Handling]
    Phase3 --> IR12[Privacy Controls]
    
    Phase4 --> IR13[Unit Tests]
    Phase4 --> IR14[E2E Tests]
    Phase4 --> IR15[Security Testing]
    Phase4 --> IR16[Documentation]
```

---

## Phase 1: Backend Foundation (Week 1, Days 1-3)

### Issue #1: Set Up AI Service Layer Architecture

**Labels:** `component:backend`, `size:medium`, `phase:1-foundation`, `priority:critical`

**Overview:**
Create the foundational AI service layer with TypeScript interfaces, provider abstraction, and orchestration logic.

**User Story:**
As a **backend developer**, I want **a clean AI service architecture** so that **I can easily integrate multiple AI providers with automatic fallback**.

**Context:**
- New functionality (no existing AI integrations in QaiTalk)
- Must be compatible with Cloudflare Edge Runtime
- Support for Gemini (primary) and HuggingFace (fallback)

**Acceptance Criteria:**
- [ ] TypeScript interfaces defined in `lib/ai/types.ts`
- [ ] AI provider interface created (`AIProvider`)
- [ ] Request/Response types defined (`CVGenerationRequest`, `CVGenerationResponse`)
- [ ] Orchestrator logic routes to primary then fallback provider
- [ ] All types exported from `lib/ai/index.ts`

**Technical Requirements:**
- TypeScript 5 strict mode
- Edge Runtime compatible (no Node.js-specific APIs)
- Clean separation of concerns (types, providers, orchestrator)

**Definition of Done:**
- [ ] Types compile without errors
- [ ] Code passes ESLint checks
- [ ] Unit tests for orchestrator (85%+ coverage)
- [ ] PR approved by tech lead

**Dependencies:** None (first task in Phase 1)

**Estimated Effort:** 1.5 days

---

### Issue #2: Implement Gemini AI Provider

**Labels:** `component:ai-services`, `size:medium`, `phase:1-foundation`, `priority:critical`

**Overview:**
Implement the Gemini 2.0 Flash provider with prompt engineering for CV review generation.

**User Story:**
As a **backend developer**, I want **Gemini integration** so that **I can generate AI-powered CV reviews**.

**Context:**
- Free tier: 1,500 requests/day
- Model: gemini-2.0-flash-exp
- Prompt must include 4 sections: ATS resume, interview guide, technical questions, gap analysis

**Acceptance Criteria:**
- [ ] `lib/ai/providers/gemini.ts` created
- [ ] API key loaded from `process.env.GEMINI_API_KEY`
- [ ] Prompt template includes clear delimiters (resume/job description)
- [ ] Response parsing extracts 4 sections + matched keywords
- [ ] Error handling for API failures (404, 500, timeout)
- [ ] Timeout set to 60 seconds

**Technical Requirements:**
- SDK: `@google/generative-ai` (official package)
- Prompt injection defenses (sanitize input)
- Output validation (ensure all 4 sections present)

**Definition of Done:**
- [ ] Provider generates CV review successfully
- [ ] Unit tests with mocked API calls (85%+ coverage)
- [ ] Manual test with real Gemini API key
- [ ] Documentation added to code comments

**Dependencies:** Issue #1 (AI Service Layer)

**Estimated Effort:** 2 days

---

### Issue #3: Implement HuggingFace Fallback Provider

**Labels:** `component:ai-services`, `size:medium`, `phase:1-foundation`, `priority:high`

**Overview:**
Implement HuggingFace Llama-3.3-70B provider as fallback when Gemini fails.

**User Story:**
As a **backend developer**, I want **HuggingFace fallback** so that **the service remains available even if Gemini is down**.

**Context:**
- Free tier: 30,000 requests/month
- Model: meta-llama/Llama-3.3-70B-Instruct
- Same prompt template as Gemini for consistency

**Acceptance Criteria:**
- [ ] `lib/ai/providers/huggingface.ts` created
- [ ] API key loaded from `process.env.HF_API_KEY`
- [ ] Same prompt template as Gemini (reuse)
- [ ] Response parsing handles HuggingFace format
- [ ] Automatic retry on transient failures

**Technical Requirements:**
- SDK: `@huggingface/inference` (official package)
- Edge Runtime compatible
- Same output format as Gemini provider

**Definition of Done:**
- [ ] Provider generates CV review successfully
- [ ] Unit tests with mocked API calls (85%+ coverage)
- [ ] Integration test: Gemini fails → HuggingFace succeeds
- [ ] Performance benchmark: generation time < 60s (p95)

**Dependencies:** Issue #1 (AI Service Layer), Issue #2 (Gemini Provider for prompt template)

**Estimated Effort:** 1.5 days

---

### Issue #4: Implement IP-Based Rate Limiting

**Labels:** `component:backend`, `size:small`, `phase:1-foundation`, `priority:high`

**Overview:**
Create in-memory rate limiter to prevent abuse (10 requests per IP per 24 hours).

**User Story:**
As a **platform owner**, I want **rate limiting** so that **users cannot abuse the free AI API quota**.

**Context:**
- Simple in-memory Map (can upgrade to Cloudflare KV later)
- Resets on server restart (acceptable for MVP)
- Must extract IP from Cloudflare headers

**Acceptance Criteria:**
- [ ] `lib/ai/rate-limiter.ts` created
- [ ] `checkRateLimit(ip: string): boolean` function
- [ ] `getClientIP(request: Request): string` helper
- [ ] Block 11th request from same IP
- [ ] Reset counter after 24 hours
- [ ] Support Cloudflare headers (CF-Connecting-IP, X-Real-IP, X-Forwarded-For)

**Technical Requirements:**
- In-memory Map storage: `Map<string, RateLimitEntry>`
- Type: `RateLimitEntry = { count: number, resetAt: Date }`
- Edge Runtime compatible

**Definition of Done:**
- [ ] Rate limiter blocks excessive requests
- [ ] Unit tests cover all scenarios (85%+ coverage)
- [ ] Test with multiple IPs (should be independent)
- [ ] Documentation explains 24-hour window

**Dependencies:** None (independent task)

**Estimated Effort:** 1 day

---

### Issue #5: Create CV Review API Route

**Labels:** `component:api`, `size:medium`, `phase:1-foundation`, `priority:critical`

**Overview:**
Create POST `/api/cv-review/generate` endpoint with validation, rate limiting, and AI orchestration.

**User Story:**
As a **frontend developer**, I want **a RESTful API** so that **I can submit CV review requests from the UI**.

**Context:**
- Edge Runtime compatible (Cloudflare Pages)
- Public endpoint (no authentication)
- Input validation: max 10k characters per field

**Acceptance Criteria:**
- [ ] `app/api/cv-review/generate/route.ts` created
- [ ] POST handler accepts: `{ resume: string, jobDescription: string }`
- [ ] IP extraction using `getClientIP()`
- [ ] Rate limit check before processing
- [ ] Input validation (required fields, max length)
- [ ] AI generation via orchestrator
- [ ] Response format: `{ atsResume, interviewGuide, domainQuestions, gapAnalysis, matchedKeywords, metadata }`
- [ ] Error responses: 400 (invalid input), 429 (rate limit), 503 (AI unavailable)
- [ ] Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy

**Technical Requirements:**
- Edge Runtime: `export const runtime = 'edge'`
- TypeScript types from `lib/ai/types.ts`
- Error handling for all failure modes

**Definition of Done:**
- [ ] API returns CV review successfully
- [ ] Rate limiting enforced (11th request blocked)
- [ ] Invalid input rejected with 400 error
- [ ] Integration test with real AI providers
- [ ] Postman/cURL documentation created

**Dependencies:** Issue #1, #2, #3, #4

**Estimated Effort:** 2 days

---

### Issue #6: Security Hardening (Prompt Injection & XSS)

**Labels:** `component:security`, `size:medium`, `phase:1-foundation`, `priority:critical`

**Overview:**
Implement security defenses against prompt injection attacks and XSS via AI output.

**User Story:**
As a **security engineer**, I want **input/output sanitization** so that **attackers cannot manipulate the AI or inject malicious code**.

**Context:**
- Priority 1 issue from Security Review
- Must sanitize both input (prompt injection) and output (XSS)

**Acceptance Criteria:**
- [ ] Input sanitization: Remove "Ignore previous instructions", system markers
- [ ] Prompt delimiters: Use `===== RESUME START =====` / `===== RESUME END =====`
- [ ] Output sanitization: DOMPurify with allowlist (p, br, strong, em, ul, li, h1-h3)
- [ ] PII scrubbing: Remove emails, phone numbers, SSNs from AI output
- [ ] Validation: Reject output with suspicious patterns (API key, password, cryptocurrency)

**Technical Requirements:**
- Install: `npm install isomorphic-dompurify`
- Edge Runtime compatible sanitization
- No performance degradation (sanitization < 100ms)

**Definition of Done:**
- [ ] Prompt injection tests pass (10 test cases)
- [ ] XSS tests pass (5 test cases with <script>, <img onerror>)
- [ ] PII scrubbing verified
- [ ] Security review approved

**Dependencies:** Issue #2, #3 (AI providers)

**Estimated Effort:** 2 days

---

## Phase 2: Frontend Components (Week 1 Day 4 - Week 2 Day 2)

### Issue #7: Create CV Review Page

**Labels:** `component:frontend`, `size:small`, `phase:2-frontend`, `priority:high`

**Overview:**
Create `/cv-review` page with tab navigation (Generate vs History) and privacy banner.

**User Story:**
As a **user**, I want **a dedicated CV review page** so that **I can easily access the AI tool**.

**Context:**
- Client component (uses useState)
- Tabs: "Generate" (form + results) and "My Results" (history)
- Privacy banner: "🔒 Your data stays in your browser. We don't store anything."

**Acceptance Criteria:**
- [ ] `app/cv-review/page.tsx` created
- [ ] Tab navigation (Generate / My Results)
- [ ] Privacy banner visible above tabs
- [ ] Active tab state managed with useState
- [ ] Mobile responsive (375px, 768px, 1024px)
- [ ] Page title: "AI-Powered CV Review | QaiTalk"

**Technical Requirements:**
- Client component: `'use client'`
- Tailwind CSS for styling
- Zustand store for results (optional)

**Definition of Done:**
- [ ] Page renders without errors
- [ ] Tab switching works
- [ ] Responsive on all screen sizes
- [ ] Accessibility: keyboard navigation, ARIA labels

**Dependencies:** None (independent task)

**Estimated Effort:** 1 day

---

### Issue #8: Build CV Upload Form Component

**Labels:** `component:frontend`, `size:medium`, `phase:2-frontend`, `priority:critical`

**Overview:**
Create form component with resume/job description textareas and character counters.

**User Story:**
As a **user**, I want **an intuitive form** so that **I can easily paste my resume and job description**.

**Context:**
- Two textareas: Resume (left) and Job Description (right)
- Character counter: "X / 10,000 characters"
- Submit button disabled until both fields filled

**Acceptance Criteria:**
- [ ] `components/cv-review/CVUploadForm.tsx` created
- [ ] Two textareas with 10,000 character limit (maxLength)
- [ ] Real-time character counters below each textarea
- [ ] Submit button: "Generate CV Review"
- [ ] Button disabled when: loading OR either field empty OR field too long
- [ ] Loading state: "Generating..." with spinner
- [ ] Form validation: show error if fields empty on submit

**Technical Requirements:**
- Props: `onSubmit: (data: CVGenerationRequest) => Promise<void>`, `loading: boolean`
- Form state: useState for resume, jobDescription
- Grid layout: 2 columns on desktop, 1 column on mobile

**Definition of Done:**
- [ ] Form accepts valid input
- [ ] Character counters update in real-time
- [ ] Submit disabled when invalid
- [ ] Component test coverage (85%+)
- [ ] Storybook story created (if using Storybook)

**Dependencies:** None (independent task)

**Estimated Effort:** 1.5 days

---

### Issue #9: Build Output Tabs Component

**Labels:** `component:frontend`, `size:medium`, `phase:2-frontend`, `priority:high`

**Overview:**
Create tabbed output component for displaying 4 CV review sections.

**User Story:**
As a **user**, I want **organized tabs** so that **I can easily navigate between different sections of my CV review**.

**Context:**
- 4 tabs: ATS Resume, Interview Guide, Technical Questions, Gap Analysis
- Tab navigation with active state
- Action buttons: Export PDF, Copy to Clipboard

**Acceptance Criteria:**
- [ ] `components/cv-review/CVOutput.tsx` created
- [ ] Tab headers: Resume | Interview | Technical | Gap Analysis
- [ ] Active tab highlighted (blue underline)
- [ ] Tab content conditional render based on activeTab state
- [ ] Action buttons below content
- [ ] Mobile: Tabs scroll horizontally if needed

**Technical Requirements:**
- Props: `data: CVGenerationResponse`
- State: `activeTab: 'resume' | 'interview' | 'technical' | 'gap'`
- Lazy load tab content (only render active tab)

**Definition of Done:**
- [ ] All 4 tabs render correctly
- [ ] Tab switching works smoothly
- [ ] No layout shift when switching tabs
- [ ] Keyboard accessible (arrow keys to switch tabs)

**Dependencies:** Issue #8 (form must generate data first)

**Estimated Effort:** 1.5 days

---

### Issue #10: Port Resume Output Component (ATS-Optimized)

**Labels:** `component:frontend`, `size:medium`, `phase:2-frontend`, `priority:high`

**Overview:**
Create component for displaying ATS-optimized resume with keyword highlighting.

**User Story:**
As a **user**, I want **my resume displayed with matched keywords highlighted** so that **I can see which terms align with the job description**.

**Context:**
- Port from QAi-CV-Tool project (ResumeOutput component)
- Highlight keywords with yellow background
- Copy to clipboard button

**Acceptance Criteria:**
- [ ] `components/cv-review/ResumeOutput.tsx` created
- [ ] Render ATS resume with markdown formatting
- [ ] Highlight matched keywords (yellow background)
- [ ] Copy button: "Copy to Clipboard"
- [ ] Toast notification: "Copied to clipboard!"
- [ ] Sanitize output with DOMPurify before rendering

**Technical Requirements:**
- Props: `content: string`, `keywords: string[]`
- Use `DOMPurify.sanitize()` before rendering
- Keyword highlighting regex: `\b${keyword}\b` (word boundary)

**Definition of Done:**
- [ ] Keywords highlighted correctly
- [ ] Copy to clipboard works
- [ ] No XSS vulnerabilities (DOMPurify test)
- [ ] Component test coverage (85%+)

**Dependencies:** Issue #9 (output tabs container)

**Estimated Effort:** 1.5 days

---

### Issue #11: Port Interview Guide Component

**Labels:** `component:frontend`, `size:medium`, `phase:2-frontend`, `priority:high`

**Overview:**
Create component for displaying interview questions with accordion UI and roadmap visualization.

**User Story:**
As a **user**, I want **interview questions in an expandable format** so that **I can focus on one question at a time**.

**Context:**
- Port from QAi-CV-Tool project (InterviewGuideOutput component)
- Parse questions using QUESTION_START/END markers
- Accordion with roadmap line connecting questions

**Acceptance Criteria:**
- [ ] `components/cv-review/InterviewGuideOutput.tsx` created
- [ ] Parse questions using markers: `### QUESTION_START ###` ... `### QUESTION_END ###`
- [ ] Accordion UI: Click to expand/collapse
- [ ] Roadmap line: Vertical blue line connecting questions
- [ ] Default: First question expanded, rest collapsed

**Technical Requirements:**
- Props: `content: string`
- Parse function: Extract 10 questions from markers
- useState: Track which accordions are open
- Reusable: `components/cv-review/shared/Accordion.tsx`

**Definition of Done:**
- [ ] All questions parsed correctly
- [ ] Accordion expand/collapse works
- [ ] Roadmap line renders correctly
- [ ] Mobile responsive

**Dependencies:** Issue #9 (output tabs container)

**Estimated Effort:** 2 days

---

### Issue #12: Port Domain Expertise Component

**Labels:** `component:frontend`, `size:small`, `phase:2-frontend`, `priority:medium`

**Overview:**
Create component for displaying technical scenarios in card format.

**User Story:**
As a **user**, I want **technical scenarios in cards** so that **I can easily scan through different technical challenges**.

**Context:**
- Port from QAi-CV-Tool project (DomainExpertiseOutput component)
- Parse scenarios using DOMAIN_START/END markers
- Display as cards with scenario number

**Acceptance Criteria:**
- [ ] `components/cv-review/DomainExpertiseOutput.tsx` created
- [ ] Parse scenarios using markers: `### DOMAIN_START ###` ... `### DOMAIN_END ###`
- [ ] Display as cards: "Scenario 1", "Scenario 2", etc.
- [ ] Grid layout: 1 column mobile, 2 columns desktop

**Technical Requirements:**
- Props: `content: string`
- Parse function: Extract 5-7 scenarios
- Card styling: Border, padding, shadow

**Definition of Done:**
- [ ] All scenarios parsed correctly
- [ ] Cards responsive
- [ ] Readable on all devices

**Dependencies:** Issue #9 (output tabs container)

**Estimated Effort:** 1 day

---

### Issue #13: Port Gap Analysis Component

**Labels:** `component:frontend`, `size:small`, `phase:2-frontend`, `priority:medium`

**Overview:**
Create component for displaying gap analysis with strategy cards and icons.

**User Story:**
As a **user**, I want **gap analysis with visual icons** so that **I can quickly understand improvement strategies**.

**Context:**
- Port from QAi-CV-Tool project (GapAnalysisOutput component)
- Parse bullet list from AI output
- Display as strategy cards with icons

**Acceptance Criteria:**
- [ ] `components/cv-review/GapAnalysisOutput.tsx` created
- [ ] Parse bullet points from AI output (markdown list)
- [ ] Display as cards with icons (📚 for certifications, 💼 for projects, etc.)
- [ ] Grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop

**Technical Requirements:**
- Props: `content: string`
- Parse function: Extract bullet points
- Icon mapping: Keyword-based (certification → 📚, project → 💼)

**Definition of Done:**
- [ ] Strategies parsed correctly
- [ ] Icons displayed
- [ ] Cards responsive

**Dependencies:** Issue #9 (output tabs container)

**Estimated Effort:** 1 day

---

### Issue #14: Implement localStorage Integration

**Labels:** `component:frontend`, `size:small`, `phase:2-frontend`, `priority:high`

**Overview:**
Create localStorage helpers to save/load/delete CV review results (max 5 recent).

**User Story:**
As a **user**, I want **my results saved in my browser** so that **I can review them later without re-generating**.

**Context:**
- Max 5 results (FIFO eviction)
- LocalStorage key: `qaitalks-cv-results`
- No server-side storage (privacy-first)

**Acceptance Criteria:**
- [ ] `lib/storage.ts` created
- [ ] `saveResult(result: CVGenerationResponse): void` function
- [ ] `getResults(): CVGenerationResponse[]` function
- [ ] `deleteResult(id: string): void` function
- [ ] `clearAll(): void` function
- [ ] Auto-evict oldest result when saving 6th result

**Technical Requirements:**
- Try-catch for localStorage errors (quota exceeded)
- Validate JSON before parsing (prevent corruption)
- Generate unique ID for each result (UUID or timestamp)

**Definition of Done:**
- [ ] Save/load/delete works correctly
- [ ] Max 5 results enforced
- [ ] Error handling for quota exceeded
- [ ] Unit tests (85%+ coverage)

**Dependencies:** None (independent task)

**Estimated Effort:** 1 day

---

### Issue #15: Build History Tab (My Results)

**Labels:** `component:frontend`, `size:small`, `phase:2-frontend`, `priority:medium`

**Overview:**
Create history tab to display saved results with delete actions.

**User Story:**
As a **user**, I want **to view my past CV reviews** so that **I can compare different versions or job applications**.

**Context:**
- Display list of saved results (most recent first)
- Each item: Timestamp, job title (extracted from job description), Delete button
- Click item to view full results

**Acceptance Criteria:**
- [ ] Load results from localStorage on mount
- [ ] Display list: Timestamp (relative, e.g., "2 hours ago"), job title preview
- [ ] Click item to load results in Generate tab
- [ ] Delete button (trash icon) per item
- [ ] "Clear All" button at bottom
- [ ] Empty state: "No saved results yet"

**Technical Requirements:**
- Use `getResults()` from `lib/storage.ts`
- Format timestamp: `formatDistanceToNow()` from `date-fns`
- Extract job title: First heading from job description (fallback: "CV Review")

**Definition of Done:**
- [ ] History displays correctly
- [ ] Delete individual item works
- [ ] Clear all works
- [ ] Click item loads results

**Dependencies:** Issue #14 (localStorage helpers)

**Estimated Effort:** 1 day

---

## Phase 3: Polish & Integration (Week 2, Days 3-5)

### Issue #16: Implement PDF Export

**Labels:** `component:frontend`, `size:medium`, `phase:3-polish`, `priority:medium`

**Overview:**
Create PDF export functionality using html2canvas + jspdf.

**User Story:**
As a **user**, I want **to export my CV review as PDF** so that **I can save it for offline reference or printing**.

**Context:**
- Client-side PDF generation (no backend)
- Capture all 4 sections in one PDF
- Professional formatting with headers

**Acceptance Criteria:**
- [ ] `lib/pdf-export.ts` created
- [ ] `exportToPDF(data: CVGenerationResponse): Promise<void>` function
- [ ] PDF includes: Header (QaiTalk logo, timestamp), 4 sections (ATS Resume, Interview Guide, Technical, Gap Analysis)
- [ ] Filename: `cv-review-{timestamp}.pdf`
- [ ] Loading indicator during generation (3-5 seconds)
- [ ] Toast notification: "PDF downloaded!"

**Technical Requirements:**
- Install: `npm install html2canvas jspdf`
- CSS for PDF: `app/cv-review/cv-review.css` (print-specific styles)
- Preserve formatting: Page breaks, headers, spacing

**Definition of Done:**
- [ ] PDF exports successfully
- [ ] All sections included
- [ ] Professional formatting
- [ ] Works on desktop and mobile

**Dependencies:** Issue #9 (output components)

**Estimated Effort:** 2 days

---

### Issue #17: Dashboard Integration (Add CV Tool Card)

**Labels:** `component:frontend`, `size:small`, `phase:3-polish`, `priority:high`

**Overview:**
Add CV Review Tool card to dashboard with icon and CTA.

**User Story:**
As a **user**, I want **to discover the CV tool from the dashboard** so that **I can easily navigate to it**.

**Context:**
- Update `app/dashboard/page.tsx`
- Add card: "AI-Powered CV Review" with description and "Try Now" button
- Icon: 📄 or robot emoji

**Acceptance Criteria:**
- [ ] New card added to dashboard grid
- [ ] Card title: "AI-Powered CV Review"
- [ ] Card description: "Get ATS-optimized feedback, interview prep, and gap analysis"
- [ ] Button: "Try Now →" links to `/cv-review`
- [ ] Card styling matches existing dashboard cards

**Technical Requirements:**
- No breaking changes to existing dashboard
- Responsive grid layout (handles additional card)

**Definition of Done:**
- [ ] Card renders correctly
- [ ] Link works
- [ ] Responsive on all devices
- [ ] E2E test: Click card → Navigate to /cv-review

**Dependencies:** Issue #7 (CV review page exists)

**Estimated Effort:** 0.5 days

---

### Issue #18: Navigation Integration (Add Header Link)

**Labels:** `component:frontend`, `size:small`, `phase:3-polish`, `priority:medium`

**Overview:**
Add "CV Review" link to navigation header.

**User Story:**
As a **user**, I want **quick access to the CV tool via navigation** so that **I don't have to go through the dashboard**.

**Context:**
- Update `components/layout/Header.tsx`
- Add link between "Curriculum" and "Dashboard"
- Icon: 📄 (optional)

**Acceptance Criteria:**
- [ ] New nav item: "CV Review"
- [ ] Links to `/cv-review`
- [ ] Active state when on CV review page
- [ ] Mobile: Item included in hamburger menu

**Technical Requirements:**
- No breaking changes to existing navigation
- Active state: `pathname === '/cv-review'`

**Definition of Done:**
- [ ] Link renders correctly
- [ ] Active state works
- [ ] Mobile menu includes link

**Dependencies:** Issue #7 (CV review page exists)

**Estimated Effort:** 0.5 days

---

### Issue #19: Comprehensive Error Handling & Toast Notifications

**Labels:** `component:frontend`, `size:medium`, `phase:3-polish`, `priority:high`

**Overview:**
Implement comprehensive error handling with user-friendly toast notifications.

**User Story:**
As a **user**, I want **clear error messages** so that **I know what went wrong and how to fix it**.

**Context:**
- Install: `npm install react-hot-toast`
- Handle all error scenarios: Rate limit, AI timeout, invalid input, network error

**Acceptance Criteria:**
- [ ] Toast library integrated: `react-hot-toast`
- [ ] Success toast: "CV review generated!" (green)
- [ ] Error toasts:
  - Rate limit: "Daily limit reached. Try again tomorrow!" (red)
  - AI timeout: "Generation taking longer than usual. Please try again." (orange)
  - Invalid input: "Please fill in both fields" (yellow)
  - Network error: "Connection error. Check your internet." (red)
- [ ] Toast position: top-right
- [ ] Auto-dismiss: 5 seconds (errors), 3 seconds (success)

**Technical Requirements:**
- Wrap app in `<Toaster />` component (`app/layout.tsx`)
- Error parsing: Extract user-friendly message from API error codes

**Definition of Done:**
- [ ] All error scenarios show toast
- [ ] Toasts visually appealing
- [ ] Auto-dismiss works
- [ ] Accessible (screen reader support)

**Dependencies:** Issue #5 (API route with error codes)

**Estimated Effort:** 1 day

---

### Issue #20: Privacy Controls & User Education

**Labels:** `component:frontend`, `size:small`, `phase:3-polish`, `priority:high`

**Overview:**
Add privacy banner, localStorage warning, and AI disclaimer.

**User Story:**
As a **user**, I want **transparency about data handling** so that **I can trust the tool with my sensitive resume data**.

**Context:**
- GDPR compliance: Inform users about localStorage
- AI disclaimer: Manage expectations
- Clear notice: No server-side storage

**Acceptance Criteria:**
- [ ] Privacy banner above form: "🔒 Your data stays in your browser. We don't store anything."
- [ ] localStorage warning in history tab: "Results are stored locally. Clear your browser data to remove."
- [ ] AI disclaimer above results: "⚠️ AI-Generated Content: Always review before using."
- [ ] Link to Terms of Service (if exists)

**Technical Requirements:**
- Banners: Blue background (info), yellow (warning)
- Dismissible: Save preference to localStorage (optional)

**Definition of Done:**
- [ ] All notices displayed correctly
- [ ] Users informed of data handling
- [ ] Legal/compliance approved

**Dependencies:** None (independent task)

**Estimated Effort:** 0.5 days

---

## Phase 4: Testing & Documentation (Week 3)

### Issue #21: Unit Tests (85%+ Coverage)

**Labels:** `component:testing`, `size:large`, `phase:4-testing`, `priority:critical`

**Overview:**
Write comprehensive unit tests for all backend and frontend logic.

**User Story:**
As a **QA engineer**, I want **high test coverage** so that **we catch bugs before production**.

**Context:**
- Target: 85%+ coverage (lines, statements, branches, functions)
- Jest + React Testing Library
- Mock external API calls

**Acceptance Criteria:**
- [ ] Backend tests: AI orchestrator, rate limiter, input sanitization, output validation
- [ ] Frontend tests: Form component, output components, localStorage helpers
- [ ] Mock external calls: Gemini API, HuggingFace API
- [ ] Test all error paths
- [ ] Coverage report generated: `npm run test:coverage`

**Technical Requirements:**
- Jest configuration: `jest.config.ts` already exists
- Mocking: `jest.mock('@google/generative-ai')`
- Assertions: `expect`, `toBeInTheDocument`, `toHaveBeenCalledWith`

**Definition of Done:**
- [ ] 85%+ coverage achieved
- [ ] All tests pass
- [ ] No flaky tests
- [ ] CI/CD runs tests on PR

**Dependencies:** All Phase 1-3 issues (code must exist first)

**Estimated Effort:** 3 days

---

### Issue #22: E2E Tests (Playwright)

**Labels:** `component:testing`, `size:medium`, `phase:4-testing`, `priority:high`

**Overview:**
Write end-to-end tests for full user journey using Playwright.

**User Story:**
As a **QA engineer**, I want **E2E tests** so that **we verify the entire flow works as expected**.

**Context:**
- Playwright already configured (`playwright.config.ts`)
- Test across browsers: Chromium, Firefox, WebKit
- Mock AI API responses (use test API keys or mock server)

**Acceptance Criteria:**
- [ ] Test: Generate CV review (happy path)
- [ ] Test: Rate limiting (11th request blocked)
- [ ] Test: Invalid input (empty fields)
- [ ] Test: localStorage persistence (refresh page, results still there)
- [ ] Test: PDF export
- [ ] Test: Dashboard navigation to CV tool
- [ ] All tests pass on 3 browsers

**Technical Requirements:**
- Test file: `e2e/cv-review.spec.ts`
- Mock API: Intercept `/api/cv-review/generate` with test responses
- Timeout: 60 seconds for AI generation tests

**Definition of Done:**
- [ ] All E2E tests pass
- [ ] No flaky tests
- [ ] CI/CD runs E2E tests on staging deployment

**Dependencies:** All Phase 1-3 issues (full feature must be complete)

**Estimated Effort:** 2 days

---

### Issue #23: Security Testing & Accessibility Audit

**Labels:** `component:testing`, `size:medium`, `phase:4-testing`, `priority:critical`

**Overview:**
Perform security testing (prompt injection, XSS) and WCAG 2.1 AA accessibility audit.

**User Story:**
As a **security/accessibility engineer**, I want **comprehensive audits** so that **the tool is secure and accessible to all users**.

**Context:**
- Security: Test prompt injection, XSS, rate limiting bypass
- Accessibility: WCAG 2.1 AA compliance (keyboard navigation, screen readers, color contrast)

**Acceptance Criteria:**
- [ ] **Security Tests:**
  - [ ] Prompt injection: 10 test cases (e.g., "Ignore previous instructions...")
  - [ ] XSS: 5 test cases (e.g., `<script>alert('XSS')</script>`)
  - [ ] Rate limiting: Attempt 12 requests from same IP
  - [ ] API key exposure: Verify keys not in client bundle or errors
- [ ] **Accessibility Tests:**
  - [ ] Keyboard navigation: Tab through entire page
  - [ ] Screen reader: Test with NVDA/JAWS
  - [ ] Color contrast: Minimum 4.5:1 (text), 3:1 (UI components)
  - [ ] Focus indicators: Visible on all interactive elements
  - [ ] ARIA labels: All buttons, forms, landmarks
  - [ ] Axe Core: 0 violations

**Technical Requirements:**
- Use `@axe-core/playwright` for automated a11y testing
- Manual testing for screen reader compatibility

**Definition of Done:**
- [ ] All security tests pass
- [ ] 0 accessibility violations (automated)
- [ ] Manual a11y review approved
- [ ] Security review sign-off

**Dependencies:** All Phase 1-3 issues (full feature must be complete)

**Estimated Effort:** 2 days

---

## Issue Summary by Size

| Size | Count | Issues |
|------|-------|--------|
| Small (S) | 7 | #4, #7, #12, #13, #14, #15, #17, #18, #20 |
| Medium (M) | 11 | #1, #2, #3, #5, #6, #8, #9, #10, #11, #16, #19, #22, #23 |
| Large (L) | 1 | #21 |

**Total:** 23 issues

---

## Dependencies Graph

```mermaid
graph LR
    I1[#1: AI Layer] --> I2[#2: Gemini]
    I1 --> I3[#3: HuggingFace]
    I2 --> I5[#5: API Route]
    I3 --> I5
    I4[#4: Rate Limit] --> I5
    I2 --> I6[#6: Security]
    I3 --> I6
    
    I7[#7: CV Page] --> I17[#17: Dashboard]
    I7 --> I18[#18: Navigation]
    
    I8[#8: Form] --> I9[#9: Output Tabs]
    I9 --> I10[#10: Resume Output]
    I9 --> I11[#11: Interview Output]
    I9 --> I12[#12: Domain Output]
    I9 --> I13[#13: Gap Output]
    I9 --> I16[#16: PDF Export]
    
    I14[#14: localStorage] --> I15[#15: History Tab]
    
    I5 --> I19[#19: Error Handling]
    
    I1 --> I21[#21: Unit Tests]
    I2 --> I21
    I3 --> I21
    I4 --> I21
    I5 --> I21
    I6 --> I21
    I8 --> I21
    I9 --> I21
    I10 --> I21
    I14 --> I21
    
    I21 --> I22[#22: E2E Tests]
    I21 --> I23[#23: Security/A11y]
```

---

## Project Board Setup (GitHub Projects)

### Columns
1. **Backlog** (0 issues)
2. **Ready** (Phase 1 issues: #1, #2, #3, #4, #5, #6)
3. **In Progress** (0 issues initially)
4. **In Review** (0 issues initially)
5. **Done** (0 issues initially)

### Filters by Phase
- `phase:1-foundation` (6 issues)
- `phase:2-frontend` (9 issues)
- `phase:3-polish` (4 issues)
- `phase:4-testing` (4 issues)

### Filters by Component
- `component:backend` (2 issues)
- `component:api` (1 issue)
- `component:ai-services` (2 issues)
- `component:security` (1 issue)
- `component:frontend` (13 issues)
- `component:testing` (3 issues)

### Labels Summary
- **Priority:** `priority:critical` (6), `priority:high` (10), `priority:medium` (7)
- **Size:** `size:small` (7), `size:medium` (11), `size:large` (1)
- **Phase:** `phase:1-foundation` (6), `phase:2-frontend` (9), `phase:3-polish` (4), `phase:4-testing` (4)
- **Component:** (see filters above)

---

## Related Documentation

- **Product Requirements:** [prd.md](./prd.md)
- **Strategic Plan:** [strategic-plan.md](./strategic-plan.md)
- **Implementation Plan:** [implementation-plan.md](./implementation-plan.md)
- **Security Review:** [security-review.md](./security-review.md)

**Status:** ✅ Ready for GitHub Issue Creation  
**Next:** Create deployment-strategy.md  
**Last Updated:** February 9, 2026
