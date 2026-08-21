import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function run() {
  console.log("Starting vite preview...");
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore'
  });

  // Wait 3 seconds for server
  await new Promise(res => setTimeout(res, 3000));

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  console.log("Navigating to app...");
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(1000);

  // Click Load Sample Demo CV
  console.log("Loading demo CV...");
  await page.click('button:has-text("Load Sample Demo CV")');
  await page.waitForTimeout(600);

  // Click Proceed to Screen 3
  await page.click('button:has-text("Proceed to Screen 3")');
  await page.waitForTimeout(600);

  // Fill Prompt
  console.log("Filling user vibe coding prompt...");
  const prompt = "may 2025 se vide coding, ai tools ka use kr rhe hai jaise antigravity, claude, chatgpt, perpelexity, z.ai, github , vercel, firbase, supabase, etc bahu sare tools . bahut se product banaya hu like jyotish connect, turtleping, mausam veda, kharcha book app, gharmantra app, smartscanner app , etc. sab live hai sara scracth se ai tool ki help se banaya hu";
  await page.fill('textarea', prompt);
  await page.waitForTimeout(400);

  // Click Formulate Change Plan
  await page.click('button:has-text("Formulate Change Plan")');
  await page.waitForTimeout(1000);

  // Screen 4: Approve & Execute Change Plan
  console.log("Approving plan on Screen 4...");
  await page.click('button:has-text("Approve & Apply Changes")');
  await page.waitForTimeout(4000);

  // Screen 6: Click View Side-by-Side Comparison (Screen 7)
  console.log("Advancing from Screen 6 to Screen 7...");
  const s7Btn = page.locator('button:has-text("View Side-by-Side Comparison (Screen 7)")');
  if (await s7Btn.isVisible()) {
    await s7Btn.click();
    await page.waitForTimeout(2000);
  }

  // Take screenshot of preview-resume-updated
  console.log("Taking screenshots...");
  const updatedResume = page.locator('#preview-resume-updated');
  if (await updatedResume.isVisible()) {
    await updatedResume.screenshot({
      path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/rohit_updated_hubahu_preview.png'
    });
    console.log("Saved updated resume screenshot!");
  }

  await page.screenshot({
    path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/rohit_screen7_side_by_side.png',
    fullPage: true
  });
  console.log("Saved full studio screen 7 screenshot!");

  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
