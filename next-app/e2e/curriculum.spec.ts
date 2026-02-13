import { test, expect } from '@playwright/test';

test.describe('Curriculum Page', () => {
  test('should load curriculum page', async ({ page }) => {
    await page.goto('/curriculum');
    await expect(page).toHaveTitle(/QAi Talks - Master QA Automation & SDET Architecture/i);
  });

  test('should display curriculum modules', async ({ page }) => {
    await page.goto('/curriculum');
    // Look for module headings (h2) as curriculum modules
    const modules = page.locator('h2');
    const moduleCount = await modules.count();
    expect(moduleCount).toBeGreaterThanOrEqual(1);
  });

  test('should expand/collapse modules', async ({ page }) => {
    await page.goto('/curriculum');
    // Find first module expander by .cursor-pointer
    const moduleExpander = page.locator('.cursor-pointer').first();
    await expect(moduleExpander).toBeVisible();
    // Click to expand
    await moduleExpander.click();
    // Wait for animation
    await page.waitForTimeout(500);
    // Check for expanded content (look for a topic section)
    const topicSection = page.locator('h3', { hasText: '1. Fundamentals of Testing' });
    await expect(topicSection).toBeVisible();
  });

  test('should display module topics', async ({ page }) => {
    await page.goto('/curriculum');
    // Expand the first module
    const moduleExpander = page.locator('.cursor-pointer').first();
    await moduleExpander.click();
    await page.waitForTimeout(500);
    // Find the first topic section by heading, then get its list items
    const topicSection = page.getByRole('heading', { name: '1. Fundamentals of Testing', level: 3 });
    const topicList = topicSection.locator('..').locator('ul li');
    const topicCount = await topicList.count();
    expect(topicCount).toBeGreaterThanOrEqual(1);
  });

  test('should have navigation back to home', async ({ page }) => {
    await page.goto('/curriculum');
    
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/curriculum');
    await page.setViewportSize({ width: 320, height: 640 });
    
    const curriculum = page.locator('main');
    await expect(curriculum).toBeVisible();
    
    // Check that modules are still accessible
      const moduleExpander = page.locator('.cursor-pointer').first();
    // Removed invalid reference to moduleButton
      await expect(moduleExpander).toBeVisible();
  });

  test('should have scroll-friendly layout', async ({ page }) => {
    await page.goto('/curriculum');
    
    // Scroll down and check content loads
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
