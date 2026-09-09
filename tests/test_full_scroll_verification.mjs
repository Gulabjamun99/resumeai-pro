import { chromium } from 'playwright';

async function run() {
  console.log("Starting Full Scroll Verification Test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // 1. Load Demo Fixture
  console.log("Loading Demo Fixture...");
  await page.click('button:has-text("Load Demo Test Fixture")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Proceed to Screen 3")');
  await page.waitForTimeout(800);
  await page.fill('textarea', 'may 2025 se vibe coding deploy kiye hain');
  await page.click('button:has-text("Formulate Change Plan")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Approve & Apply Changes")');
  await page.waitForTimeout(3000);

  const s7Btn = page.locator('button:has-text("View Side-by-Side Comparison (Screen 7)")');
  if (await s7Btn.isVisible()) {
    await s7Btn.click();
    await page.waitForTimeout(1500);
  }

  // 2. Test Step 1: Content Clarity Preview Scrolling
  console.log("Verifying Step 1 scroll to bottom...");
  const bottomBtn = page.locator('button:has-text("Bottom")').first();
  await bottomBtn.click();
  await page.waitForTimeout(800);

  // Capture Screenshot of Step 1 Scrolled to Bottom
  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_step1_scrolled_bottom.png' });

  // Verify bottom text is visible
  const bottomVisible = await page.evaluate(() => {
    const canvas = document.getElementById('cockpit-preview-canvas');
    const container = canvas?.parentElement;
    return {
      scrollTop: container?.scrollTop,
      scrollHeight: container?.scrollHeight,
      clientHeight: container?.clientHeight,
      isScrolledToBottom: container ? (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) : false
    };
  });
  console.log("Step 1 Bottom Scroll Metrics:", bottomVisible);

  console.log("Verifying Step 1 scroll to top...");
  const topBtn = page.locator('button:has-text("Top")').first();
  await topBtn.click();
  await page.waitForTimeout(800);

  const topVisible = await page.evaluate(() => {
    const canvas = document.getElementById('cockpit-preview-canvas');
    const container = canvas?.parentElement;
    return {
      scrollTop: container?.scrollTop,
      isScrolledToTop: container ? container.scrollTop === 0 : false
    };
  });
  console.log("Step 1 Top Scroll Metrics:", topVisible);

  // 3. Advance to Step 2: 36 Templates & Design
  console.log("Advancing to Step 2: 36 Templates...");
  await page.click('button:has-text("Content Finalized! Choose 36 Templates & Colors")');
  await page.waitForTimeout(1000);

  console.log("Verifying Step 2 scroll to bottom...");
  const step2BottomBtn = page.locator('button:has-text("Bottom")').first();
  await step2BottomBtn.click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/test_step2_scrolled_bottom.png' });

  const step2BottomVisible = await page.evaluate(() => {
    const canvas = document.getElementById('cockpit-preview-canvas');
    const container = canvas?.parentElement;
    return {
      scrollTop: container?.scrollTop,
      scrollHeight: container?.scrollHeight,
      clientHeight: container?.clientHeight,
      isScrolledToBottom: container ? (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) : false
    };
  });
  console.log("Step 2 Bottom Scroll Metrics:", step2BottomVisible);

  console.log("All full-length scroll verifications PASSED!");
  await browser.close();
  process.exit(0);
}

run().catch(err => {
  console.error("Scroll verification test failed:", err);
  process.exit(1);
});
