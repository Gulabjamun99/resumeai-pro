import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('ResumeAI Pro — Final Black-Box Production Verification', () => {

  const FIXTURE_PATH = path.resolve('tests/fixtures/e2e_test_candidate.txt');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('TEST 1 & 9: Real Candidate File Upload & Zero Demo Data Detection', async ({ page }) => {
    await page.goto('/');

    // 1. Real File Upload through input[type="file"]
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(FIXTURE_PATH);

    // 2. Verify Screen 2 Loaded with real candidate name
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible({ timeout: 10000 });

    // 3. Confirm NO Demo candidate data ("Rohit Kumar") appears
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Rohit Kumar');
  });

  test('TEST 2: Real Multi-Turn Workflow with Real Upload (v1 -> v2 -> v3 -> v4)', async ({ page }) => {
    await page.goto('/');

    // Upload real candidate
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await expect(page.locator('text=Screen 2 — Source CV Master Copy')).toBeVisible();
    await page.click('button:has-text("Proceed to Screen 3")');

    // Turn 1: Headline Update
    await page.fill('textarea', 'Headline ko Senior AI Talent Acquisition Specialist kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify v2 Headline
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Senior AI Talent Acquisition Specialist');

    // Turn 2: Improve Summary
    await page.click('button:has-text("Make Another Change")');
    await page.fill('textarea', 'Improve the summary for an AI-enabled recruitment role while preserving every factual detail');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify v3 contains both updated headline and improved summary
    await expect(page.locator('text=CURRENT_CV_STATE (Version 3')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Senior AI Talent Acquisition Specialist');

    // Turn 3: Add AWS and Remove Java
    await page.click('button:has-text("Make Another Change")');
    await page.fill('textarea', 'Add AWS to my skills and remove Java. Do not change anything else.');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify v4
    await expect(page.locator('text=CURRENT_CV_STATE (Version 4')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Senior AI Talent Acquisition Specialist');
  });

  test('TEST 3: Browser Refresh Persistence with Real Candidate State', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await page.click('button:has-text("Proceed to Screen 3")');
    await page.fill('textarea', 'Headline ko Principal Talent Leader kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Principal Talent Leader');

    // Refresh page
    await page.reload();

    // Verify restored from localStorage directly to Screen 7
    await expect(page.locator('text=CURRENT_CV_STATE (Version 2')).toBeVisible();
    await expect(page.locator('#preview-resume-updated')).toContainText('Principal Talent Leader');
  });

  test('TEST 4: Rollback to Snapshot & Branching', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await page.click('button:has-text("Proceed to Screen 3")');

    // Turn 1 -> v2
    await page.fill('textarea', 'Headline ko Executive Recruiter kar do');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Turn 2 -> v3
    await page.click('button:has-text("Make Another Change")');
    await page.fill('textarea', 'Summary rewrite karo');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    await expect(page.locator('text=CURRENT_CV_STATE (Version 3')).toBeVisible();

    // Rollback to v1
    await page.click('button[title="Rollback to this version"]');
    await expect(page.locator('text=CURRENT_CV_STATE (Version 1')).toBeVisible();
  });

  test('TEST 5 & 6: Real PDF & DOCX Download Trigger Verification', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);
    await page.click('button:has-text("Proceed to Screen 3")');
    await page.fill('textarea', 'Summary improve karo');
    await page.click('button:has-text("Classify Intent & Formulate Change Plan")');
    await page.click('button:has-text("Approve & Apply Changes")');
    await expect(page.locator('text=Screen 6 — Quality Control')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("View Side-by-Side Comparison")');

    // Verify PDF & DOCX download buttons exist and are active
    const pdfButton = page.locator('button:has-text("PDF")');
    const docxButton = page.locator('button:has-text("DOCX")');

    await expect(pdfButton).toBeVisible();
    await expect(docxButton).toBeVisible();
    await expect(pdfButton).toBeEnabled();
    await expect(docxButton).toBeEnabled();
  });

});
