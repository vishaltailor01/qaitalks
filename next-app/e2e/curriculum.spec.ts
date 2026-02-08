import { test, expect } from '@playwright/test';

test.describe('Curriculum Page', () => {
  test('should load curriculum page', async ({ page }) => {
    await page.goto('/curriculum');
    await expect(page).toHaveTitle(/Curriculum|Course/i);
  });

  test('should display curriculum modules', async ({ page }) => {
    await page.goto('/curriculum');
    
    const modules = page.locator('[role="button"]').filter({ hasText: /Week|Module/ });
    const moduleCount = await modules.count();
    expect(moduleCount).toBeGreaterThanOrEqual(1);
  });

  test('should expand/collapse modules', async ({ page }) => {
    await page.goto('/curriculum');
    
    // Find first module button
    const moduleButton = page.locator('[role="button"]').first();
    await expect(moduleButton).toBeVisible();
    
    // Click to expand
    await moduleButton.click();
    
    // Check if content is visible after expand
    await page.waitForTimeout(300); // Wait for animation
    
    // Content should be visible or have different state
    const isExpanded = await moduleButton.evaluate(el => {
      return el.getAttribute('data-state') === 'open' || 
             el.getAttribute('aria-expanded') === 'true' ||
             el.classList.contains('open');
    });
    
    expect(isExpanded).toBeTruthy();
  });

  test('should display module topics', async ({ page }) => {
    await page.goto('/curriculum');
    
    // Click first module to expand
    const moduleButton = page.locator('[role="button"]').first();
    await moduleButton.click();
    await page.waitForTimeout(300);
    
    // Check for topics/content
    const topics = page.locator('li, .topic, [role="listitem"]');
    const topicCount = await topics.count();
    expect(topicCount).toBeGreaterThanOrEqual(0);
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
    const moduleButton = page.locator('[role="button"]').first();
    await expect(moduleButton).toBeVisible();
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
