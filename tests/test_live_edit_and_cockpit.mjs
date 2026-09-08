import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function run() {
  console.log("Starting vite preview on port 4176...");
  const server = spawn('npx', ['vite', 'preview', '--port', '4176'], {
    cwd: 'D:\\ohara works\\ResumeAI_Pro\\resume_ai_clean',
    shell: true,
    stdio: 'ignore'
  });

  // Wait for server
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:4176');
      if (res.ok) break;
    } catch (_) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

  console.log("Navigating to app...");
  await page.goto('http://localhost:4176');
  await page.waitForTimeout(1000);

  // Load Demo Fixture
  console.log("Loading Demo Fixture...");
  await page.click('button:has-text("Load Demo Test Fixture")');
  await page.waitForTimeout(800);

  // Screen 2 -> Screen 3
  await page.click('button:has-text("Proceed to Screen 3")');
  await page.waitForTimeout(800);

  // Screen 3: Submit prompt
  console.log("Submitting initial prompt on Screen 3...");
  await page.fill('textarea', 'may 2025 se vide coding aur AI tools use karke 6 live products deploy kiye hain.');
  await page.click('button:has-text("Formulate Change Plan")');
  await page.waitForTimeout(1500);

  // Screen 4: Approve
  await page.click('button:has-text("Approve & Apply Changes")');
  await page.waitForTimeout(3000);

  // Screen 6 -> Screen 7
  const s7Btn = page.locator('button:has-text("View Side-by-Side Comparison (Screen 7)")');
  if (await s7Btn.isVisible()) {
    await s7Btn.click();
    await page.waitForTimeout(1500);
  }

  // 1. Screenshot Screen 7 Cockpit View (CV Left, Controls Right)
  console.log("Capturing Screen 7 Cockpit Studio View...");
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_cockpit_view.png' });

  // 2. Test Deleting Nathcorp via 1-Click chip
  console.log("Testing Nathcorp Deletion via prompt...");
  const delChip = page.locator('button:has-text("Nathcorp delete karo")');
  if (await delChip.isVisible()) {
    await delChip.click();
    await page.waitForTimeout(2000);
  }

  // Check if Nathcorp is now gone from the canvas text
  const canvasText = await page.locator('#cockpit-preview-canvas').innerText();
  const hasNathcorp = canvasText.includes('Nathcorp');
  console.log("Is Nathcorp present in CV after deletion?:", hasNathcorp);
  if (hasNathcorp) {
    throw new Error("Assertion failed: Nathcorp was expected to be deleted from CV, but was still present in the canvas!");
  }

  // Screenshot after deletion
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_after_nathcorp_delete.png' });

  // 3. Switch to Templates Tab on the Right Side
  console.log("Switching to 36 Modern Templates tab on right side...");
  await page.click('button:has-text("36 Modern Templates")');
  await page.waitForTimeout(600);

  // Click Tech & AI Developer template
  const techTpl = page.locator('text=Tech & AI Developer Pro');
  if (await techTpl.isVisible()) {
    console.log("Selecting Tech & AI Developer template in right pane...");
    await techTpl.click();
    await page.waitForTimeout(1000);
  }

  // Screenshot after template switch
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_after_template_switch.png' });

  // 4. Test Screen 8 Download Preview Alignment
  console.log("Proceeding to Screen 8 Download Center...");
  await page.click('button:has-text("Proceed to Final Download (Screen 8)")');
  await page.waitForTimeout(1500);

  // Screenshot Screen 8
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_s8_alignment_check.png' });

  console.log("Cockpit Studio & Live Edit test completed successfully!");
  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
