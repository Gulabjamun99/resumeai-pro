import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ResumeAI Pro — Cross-Browser Production Verification', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete Critical Workflow (Upload -> AI Edit -> Approve -> Refresh -> Rollback -> Export -> Reset)', async ({ page, browserName }) => {
    console.log(`Running Critical Workflow on: ${browserName}`);

    // 1. Open URL & Verify Screen 1
    await page.goto('/');
    await expect(page).toHaveTitle(/resume|ResumeAI/i);
    await expect(page.locator('text=Screen 1 — Upload Your Existing CV')).toBeVisible();

    // 2. Real Upload
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 3. Proceed to Screen 3
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    // 4. Headline Change (v2)
    await page.fill('textarea', 'Headline ko Senior Cross-Browser AI Specialist kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible();
    await page.click('button:has-text("Approve & Apply Changes")');

    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify Screen 7 (v2 Active)
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Senior Cross-Browser AI Specialist');

    // 5. Summary Change (v3 Cumulative)
    await page.click('button:has-text("Make Another Change")');
    await page.fill('textarea', 'Improve the summary for an AI-enabled recruitment role while preserving every factual detail');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify v3 retains v2 headline
    await expect(page.locator('text=CURRENT_CV_STATE (Version 3')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Senior Cross-Browser AI Specialist');

    // 6. Refresh Page & Verify Persistence
    await page.reload();
    await expect(page.locator('text=CURRENT_CV_STATE (Version 3')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Senior Cross-Browser AI Specialist');

    // 7. Rollback to Version 1
    await page.click('button[title="Rollback to this version"]');
    await expect(page.locator('text=CURRENT_CV_STATE (Version 1')).toBeVisible();

    // 8. Verify PDF & DOCX Export Triggers
    const pdfBtn = page.locator('button:has-text("PDF")');
    const docxBtn = page.locator('button:has-text("DOCX")');
    await expect(pdfBtn).toBeVisible();
    await expect(docxBtn).toBeVisible();
    await expect(pdfBtn).toBeEnabled();
    await expect(docxBtn).toBeEnabled();

    // 9. Start New CV (Clean State Reset)
    await page.click('button:has-text("Start New CV")');
    await expect(page.locator('text=Screen 1 — Upload Your Existing CV')).toBeVisible();
  });

});
