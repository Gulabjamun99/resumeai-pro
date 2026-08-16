import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ResumeAI Pro — P1.3: Granular ATS Health Scorecard & Diagnostic Breakdown E2E', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete ATS Scorecard Flow (Upload -> Screen 7 -> Verify 5 Dimensions -> Toggle Breakdown -> Template Switch Decoupling)', async ({ page }) => {
    // 1. Upload Real Candidate CV
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 2. Advance to Screen 3 -> Change Plan -> Validation Audit -> Screen 7 Studio
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    await page.fill('textarea', 'Make summary stronger and highlight cloud architecture leadership.');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');

    await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible();
    await page.click('button:has-text("Approve & Apply Changes")');

    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // 3. Verify Screen 7 Studio Active
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();

    // 4. Verify ATS Health Scorecard Component is Visible
    await expect(page.locator('text=ATS Health & Diagnostic Scorecard')).toBeVisible();
    await expect(page.locator('text=5-dimensional resume parseability & impact analysis')).toBeVisible();

    // 5. Expand Full Diagnostic Breakdown
    await page.click('button:has-text("View Full Breakdown")');
    await expect(page.locator('button:has-text("Hide Diagnostics")')).toBeVisible();

    // 6. Verify All 5 Diagnostic Pillars are Rendered with Weights
    await expect(page.locator('text=Keyword Optimization')).toBeVisible();
    await expect(page.locator('text=25% weight')).toBeVisible();

    await expect(page.locator('text=Action Verb & STAR Power')).toBeVisible();
    await expect(page.locator('text=20% weight').first()).toBeVisible();

    await expect(page.locator('text=Quantifiable Metrics & Numbers')).toBeVisible();
    await expect(page.locator('text=Structural Parseability')).toBeVisible();
    await expect(page.locator('text=Brevity & Recruiter Readability')).toBeVisible();
    await expect(page.locator('text=15% weight')).toBeVisible();

    // 7. Verify Overall ATS Health Box & Recommendations Banner
    await expect(page.locator('text=Overall ATS Health')).toBeVisible();
    await expect(page.locator('text=ATS Optimization & Diagnostic Recommendations')).toBeVisible();

    // 8. Collapse Breakdown
    await page.click('button:has-text("Hide Diagnostics")');
    await expect(page.locator('button:has-text("View Full Breakdown")')).toBeVisible();

    // 9. Switch Templates & Verify Scorecard Remains Synchronized Without Mutating Facts
    await page.click('button:has-text("Executive Single-Column")');
    await expect(page.locator('button:has-text("Executive Single-Column")')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('text=ATS Health & Diagnostic Scorecard')).toBeVisible();

    await page.click('button:has-text("Modern Minimalist")');
    await expect(page.locator('button:has-text("Modern Minimalist")')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('text=ATS Health & Diagnostic Scorecard')).toBeVisible();

    // 10. Verify Fact Preservations on Active Document
    await expect(page.locator('#preview-resume-updated')).toContainText('E2E Test Candidate');
    await expect(page.locator('#preview-resume-updated')).toContainText('Global Solutions Enterprise');
  });

});
