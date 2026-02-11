# E2E Testing with Playwright

This directory contains end-to-end tests for the QAi Talks Next.js application using Playwright.

## Quick Start

```bash
# Install Playwright (already done via npm install)
npm install -D @playwright/test

# Run all tests
npm run test:e2e

# Run tests with UI (interactive)
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Test Files

| File | Coverage |
|------|----------|
| **homepage.spec.ts** | Homepage load, navigation links, responsive design, footer |
| **blog.spec.ts** | Blog listing page, blog detail pages, responsiveness, metadata |
| **curriculum.spec.ts** | Curriculum page, module expand/collapse, responsiveness |
| **about.spec.ts** | About page content, navigation, heading hierarchy, keyboard nav |
| **cv-review.spec.ts** | CV Review Tool form, validation, results, PDF export, history, accessibility (19 tests) |
| **auth.spec.ts** | Login page, OAuth buttons, accessibility, form elements |
| **smoke.spec.ts** | Critical user flows, page titles, load times, no broken images |

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('/path');
    
    // Interact
    await page.click('button');
    
    // Assert
    await expect(page).toHaveURL('/new-path');
  });
});
```

### Common Patterns

**Navigate and check title:**
```typescript
await page.goto('/about');
await expect(page).toHaveTitle(/About/);
```

**Click and navigate:**
```typescript
await page.click('a[href="/blog"]');
await expect(page).toHaveURL('/blog');
```

**Check visibility:**
```typescript
const element = page.locator('h1');
await expect(element).toBeVisible();
```

**Responsive testing:**
```typescript
await page.setViewportSize({ width: 320, height: 640 }); // Mobile
await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
```

**Form filling:**
```typescript
await page.fill('input[type="email"]', 'test@example.com');
await page.click('button[type="submit"]');
```

**Wait for navigation:**
```typescript
await page.click('a');
await page.waitForURL('/expected-url');
```

## Running Specific Tests

```bash
# Run specific file
npx playwright test e2e/homepage.spec.ts

# Run tests matching pattern
npx playwright test --grep "navigation"

# Run single test
npx playwright test -g "should load homepage"

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with trace (debug)
npx playwright test --trace on
```

## Debugging

### Interactive UI Mode (Recommended)
```bash
npm run test:e2e:ui
# Opens browser where you can:
# - See test code on left
# - Click through steps
# - Set breakpoints
# - Inspect elements
```

### Debug Mode
```bash
npm run test:e2e:debug
# Pauses at each step
# Inspector shows DOM, network, console
```

### View Reports
```bash
npm run test:e2e:report
# Opens HTML report with:
# - Test results
# - Screenshots on failure
# - Video recordings (if enabled)
```

## Best Practices

1. **Keep tests independent** — Each test should not depend on another
2. **Use data-testid** — Add `data-testid` attributes to elements for reliable selection
3. **Avoid hard waits** — Use `waitForURL()`, `waitForSelector()` instead of `waitForTimeout()`
4. **Test user flows** — Focus on what users do (click, type, navigate)
5. **Check visibility** — Use `toBeVisible()` to verify elements exist and are shown
6. **Test at multiple sizes** — Mobile (320px), Tablet (768px), Desktop (1440px)
7. **Don't test implementation** — Test behavior, not internal React state

## Continuous Integration

Configure GitHub Actions to run tests on every push:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Configuration

Edit `playwright.config.ts` to customize:

- **testDir** — Where test files live
- **baseURL** — Base URL for tests
- **webServer** — Auto-start dev server before tests
- **projects** — Browser types to test (Chromium, Firefox, WebKit)
- **reporter** — How to report results (html, json, junit, etc.)

## Troubleshooting

### Tests fail with "page.goto: net::ERR_CONNECTION_REFUSED"
- Dev server not running
- Fix: Make sure `npm run dev` would start the server successfully

### "Timeout waiting for element"
- Element not found in DOM
- Fix: Check selector is correct, element actually exists on page

### "Permission denied" errors
- Playwright trying to access restricted resources
- Fix: Check CORS config, authentication flows

### Tests pass locally but fail in CI
- Timing issues in CI environment
- Fix: Use proper wait methods instead of `waitForTimeout()`

## Resources

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/locators)
- [Debugging](https://playwright.dev/docs/debug)
