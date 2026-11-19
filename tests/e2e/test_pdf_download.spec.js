import { test, expect } from '@playwright/test';

test('Debug PDF Download and Capture Console Errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', exception => {
    console.log('PAGE EXCEPTION:', exception.message);
    errors.push(exception.message);
  });

  await page.goto('/');
  await page.click('button:has-text("2. Build Fresh with AI")');
  await page.click('button:has-text("Blank Canvas & Chat")');

  // Wait for canvas to be visible
  await expect(page.locator('#resume-document')).toBeVisible();

  // Listen for download event
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(err => {
    console.log('Download event timeout/error:', err.message);
    return null;
  });

  // Click Download PDF
  await page.click('button:has-text("Download PDF")');

  const download = await downloadPromise;
  console.log('DOWNLOAD RESULT:', download ? await download.suggestedFilename() : 'NO DOWNLOAD');
  console.log('ALL ERRORS CAPTURED:', errors);
});
