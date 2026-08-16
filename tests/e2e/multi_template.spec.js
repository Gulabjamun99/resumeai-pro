import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('ResumeAI Pro — P1.2: Multi-Template ATS Formatting Engine E2E', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete Multi-Template Workflow (Upload -> Screen 7 -> Switch Dual/Single/Modern -> Verify Invariants -> Screen 8 -> PDF & DOCX Export)', async ({ page }) => {
    // 1. Upload Real Candidate CV
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 2. Advance to Screen 3 -> Job Description Match -> Screen 4 -> Screen 6 -> Screen 7
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    await page.click('button:has-text("Job Description Match")');
    await expect(page.locator('text=Target Job Description:')).toBeVisible();

    await page.click('button:has-text("Senior Cloud & AI Recruiter JD")');
    await page.click('button:has-text("Analyze Job Description against Active CV")');

    await expect(page.locator('text=Suggested Safe Improvements')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Review & Apply")');

    await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible();
    await page.click('button:has-text("Approve & Apply Changes")');

    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();

    // 3. Verify Template Selector is Visible on Screen 7
    await expect(page.locator('text=ATS Document Template')).toBeVisible();
    await expect(page.locator('button:has-text("Classic Dual-Column")')).toBeVisible();
    await expect(page.locator('button:has-text("Executive Single-Column")')).toBeVisible();
    await expect(page.locator('button:has-text("Modern Minimalist")')).toBeVisible();

    // 4. Test Template A (Classic Dual-Column)
    await expect(page.locator('#preview-resume-updated').locator('text=Contact Information')).toBeVisible();
    await expect(page.locator('#preview-resume-updated').getByRole('heading', { name: 'Work Experience' })).toBeVisible();

    // 5. Switch to Template B (Executive Single-Column)
    await page.click('button:has-text("Executive Single-Column")');
    await expect(page.locator('button:has-text("Executive Single-Column")')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#preview-resume-updated').getByRole('heading', { name: 'Professional Experience' })).toBeVisible();
    await expect(page.locator('#preview-resume-updated').getByRole('heading', { name: 'Core Competencies & Technical Skills' })).toBeVisible();

    // 6. Switch to Template C (Modern Minimalist)
    await page.click('button:has-text("Modern Minimalist")');
    await expect(page.locator('button:has-text("Modern Minimalist")')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#preview-resume-updated').getByRole('heading', { name: 'Profile Summary' })).toBeVisible();
    await expect(page.locator('#preview-resume-updated').getByRole('heading', { name: 'Skills & Expertise' })).toBeVisible();

    // 7. Verify Content Invariant (Zero Dropped Facts)
    await expect(page.locator('#preview-resume-updated')).toContainText('E2E Test Candidate');
    await expect(page.locator('#preview-resume-updated')).toContainText('Global Solutions Enterprise');

    // 8. Refresh & Verify Persistence of Selected Template
    await page.reload();
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('button:has-text("Modern Minimalist")')).toHaveAttribute('aria-pressed', 'true');

    // 9. Advance to Screen 8 Download
    await page.click('button:has-text("Proceed to Final Download")');
    await expect(page.locator('text=Screen 8 — CV Successfully Updated & Verified')).toBeVisible();

    // 10. Switch to Executive Single-Column on Screen 8
    await page.click('button:has-text("Executive Single-Column")');
    await expect(page.locator('button:has-text("Executive Single-Column")')).toHaveAttribute('aria-pressed', 'true');

    // 11. Test DOCX Download with Single-Column Template
    const [downloadDocx] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.click('button:has-text("Download Real DOCX")')
    ]);
    expect(downloadDocx.suggestedFilename()).toBe('E2E_Test_Candidate_ATS_Resume_v2.docx');

    const docxSavePath = path.resolve('test_artifacts/multi_tmpl_download.docx');
    await downloadDocx.saveAs(docxSavePath);
    const docxBuffer = fs.readFileSync(docxSavePath);
    expect(docxBuffer.toString('latin1', 0, 2)).toBe('PK');

    // 12. Test PDF Download with Single-Column Template
    const [downloadPdf] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.click('button:has-text("Download ATS PDF")')
    ]);
    expect(downloadPdf.suggestedFilename()).toBe('E2E_Test_Candidate_ATS_Resume_v2.pdf');

    const pdfSavePath = path.resolve('test_artifacts/multi_tmpl_download.pdf');
    await downloadPdf.saveAs(pdfSavePath);
    const pdfBuffer = fs.readFileSync(pdfSavePath);
    expect(pdfBuffer.toString('latin1', 0, 5)).toBe('%PDF-');
  });

});
