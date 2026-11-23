import { test, expect } from '@playwright/test';

test('AI Assistant Chat Live Refinement Verification', async ({ page }) => {
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

  // 4. Test Undo button
  const undoButton = page.locator('button[title="Undo last change"]');
  await expect(undoButton).toBeVisible();
  await undoButton.click();
  await expect(page.locator('#resume-document')).not.toContainText('Kubernetes');
});
