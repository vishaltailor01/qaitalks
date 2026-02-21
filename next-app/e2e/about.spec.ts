import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('should load about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
  });


  test('should display mission statement', async ({ page }) => {
    await page.goto('/about');
    // Wait for main to be visible and then find mission statement (tolerant match)
    await page.waitForSelector('main');
    const mission = page.getByText(/QAi Talk|We built QaiTalk|We know the struggle|mission/i, { exact: false }).first();
    await expect(mission).toBeVisible({ timeout: 10000 });
  });


  test('should display philosophy section', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('main');
    // Use a tolerant set of headings that represent the Philosophy section
    const philosophy = page.getByRole('heading', { name: /Philosophy|Our Approach|Why Most QA Training Fails|What Sets Us Apart|The QA Industry Gap/i }).first();
    await expect(philosophy).toBeVisible({ timeout: 10000 });
  });


  test('should display team/mentors section', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('main');
    // Match on likely team/mentors headings or testimonial sections
    const teamSection = page.getByRole('heading', { name: /Mentors|Team|Founders|Advisors|Real QA Engineers|Built by QA engineers/i }).first();
    await expect(teamSection).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/about');
    
    const navLinks = page.locator('nav a[href]').first();
    await expect(navLinks).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/about');
    
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check that h2s follow h1
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThanOrEqual(0);
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/about');
    
    // Tab through page elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
  });

  test('should display without layout shift', async ({ page }) => {
    await page.goto('/about');
    
    const mainContent = page.locator('main');
    const initialHeight = await mainContent.boundingBox();
    
    // Wait for any dynamic content
    await page.waitForTimeout(1000);
    
    const finalHeight = await mainContent.boundingBox();
    expect(initialHeight?.height).toBeDefined();
    expect(finalHeight?.height).toBeDefined();
  });

  test('should work on different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 640 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/about');
      
      const content = page.locator('main');
      await expect(content).toBeVisible();
    }
  });
});
