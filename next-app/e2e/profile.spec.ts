import { test, expect } from '@playwright/test';

test.describe('Profile page and editor', () => {
  test('renders empty profile and no badges', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/profile', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.route('**/api/badges', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ badges: [] }) });
    });

    await page.goto('/profile');

    // Wait for loading to finish
    await page.waitForSelector('text=No experience listed');

    await expect(page.locator('text=No experience listed')).toBeVisible();
    await expect(page.locator('text=No skills listed')).toBeVisible();
    // Use first() in case the text appears more than once in layout
    await expect(page.locator('text=No badges earned yet.').first()).toBeVisible();
  });

  test('parses JSON-stringified arrays and shows experience/skills/certs', async ({ page }) => {
    const profile = {
      image: '',
      about: 'Tester about',
      experience: JSON.stringify([{ title: 'Dev', company: 'QaiTalk', from: '2020', to: '2022', description: 'Automated entry' }]),
      skills: JSON.stringify(['React', 'Node']),
      licenses: JSON.stringify(['Cert-1']),
    };

    await page.route('**/api/profile', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(profile) });
    });

    await page.route('**/api/badges', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ badges: [] }) });
    });

    await page.goto('/profile');

    await expect(page.locator('text=Tester about')).toBeVisible();
    await expect(page.locator('text=Dev — QaiTalk')).toBeVisible();
    await expect(page.locator('text=React')).toBeVisible();
    await expect(page.locator('text=Cert-1')).toBeVisible();
  });

  test('edit flow: saves profile and then displays saved data', async ({ page }) => {
    // Start with empty profile
    let savedPayload: any = null;

    await page.route('**/api/profile', async (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
        return;
      }

      if (request.method() === 'POST') {
        const body = await request.postData();
        try { savedPayload = JSON.parse(body || '{}') } catch (e) { savedPayload = body }
        // Respond with a persisted-looking profile (stringify arrays server-side)
        const persisted = {
          id: 'test-1',
          userId: 'dev-test-user-1',
          image: savedPayload.image || '',
          about: savedPayload.about || '',
          experience: savedPayload.experience || '[]',
          skills: savedPayload.skills || '[]',
          licenses: savedPayload.licenses || '[]',
        };
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(persisted) });
        return;
      }
      route.continue();
    });

    await page.route('**/api/badges', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ badges: [] }) }));

    // Open editor via query param
    await page.goto('/profile?edit=1');

    // Fill fields
    await page.fill('textarea[title="About you"]', 'Playwright about');
    await page.fill('textarea[title="Experience"]', 'Role at Company');
    await page.fill('input[title="Skills"]', 'Playwright,Testing');
    await page.fill('input[title="Licenses & Certifications"]', 'Cert-A,Cert-B');

    // Click Save
    await page.click('button:has-text("Save Profile")');

    // Wait for save to complete (message shown)
    await page.waitForSelector('text=Profile saved', { timeout: 5000 });

    // Now mock GET to return savedPayload as persisted values
    await page.route('**/api/profile', (route) => {
      const persisted = {
        id: 'test-1',
        userId: 'dev-test-user-1',
        image: savedPayload.image || '',
        about: savedPayload.about || '',
        experience: savedPayload.experience || '[]',
        skills: savedPayload.skills || '[]',
        licenses: savedPayload.licenses || '[]',
      };
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(persisted) });
    });

    // Navigate to profile view and assert
    await page.goto('/profile');
    await expect(page.locator('text=Playwright about')).toBeVisible();
    await expect(page.locator('text=Role at Company')).toBeVisible();
    // Use exact text match for short tokens to avoid collisions
    await expect(page.locator('text="Playwright"')).toBeVisible();
    await expect(page.locator('text="Cert-A"')).toBeVisible();
  });
});
