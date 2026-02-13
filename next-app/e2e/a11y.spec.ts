import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (a11y) checks', () => {
  const routes = ['/', '/about', '/blog', '/curriculum', '/cv-review'];
  for (const route of routes) {
    test(`a11y: ${route}`, async ({ page }) => {
      await page.goto(route);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations, `Accessibility violations on ${route}`).toEqual([]);
    });
  }
});
