import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Auto-Fit 1/2-Page Engine, Multicolor/Fonts & Vector PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Auto-Fit toggle, 19 Fonts, Text/Column Colors, and Vector Selectable PDF Download', async ({ page }) => {
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

    await max2PageBtn.click();
    await page.waitForTimeout(200);
    await strict1PageBtn.click();
    await page.waitForTimeout(200);

    // Verify Chat small removal instruction ("usme se Python hataye")
    const chatInput = page.locator('input[placeholder*="Hindi, Hinglish, English"]');
    await chatInput.fill('usme se Python hataye');
    await chatInput.press('Enter');
    await expect(page.locator('#resume-document')).not.toContainText('Python', { timeout: 10000 });

    // Open Templates & Styles tab and verify 19 fonts + Text/Box/Column Colors
    await page.click('button:has-text("Templates & Styles")');
    await expect(page.locator('text=Accent & Heading Color')).toBeVisible();
    await expect(page.locator('text=Text Colors (Name & Body)')).toBeVisible();
    await expect(page.locator('text=Column & Box Colors')).toBeVisible();
    await expect(page.locator('button:has-text("Same Color Both")')).toBeVisible();
    await expect(page.locator('text=Resume Font Style (19)')).toBeVisible();

    // Select a two-column template + Merriweather font
    await page.click('button:has-text("Modern Two-Column Pro")');
    await page.click('button:has-text("Merriweather")');
    await expect(page.locator('#resume-document')).toHaveClass(/font-serif/);

    // Verify Download PDF produces a true Vector PDF (contains /Type /Font and no /Subtype /Image)
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.getByRole('button', { name: /Download PDF/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/_ATS_Resume\.pdf$/);

    const pdfPath = await download.path();
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfRaw = pdfBuffer.toString('latin1');
    expect(pdfRaw).toContain('/Type /Font');
    expect(pdfRaw).not.toContain('/Subtype /Image');
  });
});
