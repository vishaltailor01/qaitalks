import { test, expect } from '@playwright/test';

test.describe('Blog Pages', () => {
  test('should load blog listing page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog/);
  });

  test('should display blog posts grid', async ({ page }) => {
    await page.goto('/blog');
    const blogGrid = page.locator('main');
    await expect(blogGrid).toBeVisible();
    
    // Check for blog post cards
    const postCards = page.locator('a').filter({ has: page.locator('img') });
    const cardCount = await postCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('should navigate to blog post detail', async ({ page }) => {
    await page.goto('/blog');
    
    // Click first blog link
    const firstBlogLink = page.locator('a[href*="/blog/"]').first();
    const href = await firstBlogLink.getAttribute('href');
    
    await firstBlogLink.click();
    await expect(page).toHaveURL(href!);
  });

  test('should display blog post content', async ({ page }) => {
    await page.goto('/blog/contract-testing');
    
    // Check for post title and content
    const title = page.locator('h1').first();
    const article = page.locator('article');
    
    await expect(title).toBeVisible();
    await expect(article).toBeVisible();
  });

  test('should have back navigation on blog post', async ({ page }) => {
    await page.goto('/blog/contract-testing');
    // Use a unique selector for the back navigation link
    const backLink = page.getByRole('link', { name: /Back to Blog/i });
    await expect(backLink).toBeVisible();
  });

  test('should display blog metadata', async ({ page }) => {
    await page.goto('/blog/contract-testing');
    // Check for the unique Published: metadata label
    const publishedLabel = page.getByText('Published:', { exact: true });
    await expect(publishedLabel).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/blog');
    await page.setViewportSize({ width: 320, height: 640 });
    
    const blogContent = page.locator('main');
    await expect(blogContent).toBeVisible();
    
    // Check that no horizontal scrolling
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(320);
  });
});
