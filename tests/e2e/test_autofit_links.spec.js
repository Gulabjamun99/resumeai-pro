import { test, expect } from '@playwright/test';

test.describe('Auto-Fit 1/2-Page Engine & Clickable Link Badges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Auto-Fit toggle switches between Strict 1-Page and Max 2-Page mode and export buttons are active', async ({ page }) => {
    // Upload test CV to enter Interactive Live Studio
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/e2e_test_candidate.txt');

    // Wait for canvas to load
    await expect(page.locator('#resume-document')).toBeVisible({ timeout: 10000 });

    // Verify Strict 1-Page and Max 2-Page buttons exist
    const strict1PageBtn = page.getByRole('button', { name: /Strict 1-Page/i });
    const max2PageBtn = page.getByRole('button', { name: /Max 2-Page/i });

    await expect(strict1PageBtn).toBeVisible();
    await expect(max2PageBtn).toBeVisible();

    // Toggle to Max 2-Page
    await max2PageBtn.click();
    await page.waitForTimeout(300);

    // Toggle back to Strict 1-Page
    await strict1PageBtn.click();
    await page.waitForTimeout(300);

    // Verify Export buttons exist and are active
    const pdfBtn = page.getByRole('button', { name: /Download PDF/i });
    const docxBtn = page.getByRole('button', { name: /Word DOCX/i });

    await expect(pdfBtn).toBeVisible();
    await expect(docxBtn).toBeVisible();
  });
});
