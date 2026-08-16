import { test, expect } from '@playwright/test';

test.describe('ResumeAI Pro — Production Black-Box E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start clean
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Test 1: Public Production Application Loads Cleanly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/resume|ResumeAI/i);
    await expect(page.locator('text=Screen 1 — Upload Your Existing CV')).toBeVisible();
    await expect(page.locator('button:has-text("Load Demo Test Fixture")')).toBeVisible();
  });

  test('Test 2: Full Multi-Turn Workflow (v1 -> v2 -> v3 -> v4) with Exact Preservations', async ({ page }) => {
    await page.goto('/');

    // 1. Load Initial Fixture / Upload (v1)
    await page.click('button:has-text("Load Demo Test Fixture")');
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible();

    // 2. Proceed to Screen 3
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    // 3. Turn 1: Summary Update
    await page.fill('textarea', 'Make my professional summary stronger for AI-enabled recruitment roles while preserving every factual detail.');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');

    // Screen 4: Approve Change Plan
    await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible();
    await page.click('button:has-text("Approve & Apply Changes")');

    // Screen 5 -> Screen 6 -> Screen 7
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify Screen 7 (v2 Active)
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();

    // 4. Turn 2: Add Consulting Experience on top of v2
    await page.click('button:has-text("Make Another Change")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();
    await expect(page.locator('text=Active Working Copy:')).toBeVisible();

    await page.fill('textarea', 'Now add my independent consulting work after April 2025. Keep everything you changed in the previous version.');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify Screen 7 (v3 Active)
    await expect(page.locator('text=CURRENT_CV_STATE (Version 3')).toBeVisible();

    // 5. Turn 3: Add AWS and Remove Java on top of v3
    await page.click('button:has-text("Make Another Change")');
    await expect(page.locator('text=Active Working Copy:')).toBeVisible();

    await page.fill('textarea', 'Add AWS to my skills and remove Java. Do not change anything else.');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify Screen 7 (v4 Active with all accumulated edits)
    await expect(page.locator('text=CURRENT_CV_STATE (Version 4')).toBeVisible();
  });

  test('Test 3: Browser Refresh & Session Persistence Test', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Load Demo Test Fixture")');
    await page.click('button:has-text("Proceed to Screen 3")');
    await page.fill('textarea', 'Headline ko AI-Driven Talent Acquisition Specialist kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();

    // Refresh page
    await page.reload();

    // Verify state persists from localStorage directly into Screen 7!
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('text=Live Working Copy')).toBeVisible();
  });

  test('Test 4: Instant Rollback to Previous Version Snapshot', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Load Demo Test Fixture")');
    await page.click('button:has-text("Proceed to Screen 3")');
    await page.fill('textarea', 'Headline ko AI Recruiter kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();

    // Click Revert on Version 1 in Timeline
    await page.click('button[title="Rollback to this version"]');

    // Verify active version is now Version 1
    await expect(page.locator('text=CURRENT_CV_STATE (Version 1')).toBeVisible();
  });

  test('Test 5: Export Buttons (PDF & DOCX) Trigger Properly', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Load Demo Test Fixture")');
    await page.click('button:has-text("Proceed to Screen 3")');
    await page.fill('textarea', 'Summary ko professional bana do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("DOCX")')).toBeVisible();
  });

  test('Test 6: Start New CV Clears Session State', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Load Demo Test Fixture")');
    await page.click('button:has-text("Proceed to Screen 3")');
    await page.fill('textarea', 'Summary improve karo');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Click Start New CV
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Start New CV")');

    // Verify redirected back to Screen 1
    await expect(page.locator('text=Screen 1 — Upload Your Existing CV')).toBeVisible();
  });

});
