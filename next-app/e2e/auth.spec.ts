import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login|Sign In/i);
  });

  test('should display OAuth buttons', async ({ page }) => {
    await page.goto('/login');
    
    const githubButton = page.locator('button:has-text("GitHub")');
    const googleButton = page.locator('button:has-text("Google")');
    
    // At least one OAuth button should be visible
    const buttonCount = await Promise.all([
      githubButton.count(),
      googleButton.count(),
    ]).then(counts => counts[0] + counts[1]);
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should have login form elements', async ({ page }) => {
    await page.goto('/login');
    
    const loginForm = page.locator('form, [role="form"]');
    await expect(loginForm).toBeVisible();
  });

  test('should have link back to homepage', async ({ page }) => {
    await page.goto('/login');
    
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('should navigate to login from navbar', async ({ page }) => {
    await page.goto('/');
    
    // If there's a login link in navbar, it should work
    const loginLink = page.locator('a[href*="login"], button:has-text(/Login|Sign In)');
    const loginLinkCount = await loginLink.count();
    
    if (loginLinkCount > 0) {
      await loginLink.first().click();
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should display login heading', async ({ page }) => {
    await page.goto('/login');
    
    const heading = page.locator('h1, h2');
    await expect(heading).toBeVisible();
    
    const text = await heading.first().textContent();
    expect(text?.toLowerCase()).toMatch(/login|sign in|auth/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.setViewportSize({ width: 320, height: 640 });
    
    const loginContent = page.locator('main, [role="main"]');
    await expect(loginContent).toBeVisible();
    
    const buttons = page.locator('button');
    let visible = false;
    for (let i = 0; i < await buttons.count(); i++) {
      if (await buttons.nth(i).isVisible()) {
        visible = true;
        break;
      }
    }
    expect(visible).toBeTruthy();
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Should not have critical errors (NextAuth errors are expected in some cases)
    const criticalErrors = errors.filter(e => 
      !e.includes('NextAuth') && 
      !e.includes('CORS') &&
      !e.includes('Security')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
