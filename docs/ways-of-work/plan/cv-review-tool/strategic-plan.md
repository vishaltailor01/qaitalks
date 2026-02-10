# CV Review Tool - Strategic Plan & Codebase Analysis

**Strategic Planning Mode - Think First, Code Later**

## Executive Summary

**Feature:** AI-Powered CV Review & Interview Preparation Tool  
**Approach:** Privacy-first, serverless, multi-AI integration  
**Timeline:** 3 weeks (2 weeks dev + 1 week testing/docs)  
**Risk Level:** Medium (AI integration complexity, rate limiting)  
**Dependencies:** External AI APIs (Gemini, HuggingFace)

**Key Decision:** No database storage = simplified deployment, GDPR compliance by design, faster MVP

---

## 1. Codebase Analysis & Context

### Current Architecture Assessment

**technology Stack (Analyzed):**
```
Frontend:  Next.js 16.1.6 + React 19.2.3 + TypeScript 5
Styling:   Tailwind CSS 3.4.19
Database:  Prisma 6.19.2 + SQLite (dev) / D1 (prod candidate)
State:     Zustand 5.0.11
Testing:   Jest 29.7.0 + Playwright 1.58.2
Build:     @opennextjs/cloudflare (Cloudflare Pages adapter)
```

**Existing Page Structure:**
```
app/
├── about/          # Static about page
├── api/            # API routes (none yet - NEW SPACE)
├── blog/           # Blog with [slug] dynamic routes
├── curriculum/     # Curriculum page
├── dashboard/      # User dashboard (public, no auth)
├── layout.tsx      # Root layout with navigation
├── page.tsx        # Homepage
└── providers.tsx   # Client providers

components/
├── layout/         # Header, Footer, Navigation
└── sections/       # Homepage sections
```

**Database Schema (Current):**
- ✅ BlogPost model only
- ❌ No User, Resume, or AI models
- 🎯 **Need:** `AIProviderStatus` model for monitoring

**Dependencies to Add:**
```json
{
  "@google/generative-ai": "^0.21.0",     // Gemini SDK
  "@huggingface/inference": "^2.8.0",     // HuggingFace SDK  
  "html2canvas": "^1.4.1",                // PDF screenshots
  "jspdf": "^2.5.2",                      // PDF generation
  "react-hot-toast": "^2.4.1"             // Toast notifications
}
```

### Integration Points Identified

**1. Dashboard Integration:**
- File: `app/dashboard/page.tsx`
- Change: Add "Try CV Review Tool" card
- Impact: Low - additive only

**2. Navigation Header:**
- File: `components/layout/Header.tsx`
- Change: Add "CV Review" link
- Impact: Low - one nav item

**3. API Routes (New Space):**
- Create: `app/api/cv-review/generate/route.ts`
- Pattern: Follows Next.js 13+ App Router convention
- Impact: Medium - new API surface

**4. Prisma Schema:**
- File: `prisma/schema.prisma`
- Change: Add `AIProviderStatus` model
- Impact: Low - monitoring only, not in critical path

### Existing Patterns to Follow

**✅ Patterns We'll Reuse:**
1. **Blog Dynamic Routes:** `app/blog/[slug]/page.tsx` → `app/cv-review/page.tsx`
2. **Component Structure:** Modular components in `components/`
3. **Zustand State:** Already used, can extend for CV tool state
4. **Tailwind Styling:** Consistent with existing design system
5. **TypeScript Strict:** No type-checking disabled

**🚫 Patterns to Avoid:**
1. **Client-side API Keys:** Original QAi-CV-Tool exposed keys (security issue)
2. **Database for Ephemeral Data:** No need given privacy-first approach
3. **Complex Authentication:** Out of scope per PRD

---

## 2. Requirements Clarification & Constraints

### Explicit Requirements (From PRD)

**Functional:**
- ✅ Accept resume + job description (10k chars max each)
- ✅ Generate 4 outputs: ATS resume, interview questions, technical scenarios, gap analysis
- ✅ Multi-AI fallback (Gemini → HuggingFace)
- ✅ Client-side storage via localStorage (max 5 results)
- ✅ PDF export functionality
- ✅ Rate limiting: 10 requests per IP per 24 hours
- ✅ No authentication required
- ✅ No server-side data persistence

**Non-Functional:**
- ✅ Generation time: < 60 seconds (p95)
- ✅ Uptime: 99% (multi-AI increases to 99.9%)
- ✅ Accessibility: WCAG 2.1 AA
- ✅ Security: API keys server-side only
- ✅ Privacy: Zero PII storage

### Implicit Requirements (Discovered)

**Deployment:**
- Must be compatible with Cloudflare Pages (current staging environment)
- Should work with @opennextjs/cloudflare adapter
- Edge runtime compatible (server-side API routes)

**Existing Infrastructure:**
- GitHub Actions CI/CD already configured
- Prisma migrations workflow established
- Testing infrastructure (Jest + Playwright) in place

**Design Consistency:**
- Must match existing QaiTalk design language
- Reuse Tailwind design tokens
- Follow mobile-first responsive approach

### Technical Constraints Identified

**Constraint 1: Cloudflare Edge Runtime**
- **Impact:** Cannot use Node.js-specific libraries
- **Solution:** Use Web APIs, ensure AI SDKs are edge-compatible
- **Validation Needed:** Test @google/generative-ai on Edge runtime

**Constraint 2: No Persistent Storage for User Data**
- **Impact:** Cannot track user history server-side
- **Solution:** localStorage client-side, in-memory rate limiting
- **Trade-off:** Rate limiting resets on server restart (acceptable for MVP)

**Constraint 3: AI API Rate Limits**
- **Gemini:** 1,500 req/day FREE tier
- **HuggingFace:** 30,000 req/month FREE tier  
- **Impact:** Combined ~32,000 daily capacity (sufficient for MVP)
- **Monitoring:** Need `AIProviderStatus` model to track failures

**Constraint 4: Generation Time Variability**
- **Gemini:** Fast but can timeout (20-40s typical)
- **HuggingFace:** Slower but stable (40-90s typical)
- **Solution:** 60s timeout, clear loading states, fallback messaging

---

## 3. Solution Architecture Strategy

### High-Level Approach

**Architecture Pattern:** **Serverless JAMstack with Privacy-First Design**

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /cv-review Page (Next.js Client Component)         │   │
│  │  - CVUploadForm (input handling)                    │   │
│  │  - CVOutput (tabbed results display)                │   │
│  │  - localStorage (5 recent results - user control)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓ POST /api/cv-review/generate    │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                API ROUTE (Edge Runtime)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  /api/cv-review/generate/route.ts                   │    │
│  │  1. Extract IP → Rate Limit Check (in-memory Map)   │    │
│  │  2. Validate input (sanitize, max length)           │    │
│  │  3. Call AI Service Layer                           │    │
│  │  4. Return JSON response                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AI Service Layer (lib/ai/index.ts)                 │    │
│  │  - Multi-provider orchestration                     │    │
│  │  - Automatic failover on errors                     │    │
│  │  - Structured output parsing                        │    │
│  └─────────────────────────────────────────────────────┘    │
│           ↓ Primary                       ↓ Fallback         │
└───────────────────────────────────────────────────────────────┘
            ↓                                 ↓
    ┌───────────────┐               ┌─────────────────┐
    │  Gemini 2.0   │               │  HuggingFace    │
    │  Flash FREE   │               │  Llama-3.3-70B  │
    │  (Primary)    │               │  (Fallback)     │
    └───────────────┘               └─────────────────┘
```

### Component Hierarchy Planning

**Page Level:**
```tsx
app/cv-review/page.tsx (Client Component)
├── useState for activeTab, loading, outputs
├── CVUploadForm (resume, jobDesc inputs)
├── CVOutput (conditional render on outputs)
│   ├── Tabs: Resume | Interview | Technical | Gap
│   ├── ResumeOutput (markdown + keyword highlighting)
│   ├── InterviewGuideOutput (accordion with roadmap)
│   ├── DomainExpertiseOutput (technical scenarios)
│   └── GapAnalysisOutput (recommendations)
└── HistoryTab (localStorage results list)
```

**API Layer:**
```
app/api/cv-review/generate/route.ts
└── POST handler
    ├── IP extraction (x-forwarded-for header)
    ├── Rate limiting (lib/ai/rate-limiter.ts)
    ├── Input validation (max length, sanitization)
    ├── AI generation (lib/ai/index.ts)
    └── Response formatting
```

**Service Layer:**
```
lib/ai/
├── types.ts (CVGenerationRequest, CVGenerationResponse)
├── providers/
│   ├── gemini.ts (Gemini 2.0 Flash implementation)
│   └── huggingface.ts (Llama-3.3-70B implementation)
├── index.ts (orchestrator with fallback logic)
└── rate-limiter.ts (in-memory IP tracking)
```

### Data Flow Strategy

**1. User Input Flow:**
```
User types → Form validation → Character counter → Submit enabled
→ Loading state → API call → Response → localStorage save → Display
```

**2. AI Generation Flow:**
```
API receives request
→ Rate limit check (pass/fail 429)
→ Input sanitization
→ Try Gemini provider
  → Success: Return structured response
  → Failure: Log error, try HuggingFace
    → Success: Return response
    → Failure: Return 503 error
→ Client receives response
→ Parse sections (QUESTION_START markers)
→ Save to localStorage
→ Render in tabs
```

**3. localStorage Strategy:**
```typescript
// Structure
{
  "qaitalks-cv-results": [
    {
      id: "uuid",
      timestamp: "2026-02-09T12:00:00Z",
      atsResume: "...",
      interviewGuide: "...",
      domainQuestions: "...",
      gapAnalysis: "...",
      provider: "gemini",
      generationTimeMs: 45300
    }
    // ... max 5 entries (FIFO)
  ]
}
```

### Error Handling Architecture

**Error Levels:**
1. **Client Validation:** Show inline errors, prevent submission
2. **Rate Limiting:** Show friendly "Try again tomorrow" modal
3. **AI Timeout:** Show retry button with "Still processing..." message
4. **Provider Failure:** Automatic silent fallback (user sees seamless experience)
5. **All Providers Down:** Show "Service temporarily unavailable" with retry

**Error Response Format:**
```typescript
{
  error: string,        // User-friendly message
  code: string,         // ERROR_RATE_LIMIT, ERROR_AI_TIMEOUT, etc.
  retryable: boolean,   // Can user retry immediately?
  retryAfter?: number   // Seconds until rate limit resets
}
```

---

## 4. Dependency Analysis & Risk Assessment

### External Dependencies

**Critical (Cannot Proceed Without):**
| Dependency | Version | Risk | Mitigation |
|------------|---------|------|------------|
| @google/generative-ai | ^0.21.0 | **Medium** - API availability | HuggingFace fallback |
| @huggingface/inference | ^2.8.0 | **Low** - Stable, widely used | Primary is Gemini |
| Next.js 16 | 16.1.6 | **Low** - Already in use | Tested configuration |

**Optional (Enhance UX):**
| Dependency | Version | Risk | Mitigation |
|------------|---------|------|------------|
| html2canvas | ^1.4.1 | **Low** - PDF export only | Graceful failure |
| jspdf | ^2.5.2 | **Low** - PDF export only | Offer plain text |
| react-hot-toast | ^2.4.1 | **Very Low** - Notifications | Native alerts fallback |

### Integration Risks

**Risk 1: AI Provider Quota Exhaustion**
- **Probability:** Medium (if viral)
- **Impact:** High (service unavailable)
- **Mitigation:**
  - Rate limiting per IP (10/day)
  - Multi-provider fallback doubles capacity
  - Monitor usage via AIProviderStatus model
  - Alert at 80% quota usage

**Risk 2: Edge Runtime Incompatibility**
- **Probability:** Low (SDKs support modern runtimes)
- **Impact:** High (blocking implementation)
- **Validation:** Test Gemini SDK on Cloudflare Workers Day 1
- **Fallback:** Switch to Node.js runtime if necessary (Vercel)

**Risk 3: Generation Time Variability**
- **Probability:** High (AI inference is unpredictable)
- **Impact:** Medium (poor UX if >60s)
- **Mitigation:**
  - Clear loading states with progress messages
  - "Still working..." message at 30s
  - 60s timeout with retry option
  - Optimize prompts for speed (concise instructions)

**Risk 4: Prompt Injection Attacks**
- **Probability:** Medium (users may try malicious inputs)
- **Impact:** Medium (poor quality output, potential abuse)
- **Mitigation:**
  - Input sanitization (strip suspicious patterns)
  - Character limits (10k per field)
  - System prompts with security boundaries (OWASP protocols)
  - Rate limiting prevents sustained attacks

**Risk 5: localStorage Limitations**
- **Probability:** Low (5 results ~500KB typical)
- **Impact:** Low (data won't save, graceful degradation)
- **Mitigation:**
  - Try-catch around localStorage operations
  - Check available space before save
  - Clear old data automatically
  - Show warning if quota exceeded

### Performance Concerns

**Concern 1: Cold Start Latency**
- **Issue:** First API call after deployment may be slow
- **Impact:** 2-5s additional delay
- **Solution:** Cloudflare Workers have minimal cold starts (<50ms)

**Concern 2: PDF Generation on Client**
- **Issue:** html2canvas can block UI on large content
- **Impact:** 2-3s freeze during PDF export
- **Solution:** Show loading spinner, use async rendering

**Concern 3: localStorage Read/Write**
- **Issue:** Large JSON serialization can block main thread
- **Impact:** <100ms typical, but noticeable
- **Solution:** Debounce writes, async read on mount

---

## 5. Implementation Approach & Order

### Phase 1: Foundation (Week 1, Days 1-3)

**Goal:** Set up AI service layer and test connectivity

**Day 1: AI Service Layer**
1. Install dependencies
2. Create `lib/ai/types.ts` (TypeScript interfaces)
3. Create `lib/ai/providers/gemini.ts` (basic connection test)
4. Create `lib/ai/providers/huggingface.ts` (basic connection test)
5. Test on Cloudflare Workers Edge runtime
6. **Validation:** Both providers return mock responses

**Day 2: API Route + Rate Limiting**
1. Create `app/api/cv-review/generate/route.ts`
2. Implement rate limiter (`lib/ai/rate-limiter.ts`)
3. Test IP extraction from headers
4. Test rate limiting logic (11th request blocked)
5. **Validation:** API route returns 429 after 10 requests

**Day 3: AI Orchestration + Fallback**
1. Implement `lib/ai/index.ts` orchestrator
2. Port prompt from QAi-CV-Tool (QUESTION_START markers)
3. Test Gemini generation with real CV
4. Test HuggingFace fallback on Gemini failure
5. Add AIProviderStatus model to Prisma
6. **Validation:** Full CV generation works, fallback triggers correctly

### Phase 2: Frontend (Week 1, Days 4-5 + Week 2, Days 1-2)

**Goal:** Build user interface and localStorage integration

**Day 4: Page Structure + Form**
1. Create `app/cv-review/page.tsx`
2. Create `components/cv-review/CVUploadForm.tsx`
3. Implement character counters (10k max)
4. Implement form validation
5. **Validation:** Form submits to API, shows loading state

**Day 5: Results Display (Part 1)**
1. Create `components/cv-review/CVOutput.tsx` (tabs)
2. Create `components/cv-review/ResumeOutput.tsx`
3. Implement keyword highlighting
4. Test responsive layout
5. **Validation:** Resume displays with proper formatting

**Week 2, Day 1: Results Display (Part 2)**
1. Create `components/cv-review/InterviewGuideOutput.tsx`
2. Parse QUESTION_START/QUESTION_END markers
3. Implement accordion UI with roadmap line
4. **Validation:** All 10 questions display correctly

**Week 2, Day 2: Results Display (Part 3) + Storage**
1. Create `components/cv-review/DomainExpertiseOutput.tsx`
2. Create `components/cv-review/GapAnalysisOutput.tsx`
3. Implement `lib/storage.ts` (localStorage helpers)
4. Add "My Results" history tab
5. **Validation:** Results save/load from localStorage, max 5 enforced

### Phase 3: Polish & Integration (Week 2, Days 3-5)

**Goal:** PDF export, dashboard integration, error handling

**Day 3: PDF Export**
1. Create `lib/pdf-export.ts`
2. Implement html2canvas + jspdf
3. Add PDF-specific CSS classes
4. Test export on different screen sizes
5. **Validation:** PDF downloads with professional formatting

**Day 4: Dashboard Integration + Navigation**
1. Update `app/dashboard/page.tsx` (add CV tool card)
2. Update `components/layout/Header.tsx` (add nav link)
3. Add privacy banner to /cv-review page
4. Implement toast notifications (react-hot-toast)
5. **Validation:** Navigation works, privacy banner shows

**Day 5: Error Handling + Edge Cases**
1. Implement comprehensive error handling
2. Add retry logic for transient failures
3. Test with invalid inputs (special characters, very long text)
4. Test rate limiting UX
5. **Validation:** All error paths show user-friendly messages

### Phase 4: Testing & Documentation (Week 3)

**Goal:** Comprehensive testing and deployment docs

**Week 3, Days 1-3: Testing**
1. Write unit tests for AI service layer (Jest)
2. Write integration tests for API routes
3. Write E2E tests for full flow (Playwright)
4. Test on mobile devices (375px, 768px, 1024px)
5. Accessibility audit (screen reader, keyboard nav)
6. **Validation:** 85%+ test coverage, WCAG 2.1 AA pass

**Week 3, Days 4-5: Documentation + Deployment**
1. Update README with CV tool docs
2. Create deployment guide
3. Test on Cloudflare Pages staging
4. Security review
5. **Validation:** Staging deployment successful, security sign-off

---

## 6. Alternative Approaches Considered

### Alternative 1: Database Storage with Authentication

**Approach:** Store CVs in database, require user accounts

**Pros:**
- ✅ Can offer advanced features (history sync, sharing)
- ✅ Better analytics and user insights
- ✅ Persistent rate limiting across sessions

**Cons:**
- ❌ Requires authentication system (2-4 weeks additional dev)
- ❌ GDPR compliance complexity (data retention, deletion)
- ❌ Database costs for storing large text blobs
- ❌ Slower MVP timeline

**Decision:** ❌ Rejected - Privacy-first is core differentiator, faster MVP

### Alternative 2: Single AI Provider (No Fallback)

**Approach:** Use only Gemini, simplify architecture

**Pros:**
- ✅ Simpler codebase (one provider)
- ✅ Faster development (2-3 days saved)
- ✅ Lower complexity

**Cons:**
- ❌ Single point of failure (uptime risk)
- ❌ Quota exhaustion = service down
- ❌ No redundancy if Gemini changes pricing

**Decision:** ❌ Rejected - Multi-AI fallback critical for 99.9% uptime goal

### Alternative 3: Client-Side AI (WebLLM)

**Approach:** Run LLM entirely in browser using WebLLM

**Pros:**
- ✅ Zero backend costs
- ✅ Perfect privacy (no data leaves device)
- ✅ No rate limiting needed

**Cons:**
- ❌ Requires 4-8GB+ RAM (excludes mobile users)
- ❌ 1-3 minute model download time
- ❌ Slow generation (2-5 minutes on average hardware)
- ❌ Browser compatibility issues

**Decision:** ❌ Rejected - UX unacceptable for mobile-first audience

### Alternative 4: Paid Tier from Day 1

**Approach:** Charge for CV reviews to fund AI costs

**Pros:**
- ✅ Sustainable business model
- ✅ Higher per-user revenue
- ✅ Can offer unlimited generations

**Cons:**
- ❌ Reduces adoption (friction)
- ❌ Requires payment processing (Stripe integration)
- ❌ Legal complexity (refunds, billing)
- ❌ Contradicts "free tool" positioning

**Decision:** ❌ Rejected - Free tier aligns with QaiTalk's educational mission

---

## 7. Testing & Validation Strategy

### Pre-Implementation Validation

**Week 1, Day 1 - Critical Path Tests:**
1. ✅ Test Gemini SDK on Cloudflare Workers Edge runtime
2. ✅ Test HuggingFace SDK on Edge runtime
3. ✅ Verify API key environment variables accessible
4. ✅ Test rate limiting Map persists across requests
5. ✅ Confirm localStorage available in all target browsers

**Decision Gates:**
- If Edge runtime incompatible → Pivot to Vercel (Node.js runtime)
- If both AI SDKs fail → Re-evaluate provider choices
- If rate limiting broken → Use Redis (Cloudflare KV)

### Progressive Integration Testing

**Phase 1 Tests (AI Layer):**
```bash
# Unit tests
npm run test -- lib/ai

# Manual API tests
curl -X POST /api/cv-review/generate \
  -H "Content-Type: application/json" \
  -d '{"resume": "...", "jobDescription": "..."}'

# Provider fallback test (kill Gemini key)
GEMINI_API_KEY=invalid npm run test
```

**Phase 2 Tests (Frontend):**
```bash
# Component tests
npm run test -- components/cv-review

# E2E test
npm run test:e2e -- cv-review.spec.ts

# Accessibility test
npm run test:e2e -- --grep "@a11y"
```

**Phase 3 Tests (Integration):**
```bash
# Full flow test
1. Submit CV → Check all 4 sections generated
2. Save to localStorage → Reload page → Verify persisted
3. Export PDF → Check file downloads
4. Rate limit → 11th request blocked
5. Mobile test → 375px width functional
```

### Performance Benchmarks

**Target Metrics:**
- Page Load Time (LCP): < 2s
- Generation Time (p50): < 30s
- Generation Time (p95): < 60s
- PDF Export: < 3s
- localStorage Write: < 100ms

**Load Testing (Week 3):**
```bash
# Simulate 100 concurrent users
artillery quick --count 100 --num 10 \
  https://staging.qaitalks.pages.dev/api/cv-review/generate
```

---

## 8. Risk Mitigation Summary

| Risk | Mitigation | Owner |
|------|------------|-------|
| AI quota exhaustion | Multi-provider + rate limiting | Backend Dev |
| Edge runtime issues | Day 1 validation test | DevOps |
| Generation timeout | 60s limit + retry UX | Frontend Dev |
| Prompt injection | Input sanitization + OWASP prompts | Security |
| localStorage limits | Try-catch + quota check | Frontend Dev |
| Mobile performance | Responsive design + lazy loading | Frontend Dev |
| Accessibility gaps | WCAG 2.1 AA audit | QA |
| Deployment issues | Staging environment testing | DevOps |

---

## 9. Success Criteria & Definition of Done

### Technical DoD (Must Complete Before Launch)

- [ ] All unit tests pass (85%+ coverage)
- [ ] All E2E tests pass (critical user flows)
- [ ] Accessibility audit complete (WCAG 2.1 AA)
- [ ] Security review sign-off
- [ ] Load testing successful (100 concurrent users)
- [ ] Staging deployment successful
- [ ] Documentation complete (README, API docs)
- [ ] Error handling comprehensive (all error paths)
- [ ] Mobile responsive (375px, 768px, 1024px)
- [ ] Performance benchmarks met (LCP < 2s, generation < 60s)

### Launch Criteria (Week 3, Day 5)

- [ ] 10 internal team members test successfully
- [ ] 5 external beta users provide feedback
- [ ] Zero critical bugs in backlog
- [ ] Monitoring dashboards configured
- [ ] Rollback plan documented
- [ ] Support docs published
- [ ] Blog post announcing feature drafted

### Success Metrics (Post-Launch)

**Week 1:** 50+ CV generations, 99% uptime, <5% error rate  
**Month 1:** 500+ unique users, 20% return rate, 10% blog referral  
**Month 3:** 2,000+ MAU, featured in 2+ career blogs, <$50/mo costs

---

## 10. Next Steps & Action Items

### Immediate Actions (This Week)

1. **Security Review:** Schedule kickoff meeting (Day 1)
2. **Dependency Approval:** Get sign-off on new npm packages (Day 1)
3. **Environment Setup:** Create Gemini + HuggingFace API keys (Day 1)
4. **Edge Runtime Validation:** Run Day 1 critical path tests (Day 1)
5. **Implementation Plan Review:** Review detailed spec with team (Day 2)

### Document Creation Sequence

1. ✅ PRD (This Document) - COMPLETE
2. ✅ Strategic Plan (This Document) - COMPLETE
3. ⏭️ Implementation Plan - Detailed architecture diagrams
4. ⏭️ Security Review - OWASP checklist
5. ⏭️ GitHub Issues - Breakdown into trackable tasks
6. ⏭️ Deployment Strategy - Cloudflare Pages vs alternatives
7. ⏭️ CI/CD Enhancement - GitHub Actions workflow
8. ⏭️ Rollout Plan - Phased launch strategy

### Team Assignments

**Backend Developer:**
- AI service layer (lib/ai/)
- API routes (app/api/cv-review/)
- Rate limiting logic

**Frontend Developer:**
- Page components (app/cv-review/)
- localStorage integration
- PDF export functionality

**DevOps Engineer:**
- Edge runtime validation
- Staging deployment
- Monitoring setup

**QA Engineer:**
- Test plan creation
- E2E test implementation
- Accessibility audit

**Product Manager:**
- User research (beta testers)
- Success metrics definition
- Launch communications

---

## Appendix: Codebase Patterns Reference

### Route Conventions (Observed)
```
app/blog/[slug]/page.tsx     → Dynamic route with getStaticPaths
app/dashboard/page.tsx       → Static page, client components
app/api/*/route.ts           → API routes (NEW - follow pattern)
```

### Component Conventions (Observed)
```typescript
// Client components use 'use client'
'use client'
import { useState } from 'react'

// Server components (default)
export default async function Page() { ... }

// Styling: Tailwind classes, no CSS modules
<div className="flex items-center justify-center">
```

### State Management (Observed)
```typescript
// Zustand for global state
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```

### Testing Conventions (Observed)
```typescript
// Jest for unit/integration tests
describe('Component', () => {
  it('should render', () => { ... })
})

// Playwright for E2E tests
test('should navigate', async ({ page }) => {
  await page.goto('/')
  // ...
})
```

---

**Status:** ✅ Ready for Implementation Plan  
**Next:** Create detailed implementation-plan.md with architecture diagrams  
**Last Updated:** February 9, 2026
