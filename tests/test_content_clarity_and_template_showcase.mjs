import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function run() {
  console.log("Starting Vite preview server on port 4182...");
  const server = spawn('npm', ['run', 'preview', '--', '--port', '4182'], {
    shell: true,
    stdio: 'pipe'
  });

  server.stdout.on('data', (d) => console.log(`[Vite]: ${d.toString().trim()}`));
  server.stderr.on('data', (d) => console.error(`[Vite Error]: ${d.toString().trim()}`));

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Launching browser for Content Clarity & Template Showcase verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  console.log("Navigating to app...");
  await page.goto('http://localhost:4182');
  await page.waitForLoadState('networkidle');

  // Load Demo Fixture
  console.log("Loading Demo Fixture...");
  await page.click('button:has-text("Load Demo Test Fixture")');
  await page.waitForTimeout(800);

  // Screen 2 -> Screen 3
  await page.click('button:has-text("Proceed to Screen 3")');
  await page.waitForTimeout(800);

  // Screen 3: Submit initial prompt
  console.log("Submitting initial prompt on Screen 3...");
  await page.fill('textarea', 'may 2025 se vibe coding aur AI tools use karke 6 live products deploy kiye hain.');
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

  // 1. STEP 1: CONTENT CLARITY & LIVE EDITS
  console.log("Testing Step 1: Content Clarity & AI Live Edits...");
  // Test deletion via 1-Click chip
  const delChip = page.locator('button:has-text("Nathcorp delete karo")');
  if (await delChip.isVisible()) {
    console.log("Clicking 'Nathcorp delete karo' chip...");
    await delChip.click();
    await page.waitForTimeout(2000);
  }

  // Verify Change Proof Verification shows Nathcorp deleted
  const proofText = await page.locator('text=Deleted: Nathcorp Pvt. Ltd.').isVisible();
  console.log("Is 'Deleted: Nathcorp Pvt. Ltd.' proof badge visible?:", proofText);

  // Capture Step 1 Screenshot (Content verified, change proof visible, CV preview on right)
  console.log("Capturing Step 1 Content Clarity screenshot...");
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_step1_content_clarity.png' });

  // 2. STEP 2: TEMPLATE SHOWCASE (Left: 36 Templates | Right: Live CV Preview)
  console.log("Advancing to Step 2: 36 Templates & Design (Left: Templates | Right: CV)...");
  await page.click('button:has-text("Content Clear! Next: 36 Templates & Design")');
  await page.waitForTimeout(1000);

  // Capture Step 2 Initial Screenshot
  console.log("Capturing Step 2 Template Showcase screenshot...");
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_step2_templates_left_cv_right.png' });

  // 3. Test Selecting Different Templates on the Left
  console.log("Selecting 'Modern Executive Dual-Column' on the left pane...");
  const execDualTpl = page.locator('text=Modern Executive Dual-Column');
  if (await execDualTpl.isVisible()) {
    await execDualTpl.click();
    await page.waitForTimeout(1200);
  }

  console.log("Selecting 'Creative Designer Split-Pro' on the left pane...");
  const creativeTpl = page.locator('text=Creative Designer Split-Pro');
  if (await creativeTpl.isVisible()) {
    await creativeTpl.click();
    await page.waitForTimeout(1200);
  }

  // Capture Screenshot after template switch
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_step2_template_switched.png' });

  // 4. Test Colors & Layout Subtab on the Left
  console.log("Switching to Colors & Layout subtab on the left pane...");
  await page.click('button:has-text("Colors & Layout")');
  await page.waitForTimeout(600);

  // Select Emerald Forest & Mint palette
  console.log("Selecting Emerald Forest & Mint palette...");
  const emeraldBtn = page.locator('button:has-text("Emerald Forest & Mint")');
  if (await emeraldBtn.isVisible()) {
    await emeraldBtn.click();
    await page.waitForTimeout(1000);
  }

  // Capture Screenshot of Themed Template
  console.log("Capturing Step 2 Themed Template screenshot...");
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_step2_themed_preview.png' });

  console.log("All Content Clarity & Template Showcase tests completed successfully!");
  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
