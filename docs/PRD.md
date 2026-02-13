---
title: QaiTalk Product Requirements Document (PRD)
version: 1.0
date_created: 2026-02-10
last_updated: 2026-02-10
owner: Product & Engineering Team
tags: ["product-strategy", "requirements", "curriculum", "platform"]
---

# QaiTalk - Product Requirements Document

## Executive Summary

**QaiTalk** is a comprehensive QA Automation Bootcamp and mentorship platform designed to transform manual testers into elite automation architects. The platform provides structured technical curriculum, in-depth blog content, and a CV Review & Interview Preparation Tool to accelerate user career development.

**Mission:** Bridge the gap between script-writing test engineers and true systems architects through blueprints, mentorship, and hands-on learning.

**Target Users:** 
- Manual QA testers seeking automation skills
- Career changers entering QA automation field
- Senior QA engineers looking to transition to SDET/architecture roles

---

## 1. Product Overview

### 1.1 Vision Statement

At QaiTalk, we believe that true QA excellence comes not from copying test scripts, but from understanding systems, frameworks, and architectural patterns. We empower testing professionals to think like architects.

### 1.2 Core Value Proposition

- **Structured Learning Path**: 12-week hands-on curriculum from manual testing fundamentals to DevOps integration
- **Expert Content**: Technical blog with proven patterns, anti-patterns, and real-world strategies
- **Career Acceleration Tool**: AI-powered CV review and interview preparation specifically for QA/SDET roles
- **Community & Mentorship**: Connect with experienced practitioners and navigate career growth

### 1.3 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| **Course Completion Rate** | 75% | 6 months |
| **Career Outcome (promotion/new role)** | 60% of graduates | 12 months |
| **Blog Monthly Unique Visitors** | 5,000+ | 3 months |
| **Platform Retention Rate** | 40% returning monthly | 6 months |
| **User Satisfaction (NPS)** | 50+ | Ongoing |

---

## 2. Product Features & Requirements

### 2.1 Homepage (Landing Page)

**Purpose:** Attract, educate, and convert visitors into enrolled students

**Key Sections:**
- Hero section with value proposition ("QA Automation Bootcamp: From Manual to DevOps")
- Statistics showcase (12 weeks, +75% salary growth, 500+ engineers trained, etc.)
- Curriculum overview (6 core modules with icons)
- Call-to-action buttons (Enroll, Learn More, Browse Blog)
- Latest blog post highlights
- Navigation to secondary pages

**Technical Requirements:**
- ✅ Fully responsive (mobile-first design)
- ✅ Fast load time (<2.5s LCP)
- ✅ SEO optimized with meta tags
- ✅ Animated hero section with decorative elements
- ✅ Accessible keyboard navigation (WCAG 2.1 AA)

**[Status: COMPLETE]**

---

### 2.2 About Page

**Purpose:** Build credibility and explain the QaiTalk mission

**Key Sections:**
- Mission statement ("Building the Architects of Tomorrow")
- The gap in QA industry analysis
- Core topics covered
- Why QaiTalk exists
- Team values and approach
- Call to curriculum/contact

**Content Requirements:**
- Clear explanation of Page Object Model vs. Screenplay Pattern
- Business case for investing in QA education
- Statistics on industry demand for SDET/automation architects
- Compelling brand narrative

**[Status: COMPLETE]**

---

### 2.3 Curriculum Module (12-Week Program)

**Purpose:** Provide structured learning path with clear progression

**Curriculum Structure:**

| Module | Duration | Topics | Focus |
|--------|----------|--------|-------|
| **01: Manual Testing Fundamentals** | 2 weeks | ISTQB principles, test case design, testing mindset | Foundation |
| **02: Selenium Fundamentals** | 2 weeks | WebDriver, locators, wait strategies, browser automation | Automation Basics |
| **03: Java Essentials** | 2 weeks | OOP concepts, design patterns, framework design | Programming |
| **04: Page Object Model & Beyond** | 2 weeks | Traditional POM, Screenplay pattern, component testing | Architecture |
| **05: CI/CD Pipelines & Scaling** | 2 weeks | Jenkins, Docker, pipeline automation, parallel execution | DevOps Integration |
| **06: DevOps & System Design** | 2 weeks | Cloud deployment, monitoring, observability, scaling | Systems Thinking |

**Technical Requirements:**
- Expandable/collapsible module cards
- Clear learning objectives for each module
- Estimated time commitment per module
- Prerequisites clearly stated
- Version tracking for course updates
- Interactive curriculum guide
- Resource links (GitHub, documentation, tools)

**[Status: COMPLETE]**

---

### 2.4 Blog System

**Purpose:** Establish thought leadership and drive organic traffic

**Blog Post Structure:**
- Professional SVG featured images
- Meta information (author, date, category, reading time)
- Table of contents (auto-extracted from headings)
- Long-form content (2,000-4,000 words)
- Code examples with syntax highlighting
- Internal cross-linking to related posts
- Social sharing buttons (Twitter/X, LinkedIn)
- Category badges/tags

**Current Blog Topics:**
1. Why Page Object Model is Dead (Screenplay Pattern intro)
2. Contract Testing with Pact (Consumer-driven testing)
3. [11+ additional technical articles]

**Content Strategy:**
- **Frequency**: 2-4 posts per month
- **Topics**: QA automation, testing patterns, DevOps, career development
- **Quality**: Written for both practitioners and decision-makers
- **SEO**: Optimized for long-tail keywords in QA automation space

**Database Model:**
```prisma
model BlogPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String
  content     String   // HTML content
  authorName  String?
  image       String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**[Status: COMPLETE]**

---

### 2.5 Dashboard Page

**Purpose:** Central hub for user activity and next steps

**Dashboard Sections:**
- User's course progress (completion percentage)
- Recent blog posts read
- Recommended curriculum modules
- Quick access to CV Review Tool
- Navigation to resources and community

**Future Enhancements:**
- User authentication & profile
- Personalized learning recommendations
- Progress tracking and certificates
- Discussion forum access

**[Status: IN PROGRESS - Basic version exists]**

---

### 2.6 CV Review & Interview Preparation Tool ⭐

**Purpose:** Provide AI-powered career support tool to accelerate job market readiness

**[FEATURE IN PLANNING]**

**Overview:**
- Users upload resume and target job description
- AI analyzes fit and generates personalized feedback
- Multi-section output for complete preparation


**Outputs Generated:**
1. **ATS-Optimized Resume**: Keyword-matched suggestions for Applicant Tracking System visibility, with opinionated formatting (one-page or two-page, ATS-friendly, no fluff, concise and professional)
2. **Interview Preparation Guide**: STAR+ method questions based on user's background
3. **Technical Domain Questions**: 5-7 scenario-based questions for technical interviews
4. **Gap Analysis**: Skills gaps and actionable recommendations

**Key Features:**
- No authentication required (privacy-first)
- Browser-only storage (no server-side PII retention)
- Multi-AI fallback (Gemini → HuggingFace)
- Rate limiting (10 reviews per IP per 24 hours)
- PDF export functionality
- localStorage history (max 5 results)

**Technical Stack:**
- Frontend: Next.js client components with React hooks
- API: POST /api/cv-review/generate (serverless)
- AI Providers: Google Gemini 2.0 Flash + HuggingFace Llama fallback
- Rate Limiting: In-memory IP tracking (upgradeable to Cloudflare KV)
- Storage: Client-side localStorage only

**Architecture:**
```
Client Form → API Route → AI Service Layer
              ↓
         Rate Limiter
              ↓
         Input Sanitizer
              ↓
    Try Gemini → Fallback to HuggingFace
              ↓
         Output Validator
              ↓
      Response → Client
```

**Security Considerations:**
- Input sanitization (remove prompt injection patterns)
- Output sanitization (XSS prevention)
- Rate limiting prevents abuse
- No sensitive data storage
- Server-side API keys only
- Clear privacy disclaimer

**Performance Requirements:**
- Generation time: <60 seconds (p95)
- API response: <300ms (excluding AI processing)
- Page load (LCP): <2.5s
- Accessibility: WCAG 2.1 AA compliant

**Phase Timeline:**
- **Week 1**: Foundation (AI service layer, rate limiting, API route)
- **Week 2**: Frontend (form, results display, localStorage)
- **Week 3**: Polish (PDF export, error handling, testing, documentation)

**[Status: PLANNED - Development starting Q2 2026]**

---

### 2.7 QA Application Pack (Paid, One-Off)

**Purpose:** Enable users to purchase a one-off, job-specific “QA Application Pack” for £4.99–£7.99, delivering a full rewritten CV, tailored cover letter, and interview/interview prep for a specific CV+JD pair.

**User Flow:**
- User runs Free QA CV Quick Check
- Upsell panel: “Go deeper for this job: full rewritten QA CV, tailored cover letter, and interview questions → £4.99”
- Stripe Checkout (one-off payment)
- On success: Generate and display full pack (rewritten CV, before/after bullets, tailored cover letter, interview pack)
- Allow copy/download/save to dashboard

**Pack Contents:**
1. Complete rewritten CV (JD-aligned, new summary, skills, experience, projects, education/certs)
2. 1–2 before/after bullet rewrites (showing improvement)
3. Tailored cover letter (company/role-specific, JD keyword-rich, clear structure, option to regenerate with different tone)
4. Mock interview pack (4–6 STAR behavioral, 4–8 technical/scenario questions, all JD-specific)
5. Download & save (CV and cover letter as text, DOCX/PDF export)

**Constraints:**
- 1 Application Pack = 1 CV + 1 JD
- Users can buy multiple packs for multiple applications

**Technical Requirements:**
- Stripe one-off payment integration
- New API endpoints: purchase pack, generate pack, download pack
- Dashboard integration for purchased packs
- Secure storage and privacy for pack content

**[Status: PLANNED – Implementation starting Q1 2026]**

---

## 3. User Journeys

### 3.1 New User Onboarding

```
Discover QaiTalk
   ↓
Visit Homepage (Hero CTA)
   ↓
Explore Curriculum Overview
   ↓
Read About Page (Build Trust)
   ↓
Browse Blog (Validate Expertise)
   ↓
Try CV Review Tool (Immediate Value)
   ↓
Enrollment Decision
   ↓
Access Dashboard & Resources
```

### 3.2 Career Acceleration Journey

```
Study Curriculum (12 weeks)
   ↓
Read Supplementary Blog Posts
   ↓
Build Portfolio Projects
   ↓
Use CV Review Tool → Optimize Resume
   ↓
Prepare for Interviews → Practice with Generated Questions
   ↓
Network in Community
   ↓
Land New Role / Promotion
```

### 3.3 Blog Reader Journey

```
Search "QA automation patterns"
   ↓
Land on Blog Articles
   ↓
Read article with code examples
   ↓
Follow internal links to related topics
   ↓
Share on social media
   ↓
Subscribe for updates
   ↓
Explore curriculum (conversion)
```

---

## 4. Technical Specifications

### 4.1 Technology Stack

**Frontend:**
- Framework: Next.js 16.1.6 with App Router
- UI Library: React 19.2.3
- Language: TypeScript 5 (strict mode)
- Styling: Tailwind CSS 3.4.19
- State Management: Zustand 5.0.11
- DOM Sanitization: isomorphic-dompurify 3.0.0-rc.2

**Backend:**
- Runtime: Node.js 18+ / Cloudflare Workers (Edge)
- Framework: Next.js API Routes
- Database: SQLite (development), PostgreSQL (production)
- ORM: Prisma 6.19.2
- D1 Adapter: @prisma/adapter-d1 (Cloudflare)

**Testing:**
- E2E: Playwright 1.58.2
- Unit: Jest 29.7.0
- Testing Library: React Testing Library 16.0.0
- Assertion: Expect (Jest built-in)

**Deployment:**
- Platform: Cloudflare Pages
- Edge Runtime: Cloudflare Workers
- Database: Cloudflare D1
- Build Tool: OpenNext (@opennextjs/cloudflare)

**Development:**
- Package Manager: npm
- Linting: ESLint 9
- Git: GitHub
- CI/CD: GitHub Actions

### 4.2 Database Schema

**Current Models:**
```prisma
// Blog Post
- id (String, @id, @default(cuid()))
- slug (String, @unique)
- title (String)
- description (String)
- content (String, HTML)
- authorName (String, optional)
- image (String, optional)
- published (Boolean, default: false)
- publishedAt (DateTime, optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

**Future Models (Planned):**
- User (authentication, profile, preferences)
- UserProgress (course completion tracking)
- AIProviderStatus (monitor API health)
- CVReviewRequest (optional: logging and analytics)

### 4.3 API Routes

```
GET  /api/blog             → List all blog posts
GET  /api/blog/:slug       → Get specific blog post
POST /api/cv-review/generate → Generate CV review (PLANNED)
```

### 4.4 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Lighthouse Performance** | 90+ | ~95 | ✅ |
| **Largest Contentful Paint (LCP)** | <2.5s | ~1.8s | ✅ |
| **First Input Delay (FID)** | <100ms | ~50ms | ✅ |
| **Cumulative Layout Shift (CLS)** | <0.1 | ~0.05 | ✅ |
| **First Contentful Paint (FCP)** | <1.8s | ~1.2s | ✅ |
| **Time to Interactive (TTI)** | <3.8s | ~2.5s | ✅ |

### 4.5 Security & Compliance

**Requirements:**
- ✅ HTTPS enforcement (Cloudflare automatic)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escaping + output sanitization)
- ✅ CSRF protection (SameSite cookies)
- ✅ GDPR compliance (no unnecessary data collection)
- ✅ WCAG 2.1 AA accessibility

**Privacy:**

### 4.6 Application Pack Database & API

**Database Model:**
```prisma
model ApplicationPack {
   id                String   @id @default(cuid())
   userId            String?  // Null for guest
   cvText            String   @db.Text
   jobDescription    String   @db.Text
   packContent       Json     // All generated content (CV, cover letter, Qs)
   stripePaymentId   String   // Stripe one-off payment
   status            String   // pending | generating | ready | failed
   createdAt         DateTime @default(now())
   updatedAt         DateTime @updatedAt
}
```

**API Endpoints:**
- `POST /api/application-pack/purchase` (initiate Stripe checkout)
- `POST /api/application-pack/generate` (trigger pack generation after payment)
- `GET /api/application-pack/:id` (fetch pack content)
- `GET /api/user/application-packs` (list user’s packs)

---

## 5. Accessibility & Internationalization

### 5.1 Accessibility (WCAG 2.1 AA)

**Implemented:**
- ✅ Semantic HTML (`<main>`, `<section>`, `<article>`, headings)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support (Tab, Enter, Escape)
- ✅ Screen reader tested
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Focus indicators visible
- ✅ Alternative text for images
- ✅ Form labels properly associated

**Testing:**
- Axe DevTools accessibility audit
- Manual keyboard navigation
- VoiceOver (macOS) testing
- NVDA (Windows) testing

### 5.2 Internationalization (i18n)

**Current Status:** English only

**Future Plan:**
- Support for Spanish, French, German
- RTL language support (Arabic, Hebrew)
- Localized currency and date formats
- Translated blog content (community contribution model)

---

## 6. Content Strategy

### 6.1 Blog Content Roadmap

**Q1 2026 (Completed):**
- Page Object Model vs. Screenplay Pattern
- Contract Testing with Pact
- [11+ additional articles covering various QA topics]

**Q2 2026 (Planned):**
- Advanced Selenium Patterns
- SDET Interview Preparation
- DevOps for QA Engineers
- API Testing Strategies
- Performance Testing Guide

**Q3 2026 (Planned):**
- Microservices Testing Patterns
- Mobile Automation Best Practices
- Visual Regression Testing
- Security Testing for QA
- Test Data Management

**Q4 2026 (Planned):**
- Career Transitions in QA
- Leadership for QA Managers
- Building Test Frameworks from Scratch
- Open Source QA Tools Guide
- 2027 QA Industry Trends

### 6.2 Blog SEO Strategy

**Target Keywords:**
- "QA automation bootcamp"
- "SDET interview preparation"
- "Page Object Model alternatives"
- "contract testing pact"
- "DevOps for QA engineers"
- "automated testing patterns"
- "Selenium best practices"

**SEO Implementation:**
- Meta tags (title, description, keywords)
- Open Graph tags (social sharing)
- Schema markup (Article, FAQ, Organization)
- Internal linking strategy
- Keyword optimization in headings
- Featured snippet optimization
- Mobile-first indexing

---

## 7. Roadmap & Phases

### Phase 1: Foundation (Weeks 1-4) ✅ COMPLETE

**Status:** All features implemented and tested

### Phase 2: Career Tools (Weeks 5-7) ⏳ IN PROGRESS

**Timeline:** Start Q2 2026

### Phase 3: User Engagement (Weeks 8-12) 📋 PLANNED
- Email newsletter

- Live workshops
- Marketplace for QA tools/resources
- Affiliate program

- ✅ All E2E tests pass
- ✅ Mobile responsive on all breakpoints
- ✅ SEO meta tags optimized
- ✅ Accessibility audit passes (axe)
- ✅ Blog content comprehensive (11+ articles)

### Phase 2 Success (CV Review Tool)
- All acceptance criteria met
- <60s p95 generation time
- 99% AI provider uptime (multi-fallback)
- Zero security vulnerabilities
- GDPR compliance validated
- E2E tests for critical paths
- 85%+ code coverage

### Application Pack Success (Paid Feature)
- Stripe payment flow works (one-off, per pack)
- Pack is generated and delivered after payment
- User can download/copy/save all content
- Dashboard shows purchased packs
- 95%+ pack generation success rate
- <5% refund/complaint rate
- Conversion rate from free check to paid pack >5%

### Long-Term Success (2026)
- **Monthly Active Users (MAU):** 10,000+
- **Course Completion Rate:** 75%+
- **User Job Placement:** 60%+
- **Blog Monthly Visits:** 50,000+
- **Community Size:** 5,000+ active members
- **Net Promoter Score (NPS):** 50+

---

## 9. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **AI provider downtime** | Service unavailable | Medium | Multi-provider fallback, monitoring, graceful degradation |
| **High churn rate** | Revenue loss | Medium | Strong onboarding, community, mentorship program |
| **Poor SEO performance** | Low organic traffic | Low | Consistent blog strategy, internal linking, schema markup |
| **User data breach** | Reputation damage | Low | Encryption, no PII storage, GDPR compliance, security audits |
| **Competitors with VC funding** | Pricing pressure | Medium | Focus on unique quality, mentor relationships, unique content |
| **Scope creep** | Timeline overruns | High | Strict prioritization, clear phase gates, product discipline |

---

## 10. Questions for Stakeholders

1. **Monetization**: When ready, what pricing model? (Subscription, per-course, freemium?)
2. **Content**: Who creates course videos/content? (Internal team, external creators, both?)
3. **Community**: In-house forum or leverage existing platform? (Slack, Discord, Discourse?)
4. **Certification**: Industry-recognized certifications or custom badges?
5. **Mentorship**: 1:1 mentors or group mentorship model initially?
6. **Timeline**: Hard deadline for Phase 2 CV Review Tool launch?
7. **Internationalization**: Target non-English markets in 2026?
8. **Mobile App**: Native mobile app or web-first strategy?

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **SDET** | Software Development Engineer in Test - combines software engineering and QA |
| **POM** | Page Object Model - design pattern for UI test automation (traditional approach) |
| **Screenplay** | Modern design pattern for test automation focusing on user journeys |
| **ATS** | Applicant Tracking System - software that scans resumes for job matching |
| **E2E** | End-to-End testing - tests complete user workflows |
| **CI/CD** | Continuous Integration/Continuous Deployment - automation of build and release |
| **DevOps** | Development and Operations - culture of automating infrastructure and deployments |
| **LCP** | Largest Contentful Paint - web performance metric |
| **GDPR** | General Data Protection Regulation - EU privacy law |
| **WCAG** | Web Content Accessibility Guidelines - accessibility standards |

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-10 | Product Team | Initial PRD creation, Phase 1-4 outline |

---

## 13. Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | TBD | - | - |
| Engineering Lead | TBD | - | - |
| Design Lead | TBD | - | - |
| Stakeholder | TBD | - | - |

---

**Document Status:** 🟢 Active  
**Last Updated:** February 10, 2026  
**Next Review:** Q2 2026

For questions or feedback, contact the product team at [product@qaitalks.com](mailto:product@qaitalks.com)
