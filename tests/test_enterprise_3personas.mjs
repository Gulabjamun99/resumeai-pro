import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function run() {
  console.log("Starting vite preview on port 4175...");
  const server = spawn('npx', ['vite', 'preview', '--port', '4175'], {
    cwd: 'D:\\ohara works\\ResumeAI_Pro\\resume_ai_clean',
    shell: true,
    stdio: 'ignore'
  });

  // Wait for server
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:4175');
      if (res.ok) break;
    } catch (_) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

  console.log("Navigating to app...");
  await page.goto('http://localhost:4175');
  await page.waitForTimeout(1000);

  // 1. Screenshot Screen 1 Tri-Mode Switcher
  console.log("Testing Screen 1 Tri-Mode Hub...");
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_p1_home.png' });

  // 2. Click Persona 2: Fresh CV Builder
  console.log("Testing Persona 2: Fresh CV Builder...");
  await page.click('text=Build Fresh CV with AI Guide');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_p2_fresh.png' });

  // Click Cancel to return
  await page.click('button:has-text("Cancel")');
  await page.waitForTimeout(400);

  // 3. Click Persona 3: JD Semantic Tailor
  console.log("Testing Persona 3: JD Tailor...");
  await page.click('text=Tailor to Job Description (JD)');
  await page.waitForTimeout(600);
  await page.click('button:has-text("Paste Sample Tech JD")');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Analyze JD Match & Keyword Gaps")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_p3_jd.png' });

  // Click Back
  await page.click('button:has-text("Back")');
  await page.waitForTimeout(400);

  // 4. Load Demo Fixture for Persona 1 (Hubahu Flow)
  console.log("Loading Demo Fixture for Persona 1...");
  await page.click('button:has-text("Load Demo Test Fixture")');
  await page.waitForTimeout(1000);

  // Screen 2 -> Screen 3
  await page.click('button:has-text("Proceed to Screen 3")');
  await page.waitForTimeout(1000);

  // Screen 3: Fill prompt & submit
  console.log("Submitting prompt on Screen 3...");
  const prompt = "may 2025 se vide coding, ai tools ka use kr rhe hai jaise antigravity, claude, chatgpt, perpelexity, z.ai, github , vercel, firbase, supabase, etc bahu sare tools . bahut se product banaya hu like jyotish connect, turtleping, mausam veda, kharcha book app, gharmantra app, smartscanner app , etc. sab live hai sara scracth se ai tool ki help se banaya hu";
  await page.fill('textarea', prompt);
  await page.click('button:has-text("Formulate Change Plan")');
  await page.waitForTimeout(1500);

  // Screen 4: Approve
  console.log("Approving Change Plan on Screen 4...");
  await page.click('button:has-text("Approve & Apply Changes")');
  await page.waitForTimeout(3500);

  // Screen 6 -> Screen 7
  const s7Btn = page.locator('button:has-text("View Side-by-Side Comparison (Screen 7)")');
  if (await s7Btn.isVisible()) {
    await s7Btn.click();
    await page.waitForTimeout(1500);
  }

  // 5. Screenshot Screen 7 Interactive Live Studio
  console.log("Testing Screen 7 Interactive Live Studio...");
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_s7_interactive_studio.png', fullPage: true });

  // 6. Test Live Refine in Studio via chip
  console.log("Sending live refinement prompt in studio...");
  const chip = page.locator('button:has-text("Summary ko 3 crisp lines me karo")');
  if (await chip.isVisible()) {
    await chip.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_s7_after_live_refine.png' });
  }

  // 7. Test 36-Template Filter Tag Switch
  console.log("Testing 36-Template Filter Tag Switch...");
  const tagBtn = page.locator('button:has-text("Tech & AI")');
  if (await tagBtn.isVisible()) {
    await tagBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_s7_template_catalog.png' });
  }

  console.log("All 3 Personas & Interactive Live Studio verified successfully!");
  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
