import { test, expect } from '@playwright/test';

test.describe('Curriculum Page', () => {
  test('should load curriculum page', async ({ page }) => {
    await page.goto('/curriculum');
    await expect(page).toHaveTitle(/QAi Talks - Master QA Automation & SDET Architecture/i);
  });

  test('should display curriculum modules', async ({ page }) => {
    await page.goto('/curriculum');
    // Look for module headings (h2) as curriculum modules and wait for main
    await page.waitForSelector('main');
    const modules = page.locator('h2');
    await expect(modules.first()).toBeVisible();
  });

  test('should expand/collapse modules', async ({ page }) => {
    await page.goto('/curriculum');
    // Find first module expander by a clickable element and ensure visible
    const moduleExpander = page.getByRole('button', { name: /View Details|View details for/i }).first();
    await expect(moduleExpander).toBeVisible({ timeout: 10000 });
    // Click to expand; tolerate animations and use force if needed
    await moduleExpander.scrollIntoViewIfNeeded();
    await moduleExpander.click({ timeout: 10000 }).catch(() => moduleExpander.click({ force: true }));
    // Wait for expanded content to appear
    // Wait for modal/dialog to appear then check topic headings inside it
    await page.waitForSelector('[role="dialog"][aria-label="Module details"]', { timeout: 10000 });
    const topicSection = page.getByRole('heading', { name: /Fundamentals of Testing|Fundamentals/i }).first();
    await expect(topicSection).toBeVisible({ timeout: 10000 });
  });

  test('should display module topics', async ({ page }) => {
    await page.goto('/curriculum');
    // Expand the first module robustly
    const moduleExpander = page.getByRole('button', { name: /View Details|View details for/i }).first();
    await moduleExpander.scrollIntoViewIfNeeded();
    await moduleExpander.click({ timeout: 10000 }).catch(() => moduleExpander.click({ force: true }));
    await page.waitForSelector('[role="dialog"][aria-label="Module details"] ul li', { timeout: 10000 });
    // Find topic list inside the modal/dialog
    const topicList = page.locator('[role="dialog"][aria-label="Module details"] ul li');
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
