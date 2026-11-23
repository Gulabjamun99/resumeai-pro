import { test, expect } from '@playwright/test';

test('AI Assistant Chat Live Refinement Verification', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/');

  // 1. Start fresh CV
  await page.click('button:has-text("2. Build Fresh with AI")');
  await page.click('button:has-text("Blank Canvas & Chat")');

  // Verify Studio and Canvas are loaded
  await expect(page.locator('#resume-document')).toBeVisible();

  // 2. Send instruction to change designation
  await page.fill('input[placeholder*="Kisi bhi language"]', 'Designation change karke Principal Cloud Architect karo');
  await page.click('button[type="submit"]');

  // Wait for AI processing to finish and canvas to reflect update
  await expect(page.locator('#resume-document')).toContainText('Principal Cloud Architect', { timeout: 25000 });

  // 3. Send instruction to add skills
  await page.fill('input[placeholder*="Kisi bhi language"]', 'Add Kubernetes and Terraform to skills');
  await page.click('button[type="submit"]');

  // Wait for skills to appear on canvas
  await expect(page.locator('#resume-document')).toContainText('Kubernetes', { timeout: 25000 });
  await expect(page.locator('#resume-document')).toContainText('Terraform', { timeout: 25000 });

  // 4. Test User's Exact Phrase: Profile summary overhaul
  await page.fill('input[placeholder*="Kisi bhi language"]', 'profile summary cv ke hisab acha banaye abhi chij ko bhi cover krye ache jisse job mil ske');
  await page.click('button[type="submit"]');

  // Verify that error message NEVER appears
  await expect(page.locator('text=Instruction process karne me dikkat aayi')).not.toBeVisible();
  // Verify executive summary updated on canvas
  await expect(page.locator('#resume-document')).toContainText('proven track record', { timeout: 25000 });

  // 5. Test Projects with URLs & Clickable Links
  await page.fill('input[placeholder*="Kisi bhi language"]', 'Key Projects - Kharcha desk-https://play.google.com/store/apps/details?id=com.apna.kharcha_book Gharmantra -https://play.google.com/store/apps/details?id=com.gharmantra.app');
  await page.click('button[type="submit"]');

  await expect(page.locator('#resume-document')).toContainText('Kharcha Desk', { timeout: 25000 });
  await expect(page.locator('#resume-document')).toContainText('Gharmantra', { timeout: 25000 });
  // Verify clickable link on canvas
  await expect(page.locator('#resume-document a[href*="play.google.com"]').first()).toBeVisible({ timeout: 10000 });

  // 6. Test Undo button
  const undoButton = page.locator('button[title="Undo last change"]');
  await expect(undoButton).toBeVisible();
  await undoButton.click();
});
