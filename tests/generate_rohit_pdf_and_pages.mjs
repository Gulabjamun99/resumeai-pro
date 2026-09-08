import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

async function run() {
  console.log("Starting vite preview...");
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: 'D:\\ohara works\\ResumeAI_Pro\\resume_ai_clean',
    shell: true,
    stdio: 'ignore'
  });

  // Wait 3 seconds for server
  await new Promise(res => setTimeout(res, 3000));

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

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

  // Screen 4: Approve & Apply Changes
  console.log("Approving plan on Screen 4...");
  await page.click('button:has-text("Approve & Apply Changes")');
  await page.waitForTimeout(4000);

  // Screen 6: Advance to Screen 7
  console.log("Advancing from Screen 6 to Screen 7...");
  const s7Btn = page.locator('button:has-text("View Side-by-Side Comparison (Screen 7)")');
  if (await s7Btn.isVisible()) {
    await s7Btn.click();
    await page.waitForTimeout(2000);
  }

  // Go to Screen 8 Download
  console.log("Advancing to Screen 8 Download...");
  const s8Btn = page.locator('button:has-text("Proceed to Final Download (Screen 8)")');
  if (await s8Btn.isVisible()) {
    await s8Btn.click();
    await page.waitForTimeout(1500);
  }

  // Capture Screen 8 preview
  const previewResumeEl = page.locator('#preview-resume-screen8');
  if (await previewResumeEl.isVisible()) {
    await previewResumeEl.screenshot({
      path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/rohit_pdf_preview_screen8.png'
    });
    console.log("Saved screen 8 preview screenshot!");
  }

  // Also take full page screenshot of Screen 8
  await page.screenshot({
    path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/rohit_screen8_download_studio.png',
    fullPage: true
  });
  console.log("Saved screen 8 full studio view!");

  // Generate real PDF of the resume container
  console.log("Generating clean printable PDF view...");
  // Isolate just the resume document on the page
  await page.evaluate(() => {
    const resumeEl = document.querySelector('#preview-resume-screen8') || document.querySelector('#preview-resume-updated') || document.querySelector('[id*="resume"]');
    if (resumeEl) {
      document.body.innerHTML = '';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#ffffff';
      document.body.appendChild(resumeEl);
      resumeEl.style.margin = '0 auto';
      resumeEl.style.boxShadow = 'none';
    }
  });

  await page.waitForTimeout(500);

  // Take high-res screenshot of the isolated document
  await page.screenshot({
    path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/rohit_final_pdf_page_view.png',
    fullPage: true
  });

  // Export actual vector PDF file
  await page.pdf({
    path: 'C:/Users/user/.gemini/antigravity/brain/c8d056f5-b7c1-4e9b-a200-90f5c5ee8595/Rohit_Kumar_AI_Developer_ATS_Resume.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
  });
  console.log("Saved Rohit_Kumar_AI_Developer_ATS_Resume.pdf!");

  await browser.close();
  server.kill();
  console.log("Done!");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
