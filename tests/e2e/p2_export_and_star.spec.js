import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('ResumeAI Pro — P2: Production Hardening & Export Optimization E2E', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/p2_star_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete P2 Workflow (Upload -> STAR Refinement -> ChangePlan -> Screen 8 -> PDF Download -> DOCX Download)', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // 1. Upload Real Candidate CV with passive bullets
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

    // 2. Advance to Screen 3
    await page.click('button:has-text("Proceed to Screen 3")');
    await expect(page.locator('text=Screen 3 — Change Request')).toBeVisible();

    // 3. Open STAR Bullet Polish Accordion
    const starAccordion = page.locator('text=Smart STAR & Action-Verb Bullet Polish');
    await expect(starAccordion).toBeVisible({ timeout: 10000 });
    await starAccordion.click();
    await expect(page.locator('text=Verb:').first()).toBeVisible();
    
    // 4. Apply STAR refinement
    await page.click('button:has-text("Selected STAR Polish")');
    await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible();
    await page.click('button:has-text("Approve & Apply Changes")');

    // 5. Validation & Studio
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();

    // 6. Advance to Screen 8 Download Center
    await page.click('button:has-text("Proceed to Final Download")');
    await expect(page.locator('text=Screen 8 — CV Successfully Updated & Verified')).toBeVisible();

    // 7. Verify Candidate & Dynamic Filenames Display
    await expect(page.locator('span:has-text("E2E Test Candidate")')).toBeVisible();
    await expect(page.locator('text=E2E_Test_Candidate_ATS_Resume_v2.pdf')).toBeVisible();
    await expect(page.locator('text=E2E_Test_Candidate_ATS_Resume_v2.docx')).toBeVisible();

    // 8. Test DOCX Download & OpenXML ZIP Header Verification
    const [downloadDocx] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.click('button:has-text("Download Real DOCX")')
    ]);
    expect(downloadDocx.suggestedFilename()).toBe('E2E_Test_Candidate_ATS_Resume_v2.docx');

    const docxSavePath = path.resolve('test_artifacts/p2_test_download.docx');
    await downloadDocx.saveAs(docxSavePath);
    const docxBuffer = fs.readFileSync(docxSavePath);
    expect(docxBuffer.toString('latin1', 0, 2)).toBe('PK');

    // 9. Test PDF Download & Byte Header Verification
    const [downloadPdf] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.click('button:has-text("Download ATS PDF")')
    ]);
    expect(downloadPdf.suggestedFilename()).toBe('E2E_Test_Candidate_ATS_Resume_v2.pdf');

    const pdfSavePath = path.resolve('test_artifacts/p2_test_download.pdf');
    await downloadPdf.saveAs(pdfSavePath);
    const pdfBuffer = fs.readFileSync(pdfSavePath);
    expect(pdfBuffer.toString('latin1', 0, 5)).toBe('%PDF-');
  });

});
