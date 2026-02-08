# QAi Talks - Testing Guide

Comprehensive testing guide covering E2E testing with Playwright, unit testing with Jest, and CI/CD integration.

---

## Testing Pyramid

```
        🔻
      E2E Tests (Few, slower)
      User flows end-to-end
    
      Integration Tests (Some)
      API routes, database, components
    
      Unit Tests (Many, fast)
      Functions, components, utils
```

Ideal distribution:
- **Unit Tests:** 70% of tests (fast, isolated)
- **Integration Tests:** 20% of tests (multiple components)
- **E2E Tests:** 10% of tests (critical user flows)

---

## E2E Testing with Playwright

### Understanding Playwright

Playwright is a browser automation framework for testing web applications.

**Advantages:**
- Multi-browser support (Chromium, Firefox, WebKit)
- True cross-browser testing
- Fast execution
- Great debugging tools
- Excellent for React/Next.js

**Setup Already Configured:**
```bash
# Playwright installed and configured
# See playwright.config.ts for settings
# Tests located in e2e/ directory
```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run with debugging
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Run tests matching pattern
npx playwright test --grep="navigation"

# Run single test
npx playwright test e2e/homepage.spec.ts -g "should navigate to blog"
```

### Writing Tests

#### Basic Test Structure

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('should load homepage and display title', async ({ page }) => {
  // 1. Navigate to page
  await page.goto('http://localhost:3000');

  // 2. Perform actions
  const title = await page.locator('h1').first();

  // 3. Assert expectations
  await expect(title).toHaveText('QAi Talks');
});
```

#### Querying Elements

```typescript
// By text content
await page.getByText('Click me').click();

// By label (forms)
await page.getByLabel('Email').fill('user@example.com');

// By placeholder
await page.getByPlaceholder('Search...').fill('Playwright');

// By role
await page.getByRole('button', { name: 'Submit' }).click();

// CSS selector
await page.locator('button.primary').click();

// XPath (avoid if possible)
await page.locator('xpath=//button[text()="Submit"]').click();

// Combination
await page.locator('nav >> button:has-text("Menu")').click();
```

#### Common Interactions

```typescript
import { test, expect } from '@playwright/test';

test('form interactions', async ({ page }) => {
  await page.goto('http://localhost:3000/blog/new');

  // Fill text input
  await page.getByLabel('Title').fill('My First Post');

  // Select option from dropdown
  await page.getByLabel('Category').selectOption('QA');

  // Check checkbox
  await page.getByLabel('Publish').check();

  // Click button
  await page.getByRole('button', { name: 'Save' }).click();

  // Wait for element
  await expect(page.getByText('Post created')).toBeVisible();
});

test('navigation', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click link
  await page.getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL(/.*blog/);

  // Navigate back
  await page.goBack();
  await expect(page).toHaveURL('http://localhost:3000/');
});

test('keyboard interactions', async ({ page }) => {
  await page.goto('http://localhost:3000/blog');

  // Type  in input
  const searchBox = page.getByPlaceholder('Search posts');
  await searchBox.fill('playwright');

  // Press keys
  await searchBox.press('Enter');
  await expect(page.getByText('playwright')).toBeVisible();

  // Tab to next element
  await page.press('Tab');
});
```

#### Assertions

```typescript
import { test, expect } from '@playwright/test';

test('assertions', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Visibility
  await expect(page.getByText('Blog')).toBeVisible();
  await expect(page.getByText('Hidden Content')).toBeHidden();

  // Disabled/Enabled
  await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeDisabled();

  // Text content
  await expect(page.locator('h1')).toHaveText('Welcome to QAi Talks');
  await expect(page.locator('h1')).toContainText('QAi');

  // Attributes
  await expect(page.getByRole('link', { name: 'Blog' })).toHaveAttribute(
    'href',
    '/blog'
  );

  // Class
  await expect(page.getByRole('button')).toHaveClass('primary');

  // Count
  await expect(page.locator('[data-test="post-card"]')).toHaveCount(10);

  // URL
  await expect(page).toHaveURL(/.*blog/);

  // Title
  await expect(page).toHaveTitle('Blog | QAi Talks');

  // Attribute value
  expect(await page.getAttribute('img', 'alt')).toBe('Main logo');
});
```

#### Wait for Elements

```typescript
import { test, expect } from '@playwright/test';

test('waiting strategies', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for element to be visible
  await page.getByText('Loaded').waitFor({ state: 'visible' });

  // Wait for element to disappear
  await page.getByText('Loading...').waitFor({ state: 'hidden' });

  // Wait for URL
  await page.goto('http://localhost:3000/blog');
  await page.getByRole('link', { name: 'Post 1' }).click();
  await page.waitForURL(/.*blog\/.*/, { waitUntil: 'networkidle' });

  // Wait for network to finish
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for function
  await page.waitForFunction(() => document.querySelectorAll('.post').length > 5);

  // Timeout for custom wait
  await page.getByText('Async Content').waitFor({ timeout: 10000 });
});
```

### Test Best Practices

#### 1. Use Page Object Model (Optional)

```typescript
// e2e/pages/BlogPage.ts
import { Page, expect } from '@playwright/test';

export class BlogPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000/blog');
  }

  async clickPostByTitle(title: string) {
    await this.page.getByRole('link', { name: title }).click();
  }

  async assertPostVisible(title: string) {
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }
}

// e2e/blog.spec.ts
import { test } from '@playwright/test';
import { BlogPage } from './pages/BlogPage';

test('navigate to blog post', async ({ page }) => {
  const blogPage = new BlogPage(page);
  await blogPage.goto();
  await blogPage.clickPostByTitle('Contract Testing');
  await blogPage.assertPostVisible('Contract Testing');
});
```

#### 2. Use Fixtures

```typescript
// e2e/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('http://localhost:3000/dashboard');

    // Use authenticated page in test
    await use(page);

    // Logout after test
  },
});

// e2e/dashboard.spec.ts
import { test } from './fixtures/auth';

test('authenticated users see dashboard', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.getByText('Dashboard')).toBeVisible();
});
```

#### 3. Skip Flaky Tests

```typescript
import { test, expect } from '@playwright/test';

test('flaky network test', async ({ page }) => {
  test.slow(); // Give test more time
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await expect(page.getByText('Loaded')).toBeVisible();
});

test('external API test', async ({ page }) => {
  test.skip(process.env.CI, 'Skip in CI environment');
  
  // Test that relies on external service
});
```

#### 4. Debug Tests

```bash
# Interactive debugging
npm run test:e2e:debug

# Pause on failure
npx playwright test --debug

# Generate trace
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Existing Test Files

Your project includes 6 comprehensive test files:

1. **e2e/homepage.spec.ts** — Homepage load, navigation, footer
2. **e2e/blog.spec.ts** — Blog listing, individual posts, responsiveness
3. **e2e/curriculum.spec.ts** — Module expand/collapse, scrolling
4. **e2e/about.spec.ts** — Content visibility, keyboard navigation
5. **e2e/auth.spec.ts** — Login page, OAuth buttons, form accessibility
6. **e2e/smoke.spec.ts** — Critical user flows, page titles, image integrity

See `e2e/README.md` for detailed information on each test file.

---

## Unit Testing with Jest (Setup Guide)

While E2E tests cover user flows, unit tests should cover business logic.

### Installation

Jest and testing libraries are already installed. Dependencies include:
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1"
  }
}
```

**Available test scripts in `package.json`:**
```bash
npm test                # Run unit tests once
npm run test:watch     # Run unit tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Jest Configuration

Configuration is set up in **`jest.config.ts`** and **`jest.setup.ts`**:

```typescript
// jest.config.ts - Configured with:
// - jsdom test environment for React components
// - Module name mapper for @/ path aliases
// - Test file patterns: **/__tests__/**/*.test.{ts,tsx} and **/*.spec.{ts,tsx}
// - Coverage thresholds: 50% minimum for all metrics
// - Automatic Next.js integration via next/jest
```

**Test files location:**
```
next-app/
├── __tests__/
│   ├── lib/
│   │   └── utils.test.ts
│   └── components/
│       └── SectionHeading.test.tsx
├── jest.config.ts
├── jest.setup.ts
└── package.json (with test scripts)
```

### Example Unit Tests

```typescript
// lib/utils.test.ts
import { formatDate, slugify } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-02-08');
    expect(formatDate(date)).toBe('Feb 8, 2026');
  });

  it('handles invalid dates', () => {
    expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
  });
});

describe('slugify', () => {
  it('converts title to slug', () => {
    expect(slugify('Contract Testing 101')).toBe('contract-testing-101');
  });

  it('removes special characters', () => {
    expect(slugify('Hello & Goodbye!')).toBe('hello-goodbye');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });
});
```

### Component Testing

Jest is configured for testing React components with React Testing Library. Tests are located in `__tests__/components/`.

#### Example: Testing a Section Heading Component

```typescript
// __tests__/components/SectionHeading.test.tsx
import { render, screen } from '@testing-library/react';
import { SectionHeading } from '@/components/sections/SectionHeading';

describe('SectionHeading', () => {
  it('renders the heading text', () => {
    render(<SectionHeading>Our Curriculum</SectionHeading>);
    expect(screen.getByText('Our Curriculum')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <SectionHeading subtitle="Learn modern testing practices">
        Testing Guide
      </SectionHeading>
    );
    expect(screen.getByText('Learn modern testing practices')).toBeInTheDocument();
  });

  it('applies center class by default', () => {
    const { container } = render(<SectionHeading>Test</SectionHeading>);
    expect(container.querySelector('div')).toHaveClass('text-center');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SectionHeading className="custom-class">Test</SectionHeading>
    );
    expect(container.querySelector('div')).toHaveClass('custom-class');
  });
});
```

#### Running Component Tests

```bash
# Run all Jest tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test -- __tests__/components/SectionHeading.test.tsx

# Run tests matching pattern
npm run test -- --testNamePattern="heading"
```

#### Test Structure: utils Testing

For utility functions, tests go in `__tests__/lib/`:

```typescript
// __tests__/lib/utils.test.ts
import { formatDate, slugify, cn } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date as humanized string', () => {
    const date = new Date('2025-12-25');
    expect(formatDate(date)).toBe('Dec 25, 2025');
  });
});

describe('cn - className utility', () => {
  it('merges multiple classNames', () => {
    expect(cn('px-2', 'py-4')).toBe('px-2 py-4');
  });

  it('handles conditional classes', () => {
    expect(cn('base', 'extra' && 'conditional')).toBe('base conditional');
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

Automate testing on every push and pull request with GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Unit Tests with Jest
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm install
      
      - name: Run Jest tests
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  # E2E Tests with Playwright
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm install
      
      - run: npx playwright install --with-deps
      
      - name: Run Playwright E2E tests
        run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Local CI/CD Simulation

Test locally before pushing to ensure CI passes:

```bash
# Run all tests (unit + E2E)
npm run test
npm run test:e2e

# Check TypeScript compilation
npm run type-check

# Run linter
npm run lint

# Check code formatting
npm run format:check
```

### Coverage Reports

Jest unit testing includes coverage reporting configured to a 50% threshold:

```bash
# Generate Jest coverage report
npm run test:coverage

# View coverage report in terminal
cat coverage/lcov-report/index.html

# E2E tests (Playwright) primarily for user flow coverage, not code coverage
npm run test:e2e
```

**Coverage Thresholds (configured in jest.config.ts):**
- Statements: 50%
- Branches: 50%
- Functions: 50%
- Lines: 50%

Aim to improve these percentages as new tests are added.

---

## Troubleshooting

### Tests Timing Out

```typescript
// Increase timeout for slow operations
test('slow operation', async ({ page }) => {
  test.setTimeout(30000); // 30 seconds
  
  await page.goto('http://localhost:3000');
  // ... slow test
});
```

### Flaky Tests

```typescript
// Use appropriate waits
// BAD: Hard-coded wait
await page.waitForTimeout(1000);

// GOOD: Wait for actual condition
await expect(page.getByText('Loaded')).toBeVisible();
```

### Running in CI

```bash
# Ensure test database is ready
npx prisma migrate deploy

# Run tests with appropriate settings
npm run test:e2e -- --workers=1 # Single worker for CI
```

---

## Testing Checklist

Before shipping features:

- [ ] E2E tests pass for critical user flows
- [ ] New API routes have tests
- [ ] Component logic has unit tests
- [ ] Error states tested
- [ ] Accessibility tests pass (keyboard, screen reader)
- [ ] Tests document expected behavior
- [ ] No flaky tests
- [ ] Coverage maintained
- [ ] CI/CD pipeline passes

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Docs](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)

---

**Last Updated:** February 8, 2026
**See Also:** [DEVELOPMENT.md](DEVELOPMENT.md), [ACCESSIBILITY.md](ACCESSIBILITY.md)
