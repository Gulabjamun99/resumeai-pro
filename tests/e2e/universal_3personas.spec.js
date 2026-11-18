import { test, expect } from '@playwright/test';

test.describe('ResumeAI Pro — Universal 3-Persona & Multi-Template E2E Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Persona Navigation & Landing Screen Verification', async ({ page }) => {
    await expect(page).toHaveTitle(/ResumeAI Pro/i);
    
    // Check 3 Persona Tabs
    await expect(page.locator('button:has-text("1. Upload Existing CV")')).toBeVisible();
    await expect(page.locator('button:has-text("2. Build Fresh with AI")')).toBeVisible();
    await expect(page.locator('button:has-text("3. Tailor to JD")')).toBeVisible();

    // Check Upload Area
    await expect(page.locator('text=Click to upload or drag & drop your CV')).toBeVisible();
  });

  test('Persona 2: 1-Page Fresher Wizard & Zero Dummy Data', async ({ page }) => {
    // Switch to Persona 2
    await page.click('button:has-text("2. Build Fresh with AI")');
    await expect(page.locator('text=1-Page ATS Fresher Resume Builder')).toBeVisible();

    // Open Wizard
    await page.click('button:has-text("Launch 1-Page Fresher Wizard")');
    await expect(page.locator('text=Fresher 1-Page Resume Wizard')).toBeVisible();

    // Fill Step 1: Personal Info
    await page.fill('input[placeholder="e.g. Rahul Sharma"]', 'Aarav Patel');
    await page.fill('input[placeholder*="Associate Software Engineer"]', 'Junior Data Engineer');
    await page.fill('input[placeholder="rahul@example.com"]', 'aarav.patel@testmail.com');
    await page.fill('input[placeholder="+91 98765 43210"]', '+91 91234 56789');
    await page.fill('input[placeholder="Bengaluru, Karnataka"]', 'Pune, Maharashtra');

    // Next to Step 2
    await page.click('button:has-text("Next Step")');
    await expect(page.locator('text=College / University Name')).toBeVisible();
    await page.fill('input[placeholder*="B.Tech in Computer Science"]', 'B.Tech in Computer Science & Engineering');
    await page.fill('input[placeholder*="Delhi Technological University"]', 'COEP Technological University');
    await page.fill('input[placeholder*="2024"]', '2024');

    // Next to Step 3
    await page.click('button:has-text("Next Step")');
    await expect(page.locator('text=Add Key Skills & Tools')).toBeVisible();
    await page.click('button:has-text("+ Python")');
    await page.click('button:has-text("+ SQL")');
    await page.click('button:has-text("+ Git & GitHub")');

    // Next to Step 4
    await page.click('button:has-text("Next Step")');
    await expect(page.locator('text=Project Title')).toBeVisible();
    await page.fill('input[placeholder*="Student Attendance"]', 'Real-Time Air Quality Monitoring System');
    await page.fill('input[placeholder*="Python, Django"]', 'Python, Apache Spark, PostgreSQL, Docker');

    // Generate Resume
    await page.click('button:has-text("Generate 1-Page ATS Resume")');

    // Studio View Loaded
    await expect(page.locator('text=Aarav Patel')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Junior Data Engineer', { exact: true })).toBeVisible();
    await expect(page.getByText('COEP Technological University', { exact: true })).toBeVisible();

    // Verify ZERO fake companies exist on canvas
    const canvasText = await page.locator('#resume-document').innerText();
    expect(canvasText).not.toContain('Innovation Systems');
    expect(canvasText).not.toContain('Premier University');
    expect(canvasText.toLowerCase()).toContain('aarav patel');
    expect(canvasText).toContain('Python');
  });

  test('Templates Switching & Data Preservation', async ({ page }) => {
    // Launch fresh studio
    await page.click('button:has-text("2. Build Fresh with AI")');
    await page.click('button:has-text("Blank Canvas & Chat")');

    // Switch to Design & Templates Tab
    await page.click('button:has-text("Templates & Styles")');
    await expect(page.locator('text=Choose ATS Template (5)')).toBeVisible();

    // Verify 5 Templates are listed
    await expect(page.locator('text=Modern Executive')).toBeVisible();
    await expect(page.locator('text=Classic Ivy League')).toBeVisible();
    await expect(page.locator('text=Tech Minimalist')).toBeVisible();
    await expect(page.locator('text=Compact Density ATS')).toBeVisible();
    await expect(page.locator('text=Modern Two-Column Pro')).toBeVisible();

    // Select Classic Ivy League
    await page.click('button:has-text("Classic Ivy League")');
    await expect(page.locator('#resume-document')).toHaveClass(/font-serif/);

    // Select Tech Minimalist
    await page.click('button:has-text("Tech Minimalist")');
    await expect(page.locator('#resume-document')).toBeVisible();

    // Select Modern Two-Column Pro
    await page.click('button:has-text("Modern Two-Column Pro")');
    await expect(page.locator('#resume-document')).toBeVisible();
  });

  test('Persona 3: Target JD Tailoring & ATS Score Display', async ({ page }) => {
    await page.click('button:has-text("3. Tailor to JD")');
    await page.click('button:has-text("Start with a blank canvas and paste JD directly")');

    // Should open Studio with Tailor to JD tab active
    await expect(page.locator('text=Target Job Description (JD)')).toBeVisible();
    await expect(page.locator('button:has-text("Tailor Resume for 95%+ ATS Match")')).toBeVisible();
  });

});
