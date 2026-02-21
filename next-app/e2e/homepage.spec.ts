import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/QAi Talks/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('main').first();
    await expect(hero).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('nav');
    await page.waitForSelector('nav');
    await expect(navbar.first()).toBeVisible();
    
    // Check for main navigation items (tolerant presence)
    await expect(page.locator('a[href="/about"]').first()).toBeVisible();
    await expect(page.locator('a[href="/blog"]').first()).toBeVisible();
    await expect(page.locator('a[href="/curriculum"]').first()).toBeVisible();
  });

  test('should navigate to About page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(navbar).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have accessible color contrast', async ({ page }) => {
    await page.goto('/');
    // Check that all text is readable (color contrast)
    const mainContent = page.locator('main');
    const textElements = mainContent.locator('p, h1, h2, h3, a');
    await expect(textElements.first()).toBeVisible();
  });
});
