import { test, expect } from '@playwright/test';

/**
 * Happy-path coverage for the 6-step quote form.
 *
 * Week 1 scope: Form renders, validates per-step, submits, and lands on
 * the success state. Backend posts to /api/quote which runs in scaffold
 * mode (Supabase not configured) and returns a synthetic UUID.
 *
 * Week 3 / integration session adds: real Supabase persistence assertion,
 * Twilio SMS log assertion, Resend email log assertion.
 */

test.describe('quote flow', () => {
  test('user can fill all 6 steps and reach success state', async ({ page }) => {
    await page.goto('/quote');
    await expect(page.getByRole('heading', { name: /tell us about your/i })).toBeVisible();

    // Step 1 — size
    await page.getByText('1-bedroom', { exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2 — from
    await page.getByLabel(/from where\?/i).fill('123 Main St, Vancouver');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3 — to
    await page.getByLabel(/to where\?/i).fill('456 Hastings St, Burnaby');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 4 — date + time
    await page.getByLabel(/when\?/i).fill('2026-05-15');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 5 — notes (optional, can skip)
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 6 — contact
    await page.getByLabel(/your name/i).fill('Maya Tester');
    await page.getByLabel(/^phone/i).fill('604-555-0100');
    await page.getByRole('button', { name: /get my quote/i }).click();

    // Success state
    await expect(page.getByRole('heading', { name: /we've got it/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/reference:/i)).toBeVisible();
  });

  test('submitting empty step 1 surfaces a validation error', async ({ page }) => {
    await page.goto('/quote');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/pick the option that fits best/i)).toBeVisible();
  });
});
