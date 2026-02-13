---
description: 'Foundation instructions for GitHub Copilot on QaiTAlk project'
---

# QaiTAlk Copilot Instructions

QaiTAlk is a full-stack Next.js mentorship platform connecting mentors with job seekers through blog content, curriculum resources, and the CV Review & Interview Preparation Tool.

## Project Overview

- **Framework:** Next.js 15+ with App Router
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL via Prisma
- **Styling:** TailwindCSS
- **Deployment:** Cloudflare Pages + D1
- **Testing:** Jest + React Testing Library + Playwright

## Core Principles

1. **Type Safety** - Strict TypeScript at all times
2. **Accessibility** - WCAG 2.1 AA compliance required
3. **Security** - GDPR compliant, OAuth2 authentication
4. **Performance** - Lighthouse 90+ on all metrics
5. **Testing** - 80%+ code coverage minimum
6. **Documentation** - Clear, maintainable code with comments on complex logic

## Default Workflow (All Requests)

**Every feature request or change follows this workflow automatically:**

### 0. Auto-Route (Intelligent Request Analysis)
The **Smart Router** (`@smart-router`) automatically analyzes your request to determine:
- **Intent**: What type of work? (debug, feature, refactor, etc.)
- **Domain**: Which system? (CV tool, blog, auth, etc.)
- **Complexity**: Simple, moderate, or complex?
- **Best Agent(s)**: Which specialist(s) should handle this?

**How it works:**
- **High Confidence (>90%)**: Automatically routes to appropriate specialist(s) and proceeds
- **Medium Confidence (50-90%)**: Brief confirmation before routing
- **Low Confidence (<50%)**: Asks clarifying questions first

**Override Options:**
- Use explicit agent syntax (`@agent-name`) to skip auto-routing
- Say "just you handle it" to avoid specialist delegation
- Simple questions are answered directly without routing

See `.github/agents/smart-router.agent.md` for full routing logic and patterns.

---

### 1. **Discover** - Search `.agents/skills/` for relevant workflows + match `.github/agents/` personas
### 2. **Research & Plan** - Read skill docs, agent guidance, audit codebase
### 3. **Clarify** - Ask questions to validate assumptions before proceeding
### 4. **Present Plan** - Comprehensive design for approval before implementation
### 5. **Execute** - Handoff to specialized agents or implement using skill guidance

### Agent Selection Logic
The Smart Router uses the Agent Selection Matrix below as its base reference, enhanced with domain-specific keyword matching and confidence scoring.

### Agent Selection Matrix

| Task Type | Primary Agent | Secondary Agents |
|-----------|---------------|------------------|
| New Feature | `@feature-implementation-specialist` | `@security-reviewer`, domain-specific agent |
| API Design | `@api-design-specialist` | `@performance-optimization-specialist` |
| Database/Schema | `@data-modeling-specialist` | `@performance-optimization-specialist` |
| Performance Issue | `@performance-optimization-specialist` | `@api-design-specialist` |
| Security Review | `@security-reviewer` | `@feature-implementation-specialist` |
| CV Tool Feature | `@cv-tool-specialist` | `@security-reviewer`, `@api-design-specialist` |
| AI/LLM Integration | `@ai-integration-specialist` | `@prompt-engineer`, `@security-reviewer` |
| Error Tracking/Monitoring | `@monitoring-specialist` | `@devops-expert`, `@performance-optimization-specialist` |
| Blog/Curriculum Content | `@content-management-specialist` | `@technical-writer`, `@seo-specialist` |
| System Design | `@se-system-architecture-reviewer` | `@principal-engineer` |
| Deployment/CI | `@devops-expert` | `@github-actions-expert` |
| Code Architecture | `@principal-engineer` | `@se-system-architecture-reviewer` |
| Documentation | `@technical-writer` | domain-specific agent |

## Development Workflow

1. Review feature planning docs in `.agents/planning/` or `docs/ways-of-work/plan/`
2. Reference architecture and design decisions  
3. Use appropriate agent mode for the task (see Agent Selection Matrix)
4. Follow prompt patterns in `.agents/prompts/`
5. Use relevant skill in `.agents/skills/` for guidance
6. Write tests alongside code
7. Verify accessibility and performance

## Code Standards

### File Naming
- Components: PascalCase (`BlogCard.tsx`)
- Functions/utilities: camelCase (`formatDate()`)
- Constants: UPPER_SNAKE_CASE (`API_TIMEOUT`)
- Files: kebab-case for pages (`page.tsx`), PascalCase for components

### Component Structure
```typescript
// Props interface
interface ComponentProps {
  title: string;
  onClick: () => void;
}

// Component with memo for list items
export const ComponentName = React.memo(
  ({ title, onClick }: ComponentProps) => {
    return <div onClick={onClick}>{title}</div>;
  }
);

ComponentName.displayName = 'ComponentName';
```

### API Routes
- RESTful design with proper HTTP methods
- Input validation with Zod or similar
- Proper error handling and status codes
- Rate limiting for public endpoints

### Database
- Use Prisma for all database operations
- Keep migrations in `prisma/migrations/`
- Update `seed.ts` for test data
- Use Prisma types in TypeScript

## Important Do's & Don'ts

### ✅ Do:
- Use `next/image` and `next/link` from Next.js
- Write tests for all new features
- Keep components under 300 lines
- Use React hooks (hooks over class components)
- Deploy frequently in small changes
- Document complex logic with comments
- Use environment variables for config
- Run TypeScript in strict mode
- Follow async/await patterns

### ❌ Don't:
- Use plain `<img>` tags (use `next/image`)
- Use inline styles (use TailwindCSS)
- Create large monolithic components
- Skip accessibility attributes
- Hard-code environment values
- Deploy without testing
- Ignore TypeScript errors
- Leave console.log in production code
- Create synchronous blocking operations

## Available Agent Modes

Activate agents with `@agent-name` syntax in Copilot Chat:

### System Agents

### @smart-router
- **Auto-invoked**: Analyzes ALL requests automatically (unless explicit agent specified)
- Routes requests to appropriate specialist(s) based on intent, domain, and complexity
- Coordinates multi-agent workflows when needed
- Use explicitly when: You want to see routing analysis for a complex request
- See `.github/agents/smart-router.agent.md` for full routing patterns

### Feature & Implementation Agents

### @feature-implementation-specialist
- Designs and plans features comprehensively
- Covers design, data modeling, APIs, UX, security, compliance
- Use for: New feature planning, feature design review, change proposals

### @api-design-specialist
- Designs RESTful APIs and contracts
- Covers endpoints, request/response schemas, status codes, documentation
- Use for: API design review, endpoint planning, contract definition

### @data-modeling-specialist
- Designs database schemas and migrations
- Covers Prisma schema, relationships, indexing, GDPR compliance
- Use for: Schema design, migration planning, query optimization

### @performance-optimization-specialist
- Optimizes for speed and efficiency
- Covers Lighthouse, Core Web Vitals, caching, monitoring
- Use for: Performance issues, optimization strategy, monitoring setup

### Domain-Specific Agents

### @cv-tool-specialist
- Expert in CV Review Tool feature
- Use for: CV feedback system, mentor interactions, file uploads

### @ai-integration-specialist
- Expert in AI/LLM integration (Gemini API, RAG, embeddings)
- Covers prompt engineering, streaming responses, model selection, token optimization
- Use for: Gemini API integration, prompt design, RAG architecture, AI feature development

### @monitoring-specialist
- Expert in error tracking, observability, and performance monitoring
- Covers Sentry setup, error boundaries, Core Web Vitals, structured logging, alerting
- Use for: Error tracking setup, observability strategy, monitoring dashboards, health checks

### @content-management-specialist
- Expert in blog and curriculum content management
- Covers blog authoring, MDX integration, Prisma seed data, SEO optimization
- Use for: Blog post creation, curriculum design, content workflows, SEO strategy

### Architecture & Operations Agents

### @principal-engineer
- Senior engineering perspective on code and architecture
- Use for: Design reviews, refactoring, SOLID principles

### @se-system-architecture-reviewer
- System design and architecture review
- Use for: System design, scalability, integration patterns

### @security-reviewer
- Focuses on vulnerabilities, compliance, data protection
- Use for: Security audits, auth flows, file upload security, GDPR review

### @devops-expert
- Handles deployment, CI/CD, infrastructure
- Use for: GitHub Actions workflows, Cloudflare setup, monitoring

### @github-actions-expert
- CI/CD pipelines and GitHub Actions automation
- Use for: Workflow setup, GitHub Actions debugging

### @repo-architect
- Scaffolds and validates project structures
- Use for: New feature structure, project reorganization

### @technical-writer
- Expertise in documentation and guides
- Use for: API docs, user guides, architecture diagrams

### @prompt-engineer
- Helps craft better prompts and instructions
- Use for: Improving prompt quality, testing AI interactions

## Project Structure Reference

```
QaiTAlk/
├── .github/
│   ├── copilot-instructions.md (this file)
│   └── agents/                  (agent personas)
├── .agents/
│   ├── skills/                 (reusable workflows)
│   ├── prompts/                (prompt patterns)
│   └── planning/               (feature planning index)
├── docs/                       (project documentation)
├── next-app/
│   ├── app/                   (Next.js App Router)
│   ├── components/
│   ├── lib/
│   ├── prisma/                (database)
│   ├── __tests__/             (unit tests)
│   └── e2e/                   (E2E tests)
└── llms.txt                    (AI discovery guide)
```

## Feature Planning

All features use the `.agents/skills/feature-planning-workflow/` to generate:
- PRD (Product Requirements)
- Architecture design
- Security assessment
- Implementation plan
- Testing strategy
- Deployment plan

Reference: `.agents/planning/README.md`

## Testing Strategy

### Test Pyramid
- **Unit Tests** (80%) - Jest + React Testing Library
- **Integration Tests** (15%) - API + component integration
- **E2E Tests** (5%) - Critical user journeys with Playwright

### Coverage Goals
- Minimum 80% line coverage
- 100% coverage for critical paths
- All error cases tested
- Accessibility tested with axe

### Running Tests
```bash
npm run test                # Unit tests
npm run test:coverage       # Coverage report
npm run e2e                 # E2E tests
npm run e2e:ui              # E2E with UI
```

## Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Lighthouse score 90+
- [ ] Accessibility audit passing
- [ ] Security scan complete
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Performance optimized
- [ ] Documentation updated

## Key Files & References

- **Prompt Patterns:** `.agents/prompts/README.md`
- **Skills Library:** `.agents/skills/README.md`
- **CV Tool Planning:** `docs/ways-of-work/plan/cv-review-tool/`
- **Development Guide:** `docs/DEVELOPMENT.md`
- **Database Schema:** `next-app/prisma/schema.prisma`
- **Project Structure:** `docs/PROJECT_STRUCTURE.md`

## Common Tasks

### Add a Blog Post
Use `@devops-expert` or skill `blog-writing`
- Modify `next-app/prisma/seed.ts`
- Include title, date, excerpt, HTML content

### Create a Page
Use `@principal-engineer` or skill `page-creation`
- Create folder in `next-app/app/[route]/`
- Use existing components from `components/`

### Update Database
Use `@devops-expert` or skill `database-changes`
- Edit `next-app/prisma/schema.prisma`
- Run `prisma migrate dev --name [description]`

### Build a Component
Use `@principal-engineer` or skill `component-patterns`
- Location: `next-app/components/sections/`
- Include tests in `__tests__/components/`

## External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Awesome Copilot](https://github.com/github/awesome-copilot)
- [llmstxt Spec](https://llmstxt.org/)

---

*Last updated: February 10, 2026*
*Agents system: 4 new specialists added (feature-implementation, api-design, performance-optimization, data-modeling)*
