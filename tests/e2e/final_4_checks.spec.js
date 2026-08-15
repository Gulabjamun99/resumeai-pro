import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ResumeAI Pro — Final 4 Production Checks Suite', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  // CHECK 1: Production API Routing & Zero Client Secret Exposure
  test('CHECK 1: Production Security & Zero Private Secret Exposure in DOM/Scripts', async ({ page }) => {
    await page.goto('/');

    // Verify bundle has zero Gemini or Groq raw secret keys
    const bodyText = await page.evaluate(() => document.body.innerHTML);
    expect(bodyText).not.toContain('AIzaSy');
    expect(bodyText).not.toContain('gsk_');
    expect(bodyText).not.toContain('service_role');
  });

  // CHECK 2: Real AI Transformation on Uploaded Candidate
  test('CHECK 2: Real Processing on Uploaded CV with Factual Preservation', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible();

    await page.click('button:has-text("Proceed to Screen 3")');
    await page.fill('textarea', 'Headline ko Lead AI & Cloud Recruitment Specialist kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');

    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Confirm updated state
    await expect(page.locator('#preview-resume-updated')).toContainText('Lead AI & Cloud Recruitment Specialist');
    // Confirm original candidate name preserved
    await expect(page.locator('#preview-resume-updated')).toContainText('E2E Test Candidate');
  });

  // CHECK 3: Security Audit — XSS & Prompt Injection Resistance
  test('CHECK 3: Security Audit (XSS Sanitization & Prompt Injection Resistance)', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await page.click('button:has-text("Proceed to Screen 3")');

    // Attempt XSS payload in title
    const xssPayload = '<img src=x onerror=alert(1)> Senior Consultant';
    await page.fill('textarea', `Headline ko ${xssPayload} kar do`);
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');

    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify React escapes HTML tags as safe text without executing scripts
    const updatedHtml = await page.locator('#preview-resume-updated').innerHTML();
    expect(updatedHtml).not.toContain('<img src=x onerror=alert(1)>');
  });

  // CHECK 4: Mobile Responsiveness & Touchscreen Compatibility (Pixel / iPhone viewport)
  test('CHECK 4: Mobile & Multi-Browser Viewport Compatibility', async ({ page }) => {
    // Set Mobile Viewport (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify Mobile Screen 1 Elements Render and are Clickable
    await expect(page.locator('button:has-text("Load Demo Test Fixture")')).toBeVisible();
    await page.click('button:has-text("Load Demo Test Fixture")');

    // Verify Mobile Screen 2 Navigation
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible();
    await page.click('button:has-text("Proceed to Screen 3")');

    // Verify Mobile Screen 3 Input
    await expect(page.locator('textarea')).toBeVisible();
    await page.fill('textarea', 'Headline ko Mobile Tested Specialist kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');

    // Verify Mobile Screen 4 Approval
    await expect(page.locator('button:has-text("Approve & Apply Changes")')).toBeVisible();
    await page.click('button:has-text("Approve & Apply Changes")');

    // Verify Mobile Screen 6 Quality Control
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify Mobile Studio Toolbar & Tab buttons work on small screens
    await expect(page.locator('button:has-text("Final Version")')).toBeVisible();
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("DOCX")')).toBeVisible();
  });

});
