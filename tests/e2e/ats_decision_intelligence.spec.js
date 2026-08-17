import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ResumeAI Pro — P1.5: ATS Decision Intelligence & Recruiter Risk E2E', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete ATS Decision Intelligence Workflow (Upload -> JD Match -> 5-Signal Fit -> Risks -> Top Actions -> Blocked Actions -> ChangePlan -> Screen 7)', async ({ page }) => {
    // 1. Upload Real Candidate CV
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 2. Advance to Screen 3
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    // 3. Switch to Job Description Match Mode
    await page.click('button:has-text("Job Description Match")');
    await expect(page.locator('text=Evidence-Based Anti-Hallucination Matching')).toBeVisible();

    // 4. Input Target Job Description
    const targetJd = `We are hiring a Lead Cloud Infrastructure Engineer.
Requirements:
- Deep experience with Python, AWS, and Cloud Architecture
- Hands-on expertise with Kubernetes (K8s) and Docker containerization
- Strong knowledge of PostgreSQL databases and REST APIs
- Proven track record of team leadership and ATS optimization`;

    await page.locator('textarea').fill(targetJd);
    await page.click('button:has-text("Analyze Job Description against Active CV")');

    // 5. Verify P1.5 5-Signal Job Fit Dashboard
    await expect(page.locator('text=Overall Job Fit Score')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=ATS Compatibility')).toBeVisible();
    await expect(page.locator('text=Evidence Strength')).toBeVisible();
    await expect(page.locator('text=Recruiter Readability')).toBeVisible();
    await expect(page.locator('text=Keyword Coverage')).toBeVisible();
    await expect(page.locator('text=Credibility & Safety')).toBeVisible();
    await expect(page.locator('text=Not a statistical hiring probability')).toBeVisible();

    // 6. Verify TOP SAFE ACTIONS (Ranked by ROI)
    await expect(page.locator('text=TOP SAFE ACTIONS')).toBeVisible();
    await expect(page.locator('text=pts').first()).toBeVisible();

    // 7. Verify 🛡 BLOCKED ACTIONS Panel
    await expect(page.locator('text=BLOCKED ACTIONS')).toBeVisible();
    await expect(page.locator('text=BLOCKED (+0 pts)').first()).toBeVisible();
    await expect(page.locator('text=No supporting evidence exists in candidate history for "Kubernetes"')).toBeVisible();

    // 8. Verify Requirements Table with Importance and Recommendation
    await expect(page.locator('th:has-text("Importance")')).toBeVisible();
    await expect(page.locator('th:has-text("Recommendation")')).toBeVisible();
    await expect(page.locator('text=CRITICAL').first()).toBeVisible();
    await expect(page.locator('text=DO_NOT_INVENT').first()).toBeVisible();

    // 9. Click "Review ChangePlan & Apply"
    await page.click('button:has-text("Review ChangePlan & Apply")');

    // 10. Verify Screen 4 Structured Change Plan
    await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Approve & Apply Changes")');

    // 11. Advance through Screen 6 Validation Audit to Screen 7 Studio
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // 12. Verify Screen 7 Studio & Version 2
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=ATS Health & Diagnostic Scorecard')).toBeVisible();

    // 13. Verify Fact Preservation on Active Document
    await expect(page.locator('#preview-resume-updated')).toContainText('E2E Test Candidate');
    await expect(page.locator('#preview-resume-updated')).toContainText('Global Solutions Enterprise');
  });

});
