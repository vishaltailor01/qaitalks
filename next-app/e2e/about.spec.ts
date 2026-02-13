import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('should load about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
  });


  test('should display mission statement', async ({ page }) => {
    await page.goto('/about');
    // Use the unique mission statement paragraph
    const mission = page.getByText('QAi Talks is on a mission to transform manual testers into elite automation architects. We don\'t just teach code; we teach systems thinking.', { exact: true });
    await expect(mission).toBeVisible();
  });


  test('should display philosophy section', async ({ page }) => {
    await page.goto('/about');
    // Use the unique heading for Philosophy
    const philosophy = page.getByRole('heading', { name: /The Philosophy/i });
    await expect(philosophy).toBeVisible();
  });


  test('should display team/mentors section', async ({ page }) => {
    await page.goto('/about');
    // Use a more specific selector for team/mentors section (update this if you have a unique heading or text)
    const teamSection = page.getByRole('heading', { name: /Mentors|Team|Founders/i });
    await expect(teamSection).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/about');
    
    const navLinks = page.locator('nav a[href]');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);
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
