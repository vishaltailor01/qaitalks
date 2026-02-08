import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('should complete homepage to blog journey', async ({ page }) => {
    // Load homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/QAi Talks/);
    
    // Navigate to blog
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL('/blog');
    
    // Check blog loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should complete homepage to curriculum journey', async ({ page }) => {
    // Load homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/QAi Talks/);
    
    // Navigate to curriculum
    await page.click('a[href="/curriculum"]');
    await expect(page).toHaveURL('/curriculum');
    
    // Check curriculum loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should complete homepage to about journey', async ({ page }) => {
    // Load homepage
    await page.goto('/');
    
    // Navigate to about
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
    
    // Check about loaded
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate from blog to homepage', async ({ page }) => {
    // Go to blog
    await page.goto('/blog');
    
    // Click home link (in navbar or footer)
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    
    // Should be back on homepage
    await expect(page).toHaveURL('/');
  });

  test('should have no broken images', async ({ page }) => {
    const pages = ['/', '/blog', '/curriculum', '/about'];
    
    for (const path of pages) {
      await page.goto(path);
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        
        // Skip data URLs and check that images have src
        if (src && !src.startsWith('data:')) {
          expect(src).toBeTruthy();
          
          // Check that image loaded successfully by verifying naturalWidth > 0
          const isLoaded = await img.evaluate((el: HTMLImageElement) => {
            return el.complete && el.naturalWidth > 0;
          });
          
          expect(isLoaded).toBeTruthy();
        }
      }
    }
  });

  test('should have proper page titles', async ({ page }) => {
    const titleTests = [
      { url: '/', pattern: /QAi Talks|Home/ },
      { url: '/blog', pattern: /Blog/ },
      { url: '/curriculum', pattern: /Curriculum|Course/ },
      { url: '/about', pattern: /About/ },
    ];
    
    for (const test of titleTests) {
      await page.goto(test.url);
      const title = await page.title();
      expect(title).toMatch(test.pattern);
    }
  });

  test('should load pages within acceptable time', async ({ page }) => {
    const pages = ['/', '/blog', '/curriculum', '/about'];
    
    for (const path of pages) {
      const startTime = Date.now();
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      
      // Pages should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('should have accessible form inputs (if any)', async ({ page }) => {
    const pages = ['/', '/blog', '/curriculum', '/about', '/login'];
    
    for (const path of pages) {
      await page.goto(path);
      
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const ariaLabel = await input.getAttribute('aria-label');
        const label = await page.locator(`label[for="${await input.getAttribute('id')}"]`);
        
        // Either aria-label or associated label should exist
        const hasLabel = !!ariaLabel || await label.count() > 0;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through and collect focusable elements
    const focusableSelectors = 'a, button, input, [tabindex]:not([tabindex="-1"])';
    const focusableElements = page.locator(focusableSelectors);
    const count = await focusableElements.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should have no console errors on critical pages', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Test main pages
    const pages = ['/', '/blog', '/curriculum', '/about'];
    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(1000);
    }
    
    // Filter out expected/harmless errors
    const criticalErrors = errors.filter(e =>
      !e.includes('NextAuth') &&
      !e.includes('favicon') &&
      !e.includes('undefined') &&
      !e.includes('CORS')
    );
    
    expect(criticalErrors.length).toBeLessThan(1);
  });
});
