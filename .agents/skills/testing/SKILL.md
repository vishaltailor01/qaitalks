# Testing Skill

## Overview
E2E testing with Playwright and unit testing with Jest for comprehensive quality assurance.

## When to Use
- Writing tests for new features or components
- Fixing failing tests or flaky test issues
- Setting up test fixtures or authentication
- Testing user flows end-to-end
- Verifying API endpoints

## Key Files
- **Guide:** `TESTING.md` (in this directory)
- **E2E Tests:** `e2e/` directory
- **Unit Tests:** `__tests__/` directory
- **Config:** `playwright.config.ts`, `jest.config.ts`

## Quick Commands
```bash
npm run test                 # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run E2E tests (headless)
npm run test:e2e:ui        # Interactive Playwright UI (recommended)
npm run test:e2e:debug     # Debug single test
npm run test:coverage      # Generate coverage report
```

## Key Patterns
- E2E tests: Critical user flows (auth, blog, navigation)
- Unit tests: Components, utilities, API responses
- Use Page Object Model for E2E test organization
- Test fixtures for authentication setup
- Assertions: Check text, visibility, enabled state
- Avoid testing implementation details

## Output
When generating test code:
1. Use Playwright for E2E (browser automation)
2. Use Jest + React Testing Library for unit tests
3. Test user behavior, not implementation details
4. Include descriptive test names
5. Add proper waits/retries for flaky tests
6. Keep tests isolated and repeatable
