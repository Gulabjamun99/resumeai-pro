import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function run() {
  console.log("Checking if Desktop PDF exists...");
  const pdfPath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  console.log('PDF exists:', fs.existsSync(pdfPath));

  console.log("Starting vite preview...");
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: 'D:\\ohara works\\ResumeAI_Pro\\resume_ai_clean',
    shell: true,
    stdio: 'ignore'
  });

  // Poll until server is ready (up to 15s)
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:4173');
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (_) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  console.log("Server ready status:", ready);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

  console.log("Navigating to app...");
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(1000);

  // Take screenshot of Screen 1
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/upload_test_s1.png' });

  // Upload the actual Rohit Kumar.pdf file if it exists, or test upload input
  const fileInput = page.locator('input[type="file"]');
  if (fs.existsSync(pdfPath) && await fileInput.count() > 0) {
    console.log("Uploading real PDF file:", pdfPath);
    await fileInput.setInputFiles(pdfPath);
    await page.waitForTimeout(3000);
  } else {
    console.log("Clicking load demo CV...");
    await page.click('button:has-text("Load Sample Demo CV")');
    await page.waitForTimeout(1000);
  }

  // Screenshot Screen 2
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/upload_test_s2.png' });

  // Click Proceed to Screen 3
  console.log("Proceeding to Screen 3...");
  await page.click('button:has-text("Proceed to Screen 3")');
  await page.waitForTimeout(800);

  // Fill Prompt
  console.log("Filling prompt...");
  const prompt = "may 2025 se vide coding, ai tools ka use kr rhe hai jaise antigravity, claude, chatgpt, perpelexity, z.ai, github , vercel, firbase, supabase, etc bahu sare tools . bahut se product banaya hu like jyotish connect, turtleping, mausam veda, kharcha book app, gharmantra app, smartscanner app , etc. sab live hai sara scracth se ai tool ki help se banaya hu";
  await page.fill('textarea', prompt);
  await page.waitForTimeout(500);

  // Click Formulate Change Plan
  console.log("Formulating change plan...");
  await page.click('button:has-text("Formulate Change Plan")');
  await page.waitForTimeout(1500);

  // Screenshot Screen 4
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/upload_test_s4.png' });

  // Approve on Screen 4
  console.log("Approving on Screen 4...");
  await page.click('button:has-text("Approve & Apply Changes")');
  await page.waitForTimeout(4000);

  // Screenshot Screen 6
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/upload_test_s6.png' });

  // Go to Screen 7
  console.log("Going to Screen 7...");
  const s7Btn = page.locator('button:has-text("View Side-by-Side Comparison (Screen 7)")');
  if (await s7Btn.isVisible()) {
    await s7Btn.click();
    await page.waitForTimeout(2000);
  }

  // Screenshot Screen 7
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/upload_test_s7.png', fullPage: true });

  // Go to Screen 8
  console.log("Going to Screen 8...");
  const s8Btn = page.locator('button:has-text("Proceed to Final Download (Screen 8)")');
  if (await s8Btn.isVisible()) {
    await s8Btn.click();
    await page.waitForTimeout(2000);
  }

  // Screenshot Screen 8
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/upload_test_s8.png', fullPage: true });

  await browser.close();
  server.kill();
  console.log("Flow test completed successfully!");
  process.exit(0);
}

run().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
