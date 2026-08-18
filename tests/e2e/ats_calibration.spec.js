import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ResumeAI Pro — P1.4: ATS Intelligence, Evidence Lineage & Score Explainability E2E', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete ATS Intelligence & Lineage Flow (Upload -> JD Match -> 4-Tier Badges -> Lineage -> Projection -> Studio Explainability)', async ({ page }) => {
    // 1. Upload Real Candidate CV
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 2. Advance to Screen 3
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    // 3. Switch to Job Description Match Mode
    await page.click('button:has-text("Job Description Match")');
    await expect(page.locator('textarea')).toBeVisible();

    // 4. Fill JD with technical skills (Python, AWS, Docker, Kubernetes, PostgreSQL)
    const testJd = `
      We are hiring a Lead Cloud Infrastructure Engineer.
      Requirements:
      - Deep experience with Python, AWS, and Cloud Architecture
      - Hands-on expertise with Kubernetes (K8s) and Docker containerization
      - Strong knowledge of PostgreSQL databases and REST APIs
      - Proven track record of team leadership and ATS optimization
    `;
    await page.fill('textarea', testJd);
    await page.click('button:has-text("Analyze Job Description against Active CV")');

    // 5. Verify Match Score & Explainability Callout
    await expect(page.locator('text=Evidence-Based Job Match Score')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Score Audit & Explainability:')).toBeVisible();

    // 6. Verify 4-Tier Confidence Badges in Deep Evidence Table
    await expect(page.locator('text=Extracted Job Requirements & Deep Evidence Lineage')).toBeVisible();
    await expect(page.locator('text=EXACT').first()).toBeVisible();

    // 7. Verify Deep Lineage Provenance
    await expect(page.locator('text=Skills & Competencies →').first()).toBeVisible();

    // 8. Verify Non-Mutating Projected Impact Banner
    if (await page.locator('text=Projected ATS Impact:').isVisible()) {
      await expect(page.locator('text=Projection only • Active CV has not been modified')).toBeVisible();
    }

    // 9. Switch back to Free-form edit or formulate Change Plan
    await page.click('button:has-text("Free-Form Edit")');
    await page.fill('textarea', 'Headline ko Lead Platform Engineer karke summary sharpen karo');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');

    // 10. Verify Screen 4 Change Plan
    await expect(page.locator('text=Screen 4 — ')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Approve")');

    // 11. Advance through Screen 6 Validation Audit to Screen 7 Studio
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // 12. Verify Screen 7 Studio & Explainable Scorecard
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('text=ATS Health & Diagnostic Scorecard')).toBeVisible();

    // 13. Expand Scorecard & Verify Explainability Tabs
    await page.click('button:has-text("View Full Breakdown")');
    await expect(page.locator('text=Score Explainability & Trace Breakdown')).toBeVisible();
    await expect(page.locator('button:has-text("Keywords (25 pts)")')).toBeVisible();
    await expect(page.locator('button:has-text("STAR Verbs (20 pts)")')).toBeVisible();
    await expect(page.locator('button:has-text("Metrics (20 pts)")')).toBeVisible();

    // 14. Click STAR Verbs Tab & Verify Line-Item Tracing
    await page.click('button:has-text("STAR Verbs (20 pts)")');
    await expect(page.locator('text=Why').first()).toBeVisible();

    // 15. Verify Fact Preservations on Active Document
    await expect(page.locator('#preview-resume-updated')).toContainText('E2E Test Candidate');
    await expect(page.locator('#preview-resume-updated')).toContainText('Global Solutions Enterprise');
  });

});
