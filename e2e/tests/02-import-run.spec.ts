import path from 'path';
import { test, expect } from '@playwright/test';
import { loadState, uiLogin } from './helpers';

// Journey 2: "Import a failed run (JUnit XML + logs + screenshot) -> job completes."
// Import is synchronous (creates the Run/Job rows); processing the JUnit file
// and attachments happens asynchronously on the `worker` container, so this
// test polls the UI (via reload) until the status badge leaves pending/processing.
test('imports a run with a log attachment and the job completes', async ({ page }) => {
  const { tenantA } = loadState();
  await uiLogin(page, tenantA.email, tenantA.password);

  const externalRunId = `e2e-import-${Date.now()}`;
  await page.goto('/runs/new');
  await page.getByLabel('Run ID').fill(externalRunId);
  await page.locator('input[type="file"]').first().setInputFiles(path.join(__dirname, 'fixtures', 'sample-run.xml'));
  await page.locator('input[type="file"]').nth(1).setInputFiles(path.join(__dirname, 'fixtures', 'test_checkout_flow.txt'));
  await page.getByRole('button', { name: 'Import' }).click();

  await page.waitForURL(/\/runs\/\d+$/);
  await expect(page.getByRole('heading', { name: externalRunId })).toBeVisible();

  await expect(async () => {
    await page.reload();
    const status = page.locator('span', { hasText: /completed|failed|partial/i }).first();
    await expect(status).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000, intervals: [1000] });

  await expect(page.getByRole('link', { name: 'test_checkout_flow' })).toBeVisible();
});
