import { test, expect } from '@playwright/test';

test('Verify User Vibe Coding Prompt Real Output & Take Screenshot', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Go to homepage
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 2. Load demo fixture
  await page.click('button:has-text("Load Demo Test Fixture")');
  await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 15000 });

  // 3. Go to Screen 3
  await page.click('button:has-text("Proceed to Screen 3")');
  await expect(page.locator('text=SCREEN 3 — CHANGE REQUEST')).toBeVisible({ timeout: 5000 });

  // 4. Fill user prompt
  const userPrompt = "mujhe cv me update krana hai ki may 2025 se vide coding, ai tools ka use kr rhe hai jaise antigravity, claude, chatgpt, perpelexity, z.ai, github , vercel, firbase, supabase, etc bahu sare tools . bahut se product banaya hu like jyotish connect, turtleping, mausam veda, kharcha book app, gharmantra app, smartscanner app , etc. sab live hai sara scracth se ai tool ki help se banaya hu aisa cv banana hai lage kuch kaam kiya hu";

  await page.locator('textarea').first().fill(userPrompt);

  // 5. Click Formulate Change Plan
  await page.click('button:has-text("Classify Intent & Formulate Change Plan")');

  // 6. Verify Screen 4
  await expect(page.locator('text=Screen 4 — Structured Change Plan')).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'test-results/screen4_user_plan.png', fullPage: true });

  // 7. Click Approve & Apply Changes
  await page.click('button:has-text("Approve & Apply Changes")');

  // 8. Wait for Screen 6 Quality Control
  await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 20000 });

  // 9. Go to Screen 7 Side-by-Side Comparison
  await page.click('button:has-text("View Side-by-Side Comparison")');
  await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible({ timeout: 10000 });

  // Capture Screen 7 Preview
  await page.screenshot({ path: 'test-results/screen7_side_by_side.png', fullPage: true });

  // 10. Go to Screen 8 Final Production Export
  await page.click('button:has-text("Proceed to Screen 8")');
  await expect(page.locator('text=Screen 8 — CV Successfully Updated & Verified')).toBeVisible({ timeout: 10000 });

  // Capture Screen 8 Final Output
  await page.screenshot({ path: 'test-results/screen8_final_output.png', fullPage: true });
});
