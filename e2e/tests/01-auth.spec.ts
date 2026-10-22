import { test, expect } from '@playwright/test';
import { loadState, uiLogin } from './helpers';

// Journey 1 (CLAUDE.md 10.4): "Sign in (JWT and Google OAuth) -> select tenant."
// This app has no tenant-switcher UI - each user belongs to exactly one tenant
// (see app/services/auth_service.py), so "select tenant" is implicit in login.
// Google OAuth's real redirect/consent flow can't be driven headlessly without
// live Google credentials; this suite only verifies the sign-in button points
// at Google's OAuth endpoint, not the full third-party round trip.
test.describe('Sign in', () => {
  test('registers a new workspace and lands on the dashboard', async ({ page }) => {
    const email = `e2e-register-${Date.now()}@example.com`;
    await page.goto('/register');
    await page.getByLabel('Workspace name').fill('E2E Register Workspace');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('e2e-test-password-1!');
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: /Welcome,/ })).toBeVisible();
  });

  test('signs in with existing JWT credentials', async ({ page }) => {
    const { tenantA } = loadState();
    await uiLogin(page, tenantA.email, tenantA.password);

    await expect(page.getByRole('heading', { name: /Welcome,/ })).toBeVisible();
    // The dashboard heading also contains the email (no full_name set for
    // this tenant), so scope to the navbar specifically to avoid an
    // ambiguous match between the two.
    await expect(page.locator('header').getByText(tenantA.email)).toBeVisible();
  });

  test('rejects an invalid password', async ({ page }) => {
    const { tenantA } = loadState();
    await page.goto('/login');
    await page.getByLabel('Email').fill(tenantA.email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Google sign-in button points at the backend\'s OAuth-initiation endpoint', async ({ page }) => {
    // Shallow check only: confirms the link targets our backend's redirect
    // starting point, not a completed round trip through Google's consent
    // screen, which needs live Google credentials this environment doesn't have.
    await page.goto('/login');
    const href = await page.getByRole('link', { name: 'Sign in with Google' }).getAttribute('href');
    expect(href).toContain('/auth/google/login');
  });
});
