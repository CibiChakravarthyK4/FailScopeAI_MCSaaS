import { test, expect } from '@playwright/test';
import { API_URL, apiLogin, importSampleRunViaApi, loadState, uiLogin, waitForRunCompleted } from './helpers';

// Journey 5: "Export a defect to Jira -> exported once only (idempotent)."
// Jira export runs in sandbox mode (app/services/export_service.py) - no real
// Jira credentials are involved, so this is a true end-to-end check of our own
// idempotency guarantee, not a mock of a third party.
test('publishing a defect export twice does not create a duplicate', async ({ page, request }) => {
  const { tenantA } = loadState();
  const token = await apiLogin(request, tenantA.email, tenantA.password);
  const run = await importSampleRunViaApi(request, token, `e2e-export-${Date.now()}`);
  const completed = await waitForRunCompleted(request, token, run.id);
  const testCase = completed.test_cases.find((tc) => tc.name === 'test_checkout_flow');
  if (!testCase) throw new Error('Expected test_checkout_flow in the imported run');

  await uiLogin(page, tenantA.email, tenantA.password);
  await page.goto(`/exports/new?test_case_id=${testCase.id}`);

  await page.getByLabel('Title').fill('Checkout returns 500 on valid payload');
  await page.getByLabel('Steps').fill('1. Submit checkout with a valid cart\n2. Observe response');
  await page.getByLabel('Expected result').fill('200 OK with an order confirmation');
  await page.getByLabel('Actual result').fill('500 Internal Server Error');
  await page.getByRole('button', { name: 'Create draft' }).click();

  await expect(page.getByText(/Draft #\d+/)).toBeVisible();
  await page.getByRole('button', { name: 'Publish to Jira (sandbox)' }).click();
  await expect(page.getByText(/Published as SANDBOX-\d+/)).toBeVisible();

  const publishedText = await page.getByText(/Published as SANDBOX-\d+/).textContent();
  const exportId = Number(await page.getByText(/Draft #\d+/).textContent().then((t) => t?.match(/\d+/)?.[0]));

  // The UI only exposes "publish" once the draft isn't yet published, so the
  // second publish call (verifying idempotency) goes directly through the API.
  const secondPublish = await request.post(`${API_URL}/api/exports/${exportId}/publish`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(secondPublish.ok()).toBeTruthy();
  const secondBody = await secondPublish.json();
  expect(`Published as ${secondBody.jira_issue_key}`).toBe(publishedText);
  expect(secondBody.status).toBe('published');
});
