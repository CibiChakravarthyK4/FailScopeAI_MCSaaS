import path from 'path';
import { test, expect } from '@playwright/test';
import { FIXTURES_DIR, loadState, uiLogin } from './helpers';

// Journey 2: "Import a failed run (JUnit XML + logs + screenshot) -> job completes."
// Import is synchronous (creates the Run/Job rows); processing the JUnit file
// and attachments happens asynchronously on the `worker` container, so this
// test polls the UI (via reload) until the status badge leaves pending/processing.
test('imports a run with a log attachment and the job completes', async ({ page }) => {
  const { tenantA } = loadState();
  await uiLogin(page, tenantA.email, tenantA.password);

  // The import page is a 3-step wizard (Upload -> Details -> Confirm; see
  // Stepper usage in RunImportPage.tsx), not a single-page form.
  const runName = `e2e-import-${Date.now()}`;
  await page.goto('/runs/new');
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIXTURES_DIR, 'sample-run.xml'));
  await page.locator('input[type="file"]').nth(1).setInputFiles(path.join(FIXTURES_DIR, 'test_checkout_flow.txt'));
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByLabel('Run name').fill(runName);
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByRole('button', { name: 'Start analysis' }).click();

  // Submitting stays on /runs/new and polls client-side (RunImportPage's own
  // useEffect) until the job leaves pending/processing - it does not navigate
  // to /runs/{id} itself; "Open run" does that once the status is terminal.
  await expect(async () => {
    const status = page.locator('span', { hasText: /completed|failed|partial/i }).first();
    await expect(status).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000, intervals: [1000] });

  await page.getByRole('button', { name: 'Open run' }).click();
  await page.waitForURL(/\/runs\/\d+$/);
  await expect(page.getByRole('heading', { name: runName })).toBeVisible();
  await expect(page.getByRole('link', { name: 'test_checkout_flow' })).toBeVisible();
});
