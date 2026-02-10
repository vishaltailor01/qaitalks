# CV Review Tool - Product Requirements Document

## 1. Feature Name

**AI-Powered CV Review & Interview Preparation Tool**

## 2. Epic

Parent Epic: QaiTalk Platform Enhancement - AI Tools Integration
- Architecture: See [architecture.md](./architecture.md)
- Implementation: See [implementation-plan.md](./implementation-plan.md)

## 3. Goal

### Problem
Job seekers struggle to optimize their resumes for ATS (Applicant Tracking Systems) and prepare effectively for interviews. They lack:
- Visibility into how well their resume matches job descriptions
- Professional interview preparation guidance
- Access to domain-specific technical questions
- Understanding of their skill gaps compared to job requirements

**Current Pain Points:**
- Manual resume optimization is time-consuming and error-prone
- Interview preparation lacks structure and relevance
- No way to identify technical skill gaps before applying
- Limited access to AI-powered career tools (most require paid subscriptions)

### Solution
A privacy-first, free AI-powered CV review tool that generates:
1. **ATS-Optimized Resume**: Keyword-matched resume tailored to job description
2. **Interview Guide**: 10 STAR+ behavioral questions with recruiter perspectives
3. **Domain Expertise Questions**: 5-7 technical scenarios based on role requirements
4. **Gap Analysis**: Strategic recommendations for skill development

**Key Differentiator:** Zero data collection - all processing happens server-side with no storage, results stay in user's browser via localStorage.

### Impact

**Expected Outcomes:**
- **User Engagement**: 500+ CV reviews in first month
- **Traffic Growth**: 30% increase in organic search traffic (job search keywords)
- **Conversion**: 15% of CV tool users explore blog content
- **Retention**: 40% of users return for multiple CV reviews
- **Brand Authority**: Position QaiTalk as AI-powered career platform

**Metrics to Track:**
- CV generation requests per day
- Success rate (generations completed vs attempted)
- Average time per generation
- localStorage usage patterns
- Referral traffic from career platforms
- Blog content engagement from CV tool users

## 4. User Personas

### Primary: Career Transitioner (Software Engineer)
- **Demographics**: 25-40 years old, 2-8 years experience
- **Technical Skill**: Comfortable with technology, uses GitHub/LinkedIn
- **Pain Points**: 
  - Applying to 50+ jobs with low response rate
  - Unsure if resume matches job requirements
  - Lacks interview preparation structure
- **Goals**: Stand out in ATS systems, ace technical interviews
- **Behavior**: Applies to multiple jobs weekly, researches companies deeply
- **Success Criteria**: Get 2-3x more interview callbacks

### Secondary: Recent Graduate
- **Demographics**: 22-25 years old, 0-2 years experience
- **Technical Skill**: Digital native, uses AI tools regularly
- **Pain Points**:
  - First professional resume lacks impact
  - No real interview experience
  - Unsure which technical skills to highlight
- **Goals**: Land first tech job, build confidence
- **Behavior**: Mass applies to entry-level positions
- **Success Criteria**: Secure internship or junior role within 3 months

### Tertiary: Career Advisor/Recruiter
- **Demographics**: 30-50 years old, HR/recruiting professional
- **Technical Skill**: Moderate, uses ATS systems daily
- **Pain Points**:
  - Advising clients on resume optimization
  - Limited time to review all candidate resumes personally
- **Goals**: Help more clients efficiently, validate resume quality
- **Behavior**: Reviews 20-30 resumes per week
- **Success Criteria**: Recommend tool to 10+ clients/month

## 5. User Stories

### Core Functionality

**US-1: Resume Upload & Analysis**
- As a **job seeker**, I want to **paste my resume and target job description** so that I can **get an ATS-optimized version instantly**
- **Acceptance Criteria:**
  - Textarea accepts 10,000 characters max per field
  - Clear character counter visible
  - Submit button disabled until both fields have content
  - Loading state shows AI processing status
  - Generation completes within 60 seconds

**US-2: ATS-Optimized Resume Generation**
- As a **career transitioner**, I want to **see keyword-matched resume with highlighting** so that I can **understand which terms boost ATS scores**
- **Acceptance Criteria:**
  - Keywords from job description highlighted in resume
  - Markdown formatting preserved (headings, bullets)
  - Contact info and key sections clearly structured
  - Copy-to-clipboard button for easy export
  - Printable format maintains visual hierarchy

**US-3: Interview Preparation Guide**
- As a **recent graduate**, I want to **receive STAR+ format interview questions** so that I can **practice structured responses**
- **Acceptance Criteria:**
  - 10 behavioral questions generated
  - Each question includes: Question, Target Competency, Recruiter Perspective, Evidence, Situation/Action/Result structure
  - Accordion UI for easy navigation
  - Visual roadmap line showing progress
  - Questions specific to role and company context

**US-4: Technical Domain Questions**
- As a **software engineer**, I want to **practice domain-specific technical scenarios** so that I can **prepare for technical interviews**
- **Acceptance Criteria:**
  - 5-7 technical questions generated
  - Each includes: Concept, Implementation, Trade-offs
  - Questions match job description tech stack
  - Difficulty level appropriate to experience level
  - Code examples where applicable

**US-5: Gap Analysis & Recommendations**
- As a **job seeker**, I want to **identify skill gaps in my profile** so that I can **strategically improve before applying**
- **Acceptance Criteria:**
  - Clear list of missing skills from job requirements
  - Prioritized by importance (must-have vs nice-to-have)
  - Actionable recommendations (courses, projects, certifications)
  - Timeline estimates for skill acquisition
  - Language optimization suggestions

### Privacy & Data Control

**US-6: Client-Side Data Storage**
- As a **privacy-conscious user**, I want to **store my CV reviews locally** so that I can **access them without creating an account**
- **Acceptance Criteria:**
  - Results saved to browser localStorage automatically
  - Max 5 recent reviews stored
  - "My Results" tab shows history with timestamps
  - Individual delete and "Clear All" options
  - Privacy banner: "Your data stays in your browser"

**US-7: PDF Export**
- As a **job applicant**, I want to **export optimized resume as PDF** so that I can **submit it to employers**
- **Acceptance Criteria:**
  - One-click PDF download
  - Professional formatting preserved
  - File named with timestamp
  - Includes all sections (resume, questions, analysis)
  - Print-optimized layout

### AI & Performance

**US-8: Multi-AI Fallback**
- As the **system**, I want to **automatically switch AI providers on failure** so that I can **maintain 99% uptime**
- **Acceptance Criteria:**
  - Gemini 2.0 Flash as primary provider
  - HuggingFace Llama-3.3-70B as fallback
  - Automatic failover within 5 seconds
  - User sees generic "processing" message (no provider details)
  - Admin dashboard shows provider health

**US-9: Rate Limiting**
- As the **platform**, I want to **limit requests per IP** so that I can **prevent abuse of free tier**
- **Acceptance Criteria:**
  - 10 CV reviews per IP per 24 hours
  - Friendly error message on limit: "Daily limit reached. Try again tomorrow!"
  - No user tracking or IP storage beyond in-memory cache
  - Rate limit resets at midnight UTC

## 6. Requirements

### Functional Requirements

**Core AI Generation:**
- FR-1: Accept resume and job description inputs (text, max 10k chars each)
- FR-2: Generate ATS-optimized resume with keyword matching
- FR-3: Create 10 STAR+ behavioral interview questions
- FR-4: Generate 5-7 technical domain scenarios
- FR-5: Produce gap analysis with recommendations
- FR-6: Process request within 60 seconds (95th percentile)
- FR-7: Support multi-AI fallback (Gemini → HuggingFace)
- FR-8: Parse structured output using markers (QUESTION_START, DOMAIN_START, etc.)

**User Interface:**
- FR-9: Two-column input form (resume | job description)
- FR-10: Tabbed output display (Resume | Interview | Technical | Gap Analysis)
- FR-11: Client-side localStorage for 5 recent results
- FR-12: PDF export functionality
- FR-13: Keyword highlighting in resume output
- FR-14: Accordion UI for questions with visual roadmap
- FR-15: Responsive mobile design

**Privacy & Security:**
- FR-16: No user authentication required (public access)
- FR-17: No database storage of user data
- FR-18: IP-based rate limiting (10 req/IP/day)
- FR-19: Server-side API key protection
- FR-20: Privacy banner on page load

**Integration:**
- FR-21: Link from /dashboard to /cv-review
- FR-22: "Try CV Review Tool" card in dashboard
- FR-23: Share buttons (Twitter/X, LinkedIn) for results
- FR-24: Blog content recommendations based on identified gaps

### Non-Functional Requirements

**Performance:**
- NFR-1: Page load time < 2 seconds (LCP)
- NFR-2: CV generation < 60 seconds (p95)
- NFR-3: PDF export < 3 seconds
- NFR-4: localStorage operations < 100ms
- NFR-5: Support 100 concurrent users

**Reliability:**
- NFR-6: 99% uptime (excluding planned maintenance)
- NFR-7: Multi-AI fallback increases availability to 99.9%
- NFR-8: Graceful degradation on AI provider failures
- NFR-9: Automatic retry on transient errors (3 attempts)

**Security:**
- NFR-10: API keys stored in environment variables only
- NFR-11: Input sanitization for XSS prevention
- NFR-12: Rate limiting enforced at API route level
- NFR-13: No PII logging to server logs
- NFR-14: HTTPS only in production

**Accessibility:**
- NFR-15: WCAG 2.1 AA compliance
- NFR-16: Screen reader compatible
- NFR-17: Keyboard navigation support
- NFR-18: Color contrast ratio > 4.5:1
- NFR-19: Form labels and ARIA attributes

**Data Privacy:**
- NFR-20: Zero server-side user data persistence
- NFR-21: No cookies or session tracking
- NFR-22: No analytics tracking of CV content
- NFR-23: localStorage data user-controlled
- NFR-24: GDPR compliant (no data processing)

**Scalability:**
- NFR-25: Stateless API design (horizontal scaling ready)
- NFR-26: In-memory rate limiting (upgradeable to Redis)
- NFR-27: Edge runtime compatible (Cloudflare Workers)
- NFR-28: Support 1,000 daily active users initially

## 7. Acceptance Criteria

### AC-1: User Can Generate Complete CV Package
**Given** a user with resume and job description  
**When** they submit the form  
**Then** they receive all 4 outputs within 60 seconds:
- [ ] ATS-optimized resume with keyword highlighting
- [ ] 10 STAR+ interview questions with 7 fields each
- [ ] 5-7 technical domain scenarios
- [ ] Gap analysis with recommendations

### AC-2: Results Stored Locally Without Account
**Given** a user generates CV review  
**When** generation completes  
**Then**:
- [ ] Result automatically saved to localStorage
- [ ] User can view in "My Results" tab
- [ ] Max 5 results stored (oldest auto-deleted)
- [ ] User can delete individual results
- [ ] User can "Clear All Data"

### AC-3: Multi-AI Fallback Works Seamlessly
**Given** primary AI provider (Gemini) fails  
**When** API route detects failure  
**Then**:
- [ ] Automatic switch to HuggingFace within 5 seconds
- [ ] User sees same quality output
- [ ] No error message shown to user
- [ ] Admin sees provider failure logged

### AC-4: Rate Limiting Prevents Abuse
**Given** a user from single IP address  
**When** they attempt 11th request in 24 hours  
**Then**:
- [ ] Request blocked with 429 status
- [ ] Friendly error: "Daily limit reached. Try again tomorrow!"
- [ ] No permanent storage of IP address
- [ ] Counter resets after 24 hours

### AC-5: Privacy Guaranteed
**Given** any user interaction  
**When** CV review is generated  
**Then**:
- [ ] Zero data saved to database
- [ ] API keys not exposed to client
- [ ] No user tracking cookies set
- [ ] Privacy banner shown on first visit
- [ ] Results only in user's browser

### AC-6: PDF Export Professional Quality
**Given** a user has generated CV review  
**When** they click "Export PDF"  
**Then**:
- [ ] PDF downloads within 3 seconds
- [ ] All sections included (resume, questions, analysis)
- [ ] Professional formatting maintained
- [ ] Filename: cv-review-[timestamp].pdf
- [ ] Print-optimized layout (A4 size)

### AC-7: Mobile Responsive
**Given** a user on mobile device (375px width)  
**When** they access /cv-review  
**Then**:
- [ ] Form inputs stack vertically
- [ ] Text readable without zoom
- [ ] Buttons easy to tap (min 44x44px)
- [ ] Output tabs swipeable
- [ ] PDF export works on mobile

### AC-8: Accessibility Standards Met
**Given** a screen reader user  
**When** they navigate the tool  
**Then**:
- [ ] All form inputs have labels
- [ ] Tab navigation works logically
- [ ] ARIA landmarks present
- [ ] Status messages announced
- [ ] Color not sole information indicator

### AC-9: Integration with Existing Platform
**Given** existing QaiTalk user  
**When** they visit dashboard  
**Then**:
- [ ] "Try CV Review Tool" card visible
- [ ] Link to /cv-review works
- [ ] Consistent design with blog/curriculum pages
- [ ] Navigation header includes CV Review
- [ ] Blog posts suggest CV tool where relevant

### AC-10: Error Handling Graceful
**Given** any error condition (AI timeout, network failure, invalid input)  
**When** error occurs  
**Then**:
- [ ] User-friendly error message shown
- [ ] Technical details not exposed
- [ ] Option to retry clearly visible
- [ ] Loading state cleared
- [ ] No browser console errors

## 8. Out of Scope

**Explicitly NOT Included in This Release:**

**Authentication & User Accounts:**
- ❌ User registration/login system
- ❌ User profiles or dashboards
- ❌ Email notifications
- ❌ Password reset flows
- ❌ OAuth social login

**Data Persistence:**
- ❌ Database storage of user CVs or results
- ❌ Server-side history/analytics per user
- ❌ Backup/restore functionality
- ❌ Cloud sync across devices
- ❌ Sharing results via URL

**Advanced AI Features:**
- ❌ Resume rewriting/editing mode
- ❌ AI chatbot for follow-up questions
- ❌ Cover letter generation
- ❌ LinkedIn profile optimization
- ❌ AI-powered mock interviews

**Payment & Monetization:**
- ❌ Premium tier with additional features
- ❌ Payment processing
- ❌ Subscription management
- ❌ Usage beyond free tier limits
- ❌ Enterprise/team accounts

**Integration Features:**
- ❌ Direct upload from LinkedIn/Indeed
- ❌ Integration with job boards
- ❌ Calendar integration for interview prep
- ❌ Email results to user
- ❌ Slack/Discord notifications

**Advanced Analytics:**
- ❌ A/B testing framework
- ❌ User behavior tracking
- ❌ Conversion funnel analytics
- ❌ Heatmaps/session recording
- ❌ Personalization engine

**Future Enhancements (Post-MVP):**
- ⏭️ Resume version comparison
- ⏭️ Industry-specific templates
- ⏭️ Video interview prep mode
- ⏭️ Skill assessment tests
- ⏭️ Job matching recommendations
- ⏭️ Chrome extension for quick access

## Technical Context

**Technology Stack:**
- Frontend: Next.js 16, React 19, TypeScript 5, Tailwind CSS
- AI: Google Gemini 2.0 Flash (primary), HuggingFace Llama-3.3-70B (fallback)
- Storage: localStorage (client), no database
- Hosting: Cloudflare Pages (staging), TBD production
- PDF: html2canvas + jspdf

**Dependencies to Add:**
```json
{
  "@google/generative-ai": "^0.21.0",
  "@huggingface/inference": "^2.8.0",
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.2",
  "react-hot-toast": "^2.4.1"
}
```

**API Rate Limits:**
- Gemini 2.0 Flash FREE: 1,500 req/day
- HuggingFace FREE: 30,000 req/month
- Combined capacity: ~31,500 CV generations/day

**Environment Variables Required:**
```bash
GEMINI_API_KEY=          # From aistudio.google.com
HF_API_KEY=              # From huggingface.co/settings/tokens
AI_PRIMARY_PROVIDER=gemini
AI_FALLBACK_PROVIDER=huggingface
AI_TIMEOUT_MS=60000
RATE_LIMIT_PER_IP=10
```

## Success Metrics

**Phase 1 (MVP Launch - Week 1-2):**
- 100+ CV generations
- < 5% error rate
- 99% uptime
- < 60s avg generation time

**Phase 2 (Growth - Month 1):**
- 500+ unique users
- 20% return rate
- 10% blog traffic referral
- 4.0+ satisfaction rating (if survey added)

**Phase 3 (Scale - Month 3):**
- 2,000+ monthly active users
- Featured in career blog roundups
- 15% conversion to curriculum/blog
- Cost under $50/month (free tier AI only)

## Related Documentation

- Technical Implementation: [implementation-plan.md](./implementation-plan.md)
- Security Review: [security-review.md](./security-review.md)
- Deployment Strategy: [deployment-strategy.md](./deployment-strategy.md)
- GitHub Issues: See issues tagged with `cv-review-tool`, `phase-1-mvp`

## Approval & Sign-off

**Product Owner:** [To be assigned]  
**Technical Lead:** [To be assigned]  
**Security Review:** [Required before implementation]  
**UX Review:** [Required for design consistency]  

**Status:** ✅ Ready for Implementation Planning  
**Last Updated:** February 9, 2026  
**Version:** 1.0
