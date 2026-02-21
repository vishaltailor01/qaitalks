import { test as base, expect } from '@playwright/test';

export const test = base;
export { expect };

// Global beforeEach to stub flaky/slow API endpoints for more stable tests
test.beforeEach(async ({ page }) => {
  // Stable empty badges
  await page.route('**/api/badges', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ badges: [] }) });
  });

  // Profile endpoints: default to empty profile unless overwritten in a test
  await page.route('**/api/profile', (route, request) => {
    if (request.method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    } else if (request.method() === 'POST') {
      // Echo back minimal persisted shape
      (async () => {
        const body = await request.postData();
        let parsed = {};
        try { parsed = JSON.parse(body || '{}'); } catch (e) { parsed = {} }
        const persisted = {
          id: 'test-persisted',
          userId: 'dev-test-user-1',
          image: parsed.image || '',
          about: parsed.about || '',
          experience: parsed.experience || '[]',
          skills: parsed.skills || '[]',
          licenses: parsed.licenses || '[]',
        };
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(persisted) });
      })();
    } else {
      route.continue();
    }
  });

  // CV review API: respond with a canned quick response to avoid external rate limits
  await page.route('**/api/cv-review/generate', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          overallAssessment: { keyStrengths: ['Automated test'], improvement: ['Keep it concise'] },
          atsOptimization: { score: 85, keywords: { matched: [], missing: [] }, formatting: [] },
          interviewPrep: { likely: ['Q1'], technical: ['Q2'], behavioral: ['Q3'] },
          gapAnalysis: { technical: [], experience: [], recommendations: [] },
          provider: 'mock',
          generationTimeMs: 200,
        },
      }),
    });
  });

  // Generic routes that may call third-party AI endpoints: return 200 with safe payload
  await page.route('**/api/test-gemini/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
});
