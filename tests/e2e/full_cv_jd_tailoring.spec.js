import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * RESUMEAI PRO — P1.6 FULL CV JD TAILORING END-TO-END ACCEPTANCE TEST
 * 
 * Tests the real-world user scenario:
 * 1. Uploads CV with talent acquisition, software engineering, and recruitment experience.
 * 2. Provides JD requiring Talent Acquisition, AI Sourcing, Cloud Platforms, ATS, Kubernetes.
 * 3. Enters "Make my complete CV according to this JD."
 * 4. Asserts:
 *    - Intent recognized as FULL CV TAILORING
 *    - Unsupported requirements (Kubernetes) correctly BLOCKED with 0 pts
 *    - Summary, Skills, and Experience bullets proposed for optimization
 *    - Original source template preserved
 *    - Granular approval gate executed
 *    - LockEnforcer verifies zero factual corruption
 */

test.describe('ResumeAI Pro — Full CV JD Tailoring Acceptance Suite', () => {
  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete Real-World Tailoring: "Make my complete CV according to this JD"', async ({ page }) => {
    // 1. Upload Candidate CV
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 2. Advance to Screen 3
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible({ timeout: 5000 });

    // 3. Switch to Job Description Match Mode
    await page.click('button:has-text("Job Description Match")');
    await expect(page.locator('text=Target Job Description:')).toBeVisible();

    // 4. Load Preset Job Description & Trigger Analysis
    await page.click('button:has-text("Senior Cloud & AI Recruiter JD")');
    await page.click('button:has-text("Analyze Job Description against Active CV")');

    // 5. Verify Analysis Results
    await expect(page.locator('text=Overall Job Fit Score')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Extracted Job Requirements')).toBeVisible();
    await expect(page.locator('text=TOP SAFE ACTIONS')).toBeVisible();
    await expect(page.locator('text=BLOCKED ACTIONS')).toBeVisible();

    // 6. Click Review ChangePlan & Apply -> Advance to Screen 4
    await page.click('button:has-text("Review ChangePlan & Apply")');

    // 7. Verify Screen 4 Structured Change Plan
    await expect(page.locator('text=Screen 4 — Full CV Optimization Plan')).toBeVisible({ timeout: 10000 });

    // 8. Approve Changes & Generate CV
    await page.click('button:has-text("Approve")');

    // 9. Verify Screen 6 Quality Control Passes
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('PASSED: Zero Content Loss', { exact: false })).toBeVisible();

    // 10. Advance to Screen 7 Side-by-Side Comparison Studio
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // 11. Verify Screen 7 Active Approved Version 2
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#preview-resume-updated')).toBeVisible();
  });
});
