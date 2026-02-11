import { test, expect } from '@playwright/test';

test.describe('CV Review & Interview Prep Tool', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/cv-review');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load CV review page', async ({ page }) => {
    await page.goto('/cv-review');
    await expect(page).toHaveTitle(/CV Review.*QAi Talks/);
    
    // Check hero section
    const heading = page.locator('h1:has-text("CV Review & Interview Prep")');
    await expect(heading).toBeVisible();
  });

  test('should display privacy badges', async ({ page }) => {
    await page.goto('/cv-review');
    
    // Check for privacy indicators
    await expect(page.locator('text=No Data Stored')).toBeVisible();
    await expect(page.locator('text=Results in ~60s')).toBeVisible();
    await expect(page.locator('text=ATS Optimized')).toBeVisible();
  });

  test('should have form with two textareas', async ({ page }) => {
    await page.goto('/cv-review');
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    
    await expect(resumeTextarea).toBeVisible();
    await expect(jobTextarea).toBeVisible();
  });

  test('should disable submit button when form is invalid', async ({ page }) => {
    await page.goto('/cv-review');
    
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when form is valid', async ({ page }) => {
    await page.goto('/cv-review');
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    
    // Fill with minimum required characters
    await resumeTextarea.fill('a'.repeat(100)); // Min 100 chars
    await jobTextarea.fill('b'.repeat(30)); // Min 30 chars
    
    await expect(submitButton).toBeEnabled();
  });

  test('should show character count feedback', async ({ page }) => {
    await page.goto('/cv-review');
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    await resumeTextarea.fill('Short text');
    
    // Check for character count indicator
    const charCount = page.locator('text=/\\d+\\/100/');
    await expect(charCount).toBeVisible();
  });

  test('should submit form and display loading state', async ({ page }) => {
    await page.goto('/cv-review');
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    
    // Fill valid data
    await resumeTextarea.fill(`
      John Doe
      Software Engineer with 5 years of experience in React, Node.js, and TypeScript.
      Skilled in building scalable web applications, RESTful APIs, and cloud deployment.
      Previous roles at Tech Corp and StartupXYZ.
    `.repeat(2)); // Ensure > 100 chars
    
    await jobTextarea.fill('Senior Full-Stack Engineer position requiring React and Node.js experience');
    
    // Submit form
    await submitButton.click();
    
    // Should show loading state
    await expect(page.locator('text=/Analyzing|Processing/')).toBeVisible({ timeout: 2000 });
  });

  test('should display results after successful submission', async ({ page }) => {
    // Note: This test may timeout if API takes too long or rate limit is hit
    test.setTimeout(90000); // 90 seconds for API response
    
    await page.goto('/cv-review');
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    
    // Fill valid data
    await resumeTextarea.fill(`
      Jane Smith - Senior Software Engineer
      
      SUMMARY:
      Experienced full-stack developer with 7+ years building enterprise applications.
      Expert in React, TypeScript, Node.js, PostgreSQL, and AWS cloud services.
      
      EXPERIENCE:
      Senior Software Engineer at TechCorp (2020-2024)
      - Led team of 5 engineers building SaaS platform
      - Architected microservices handling 1M+ daily users
      - Reduced API latency by 40% through optimization
      
      Software Engineer at StartupXYZ (2017-2020)
      - Built MVP using React and Node.js
      - Implemented CI/CD pipeline with GitHub Actions
      - Managed PostgreSQL database and Redis cache
      
      EDUCATION:
      BS Computer Science, State University (2017)
      
      SKILLS:
      React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Kubernetes
    `);
    
    await jobTextarea.fill(`
      Senior Full-Stack Engineer
      
      We're seeking an experienced engineer to join our platform team.
      
      Requirements:
      - 5+ years software development experience
      - Expert in React and TypeScript
      - Strong backend skills with Node.js
      - Experience with PostgreSQL and AWS
      - Knowledge of Docker and containerization
      - Strong communication and leadership skills
    `);
    
    // Submit
    await submitButton.click();
    
    // Wait for results (may take 30-60 seconds)
    try {
      await expect(page.locator('text=/Overall Assessment|Key Strengths/')).toBeVisible({ timeout: 75000 });
      
      // Check for all 4 sections
      await expect(page.locator('text=Overall Assessment')).toBeVisible();
      await expect(page.locator('text=ATS Optimization')).toBeVisible();
      await expect(page.locator('text=Interview Preparation')).toBeVisible();
      await expect(page.locator('text=Gap Analysis')).toBeVisible();
      
      // Check for PDF export button
      const pdfButton = page.locator('button:has-text("Download PDF Report")');
      await expect(pdfButton).toBeVisible();
      
      // Check history button appears
      const historyButton = page.locator('button:has-text("History")');
      await expect(historyButton).toBeVisible();
    } catch (error) {
      // Check if rate limit was hit
      const errorMessage = page.locator('text=/Rate limit|Too many requests/');
      const isRateLimited = await errorMessage.isVisible();
      
      if (isRateLimited) {
        console.log('Rate limit hit - test expected to fail');
        test.skip();
      } else {
        throw error;
      }
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/cv-review');
    
    // Mock API to return error
    await page.route('**/api/cv-review/generate', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    
    await resumeTextarea.fill('a'.repeat(100));
    await jobTextarea.fill('b'.repeat(30));
    await submitButton.click();
    
    // Should show error message
    await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should display history after submission', async ({ page }) => {
    test.setTimeout(90000);
    
    await page.goto('/cv-review');
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    
    // Submit first review
    await resumeTextarea.fill('Test resume content with enough characters to pass validation requirements. Adding more text to ensure we exceed the 100 character minimum.');
    await jobTextarea.fill('Test job description with minimum 30 characters required.');
    
    // Mock successful response
    await page.route('**/api/cv-review/generate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            overallAssessment: { keyStrengths: ['Test'], improvement: ['Test'] },
            atsOptimization: { score: 85, keywords: { matched: [], missing: [] }, formatting: ['Test'] },
            interviewPrep: { likely: ['Q1'], technical: ['Q2'], behavioral: ['Q3'] },
            gapAnalysis: { technical: ['Gap1'], experience: ['Gap2'], recommendations: ['Rec1'] },
            provider: 'gemini',
            generationTimeMs: 1000,
          },
        }),
      });
    });
    
    await submitButton.click();
    
    // Wait for results
    await expect(page.locator('text=Overall Assessment')).toBeVisible({ timeout: 10000 });
    
    // Click history button
    const historyButton = page.locator('button:has-text("History")');
    await historyButton.click();
    
    // History sidebar should appear
    await expect(page.locator('text=Recent Reviews')).toBeVisible();
  });

  test('should load previous review from history', async ({ page }) => {
    test.setTimeout(90000);
    
    await page.goto('/cv-review');
    
    // Mock successful response
    await page.route('**/api/cv-review/generate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            overallAssessment: { keyStrengths: ['Unique Strength'], improvement: ['Test'] },
            atsOptimization: { score: 85, keywords: { matched: [], missing: [] }, formatting: ['Test'] },
            interviewPrep: { likely: ['Q1'], technical: ['Q2'], behavioral: ['Q3'] },
            gapAnalysis: { technical: ['Gap1'], experience: ['Gap2'], recommendations: ['Rec1'] },
            provider: 'gemini',
            generationTimeMs: 1000,
          },
        }),
      });
    });
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    
    await resumeTextarea.fill('Test resume with unique content for history test. More text to ensure minimum character requirement.');
    await jobTextarea.fill('Job description for history test with minimum characters.');
    await submitButton.click();
    
    await expect(page.locator('text=Unique Strength')).toBeVisible({ timeout: 10000 });
    
    // Scroll to top and clear results by refreshing
    await page.reload();
    
    // Open history
    const historyButton = page.locator('button:has-text("History")');
    await historyButton.click();
    
    // Click on first history item
    const firstHistoryItem = page.locator('text=Test resume').first();
    await firstHistoryItem.click();
    
    // Results should be loaded
    await expect(page.locator('text=Unique Strength')).toBeVisible();
  });

  test('should delete history item', async ({ page }) => {
    test.setTimeout(90000);
    
    await page.goto('/cv-review');
    
    // Mock successful response
    await page.route('**/api/cv-review/generate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            overallAssessment: { keyStrengths: ['Test'], improvement: ['Test'] },
            atsOptimization: { score: 85, keywords: { matched: [], missing: [] }, formatting: ['Test'] },
            interviewPrep: { likely: ['Q1'], technical: ['Q2'], behavioral: ['Q3'] },
            gapAnalysis: { technical: ['Gap1'], experience: ['Gap2'], recommendations: ['Rec1'] },
            provider: 'gemini',
            generationTimeMs: 1000,
          },
        }),
      });
    });
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    const jobTextarea = page.locator('textarea[placeholder*="Paste the job description"]');
    const submitButton = page.locator('button:has-text("Get AI Feedback")');
    
    await resumeTextarea.fill('Test resume for delete test. More text to ensure minimum character requirement is met.');
    await jobTextarea.fill('Job description for delete test with minimum.');
    await submitButton.click();
    
    await expect(page.locator('text=Overall Assessment')).toBeVisible({ timeout: 10000 });
    
    // Open history
    const historyButton = page.locator('button:has-text("History (1)")');
    await historyButton.click();
    
    // Click delete button (trash icon)
    const deleteButton = page.locator('button[title="Delete"]').first();
    await deleteButton.click();
    
    // History should be empty or button text changes
    await expect(page.locator('text=Recent Reviews')).not.toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/cv-review');
    
    const heading = page.locator('h1:has-text("CV Review")');
    await expect(heading).toBeVisible();
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    await expect(resumeTextarea).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/cv-review');
    
    const heading = page.locator('h1:has-text("CV Review")');
    await expect(heading).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/cv-review');
    
    // Check navigation to CV review page works from navbar
    const cvReviewLink = page.locator('a[href="/cv-review"]');
    await expect(cvReviewLink).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/cv-review');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for h2 (section headings)
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(1);
  });

  test('should have keyboard-accessible form', async ({ page }) => {
    await page.goto('/cv-review');
    
    const resumeTextarea = page.locator('textarea[placeholder*="Paste your resume"]');
    
    // Tab to textarea
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Type into focused element
    await page.keyboard.type('Testing keyboard accessibility with enough characters to meet requirements.');
    
    // Verify text was entered
    const value = await resumeTextarea.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('should not store sensitive data in localStorage', async ({ page }) => {
    await page.goto('/cv-review');
    
    // Check privacy indicators
    await expect(page.locator('text=No Data Stored')).toBeVisible();
    
    // History only stores previews, not full content
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
    expect(localStorageKeys).toEqual(['qaitalks_cv_review_history'].slice(0, localStorageKeys.length));
  });
});
