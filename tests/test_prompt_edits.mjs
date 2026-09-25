import { chromium } from 'playwright';

async function testPrompt(prompt) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

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

  // Now in Step 1 Interactive Studio
  console.log(`Testing prompt: "${prompt}"`);
  const input = page.locator('input[placeholder*="Nathcorp delete karo"]');
  await input.fill(prompt);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  const state = await page.evaluate(() => {
    const canvas = document.getElementById('cockpit-preview-canvas');
    const textContent = canvas?.innerText || '';
    const chatItems = Array.from(document.querySelectorAll('.p-3.rounded-xl')).map(el => el.innerText);
    return {
      chatItems: chatItems.slice(-2),
      hasNathcorp: textContent.includes('Nathcorp'),
      hasPulse: textContent.includes('Pulse Solutions'),
      hasRahul: textContent.includes('Rahul'),
      hasDocker: textContent.includes('Docker'),
      hasMumbai: textContent.includes('Mumbai'),
      titleText: canvas?.querySelector('header')?.innerText || ''
    };
  });

  console.log("Result for prompt:", prompt, state);
  await browser.close();
}

async function runAll() {
  await testPrompt('Nathcorp delete karo');
  await testPrompt('Name change karke Rahul Kumar kar do');
  await testPrompt('Skills me Docker, Kubernetes add karo');
  await testPrompt('location Bangalore ko Mumbai kar do');
}

runAll().catch(console.error);
