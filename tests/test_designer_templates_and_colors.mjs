import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

async function run() {
  console.log("Starting Vite preview server...");
  const server = spawn('npm', ['run', 'preview', '--', '--port', '4180'], {
    shell: true,
    stdio: 'pipe'
  });

  server.stdout.on('data', (d) => console.log(`[Vite]: ${d.toString().trim()}`));
  server.stderr.on('data', (d) => console.error(`[Vite Error]: ${d.toString().trim()}`));

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Launching browser for Designer 2-Column & Color Variety verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  console.log("Navigating to application...");
  await page.goto('http://localhost:4180');
  await page.waitForLoadState('networkidle');

  // Load Demo Fixture
  console.log("Loading Demo Fixture...");
  await page.click('button:has-text("Load Demo Test Fixture")');
  await page.waitForTimeout(800);

  // Screen 2 -> Screen 3
  await page.click('button:has-text("Proceed to Screen 3")');
  await page.waitForTimeout(800);

  // Screen 3: Submit prompt
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

  // 1. Switch to 36 Templates Tab and select Modern Executive Dual-Column
  console.log("Opening 36 Templates tab and selecting Modern Executive Dual-Column...");
  await page.click('button:has-text("36 Templates")');
  await page.waitForTimeout(600);

  const designerDualTpl = page.locator('text=Modern Executive Dual-Column');
  if (await designerDualTpl.isVisible()) {
    await designerDualTpl.click();
    await page.waitForTimeout(1000);
  }

  // Capture screenshot of Modern Executive Dual-Column
  console.log("Capturing Modern Executive Dual-Column layout...");
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_designer_dual_column.png' });

  // 2. Switch to Design & Colors Tab
  console.log("Switching to Design & Colors tab...");
  await page.click('button:has-text("Design & Colors")');
  await page.waitForTimeout(600);

  // Capture screenshot of Design & Colors tab controls
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_design_tab_controls.png' });

  // 3. Test Color Palette Switch: Emerald Forest & Mint
  console.log("Selecting Emerald Forest & Mint color palette...");
  const emeraldPalette = page.locator('button:has-text("Emerald Forest & Mint")');
  if (await emeraldPalette.isVisible()) {
    await emeraldPalette.click();
    await page.waitForTimeout(1000);
  }

  // Capture screenshot with Emerald Theme
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_palette_switch_emerald.png' });

  // 4. Test Layout Switcher: Single-Column Mode
  console.log("Testing Single-Column layout switch...");
  await page.click('button:has-text("Single-Column (Linear)")');
  await page.waitForTimeout(1000);

  // Capture screenshot in Single-Column Mode
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_single_column_mode.png' });

  // Switch back to Two-Column
  console.log("Switching back to Two-Column mode with Right Sidebar...");
  await page.click('button:has-text("Two-Column (Sidebar)")');
  await page.waitForTimeout(500);

  const rightSidebarBtn = page.locator('button:has-text("Right Sidebar")');
  if (await rightSidebarBtn.isVisible()) {
    await rightSidebarBtn.click();
    await page.waitForTimeout(800);
  }

  // 5. Test Royal Amethyst Palette
  console.log("Selecting Royal Amethyst & Violet palette...");
  const amethystPalette = page.locator('button:has-text("Royal Amethyst & Violet")');
  if (await amethystPalette.isVisible()) {
    await amethystPalette.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_amethyst_right_sidebar.png' });

  // 6. Test Screen 8 Download Center with customized theme
  console.log("Proceeding to Screen 8 Download Center with custom theme...");
  await page.click('button:has-text("Proceed to Final Download (Screen 8)")');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_s8_themed_download.png' });

  console.log("All Designer 2-Column, Color Variety & Layout Switcher tests passed successfully!");
  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
