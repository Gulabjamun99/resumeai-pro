import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ResumeAI Pro — P1: Job Description Match Mode & Evidence Gap Analyzer E2E', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete JD Match Flow (Upload -> Switch to JD Match -> Analyze -> Review Evidence Table -> Apply Safe Suggestion -> Studio v2 -> Rollback)', async ({ page }) => {
    // 1. Upload Real Candidate CV
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 2. Advance to Screen 3
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    // 3. Switch to Job Description Match Tab
    await page.click('button:has-text("Job Description Match")');
    await expect(page.locator('text=Target Job Description:')).toBeVisible();

    // 4. Load Preset Job Description
    await page.click('button:has-text("Senior Cloud & AI Recruiter JD")');
    
    // 5. Trigger Analysis
    await page.click('button:has-text("Analyze Job Description against Active CV")');

    // 6. Verify Evidence Table & Score Rendered
    await expect(page.locator('text=Evidence-Based Job Match Score')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Extracted Job Requirements & Evidence')).toBeVisible();
    await expect(page.locator('text=EVIDENCED').first()).toBeVisible();
    await expect(page.locator('text=NOT EVIDENCED').first()).toBeVisible();

    // 7. Verify Suggested Safe Improvements
    await expect(page.locator('text=Suggested Safe Improvements')).toBeVisible();
    await page.click('button:has-text("Review & Apply")');

    // 8. Verify Screen 4 Structured Change Plan
    await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible();
    await page.click('button:has-text("Approve & Apply Changes")');

    // 9. Advance through Quality Control to Screen 7 Studio
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // 10. Verify Screen 7 Active Version 2
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('E2E Test Candidate');

    // 11. Test Page Reload Persistence
    await page.reload();
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();

    // 12. Test Instant Rollback to Version 1
    await page.click('button[title="Rollback to this version"]');
    await expect(page.locator('text=CURRENT_CV_STATE (Version 1')).toBeVisible();
  });

});
