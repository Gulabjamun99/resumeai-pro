import { test, expect } from '@playwright/test';
import path from 'path';

test('Capture live visual rendering of Rohit Kumar Updated Hubahu Resume', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click Load Sample Demo CV
  const loadDemoBtn = page.getByRole('button', { name: /Load Sample Demo CV/i });
  if (await loadDemoBtn.isVisible()) {
    await loadDemoBtn.click();
  }

  await page.waitForTimeout(500);

  // Screen 2: Proceed to Screen 3
  const proceedBtn = page.getByRole('button', { name: /Proceed to Screen 3/i });
  if (await proceedBtn.isVisible()) {
    await proceedBtn.click();
  }

  await page.waitForTimeout(500);

  // Screen 3: Set exact user prompt
  const promptInput = page.getByPlaceholder(/Describe your change request/i);
  await promptInput.fill("may 2025 se vide coding, ai tools ka use kr rhe hai jaise antigravity, claude, chatgpt, perpelexity, z.ai, github , vercel, firbase, supabase, etc bahu sare tools . bahut se product banaya hu like jyotish connect, turtleping, mausam veda, kharcha book app, gharmantra app, smartscanner app , etc. sab live hai sara scracth se ai tool ki help se banaya hu");

  // Formulate Plan
  const planBtn = page.getByRole('button', { name: /Formulate Change Plan/i });
  await planBtn.click();

  await page.waitForTimeout(1000);

  // Screen 4: Approve & Execute Change Plan
  const approveBtn = page.getByRole('button', { name: /Approve & Execute Change Plan/i });
  await approveBtn.click();

  // Screen 5: Wait for generation
  await page.waitForTimeout(3500);

  // Screen 6: Accept & Commit Approved Version
  const commitBtn = page.getByRole('button', { name: /Accept & Commit Approved Version/i });
  if (await commitBtn.isVisible()) {
    await commitBtn.click();
  }

  await page.waitForTimeout(1500);

  // Take screenshot of the exact updated resume preview
  const updatedResumeEl = page.locator('#preview-resume-updated');
  if (await updatedResumeEl.isVisible()) {
    await updatedResumeEl.screenshot({ 
      path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/rohit_updated_hubahu_cv.png' 
    });
  }

  // Also full page screenshot
  await page.screenshot({ 
    path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/rohit_full_studio_view.png',
    fullPage: true 
  });
});
