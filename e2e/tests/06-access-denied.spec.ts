import { test, expect } from '@playwright/test';
import { apiLogin, importSampleRunViaApi, loadState, uiLogin } from './helpers';

// Journey 6: "Access-denied journey for a role or tenant without permission."
// Covers both halves: cross-tenant isolation (C01) and role-based denial (C02).
test.describe('Access denied', () => {
  test('a tenant cannot view another tenant\'s run', async ({ page, request }) => {
    const { tenantA, tenantB } = loadState();
    const tokenA = await apiLogin(request, tenantA.email, tenantA.password);
    const run = await importSampleRunViaApi(request, tokenA, `e2e-isolation-${Date.now()}`);

    await uiLogin(page, tenantB.email, tenantB.password);
    await page.goto(`/runs/${run.id}`);

    await expect(page.getByText('Run not found.')).toBeVisible();
  });

  test('a viewer cannot import a run', async ({ page }) => {
    const { viewer } = loadState();
    await uiLogin(page, viewer.email, viewer.password);

    await page.goto('/runs/new');
    await page.getByLabel('Run ID').fill(`e2e-denied-${Date.now()}`);
    await page.setInputFiles('input[type="file"]', {
      name: 'sample-run.xml',
      mimeType: 'application/xml',
      buffer: Buffer.from('<testsuite><testcase name="t"><failure>x</failure></testcase></testsuite>'),
    });
    await page.getByRole('button', { name: 'Import' }).click();

    // Backend returns 403 (app/dependencies.py require_role); the UI shows its
    // generic import-failure copy since it doesn't special-case this status,
    // and - more importantly - never navigates away to a newly created run.
    await expect(page.getByText(/Could not import this run/)).toBeVisible();
    await expect(page).toHaveURL(/\/runs\/new$/);
  });
});
