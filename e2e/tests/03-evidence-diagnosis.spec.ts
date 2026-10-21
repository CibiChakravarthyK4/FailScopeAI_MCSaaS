import { test, expect } from '@playwright/test';
import { apiLogin, importSampleRunViaApi, loadState, uiLogin, waitForRunCompleted } from './helpers';

// Journey 3: "View evidence and AI diagnosis with citations."
// "Investigate with AI" calls the real OPENAI_API_KEY code path - this only
// produces a real result here because docker-compose.e2e.yml points it at the
// deterministic stub in e2e/fake-openai-server.py, not a real model. See
// CLAUDE.md 10.3 for what a true AI-quality evaluation requires instead.
//
// The case-file layout (CLAUDE.md 4.3) puts "Investigate with AI" under the
// Diagnosis tab, not the default Evidence tab - this test switches tabs
// explicitly rather than assuming the button is visible on load.
test('views evidence for a failed test case and runs an AI diagnosis with citations', async ({ page, request }) => {
  const { tenantA } = loadState();
  const token = await apiLogin(request, tenantA.email, tenantA.password);
  const run = await importSampleRunViaApi(request, token, `e2e-evidence-${Date.now()}`);
  const completed = await waitForRunCompleted(request, token, run.id);
  const testCase = completed.test_cases.find((tc) => tc.name === 'test_checkout_flow');
  if (!testCase) throw new Error('Expected test_checkout_flow in the imported run');

  await uiLogin(page, tenantA.email, tenantA.password);
  await page.goto(`/runs/${run.id}/tests/${testCase.id}`);

  // Evidence tab (default on load).
  await expect(page.getByRole('heading', { name: 'test_checkout_flow' })).toBeVisible();
  await expect(page.getByText(/AssertionError: expected 200 but got 500/)).toBeVisible();
  await expect(page.getByText('test_checkout_flow.txt')).toBeVisible();

  // Diagnosis tab: no diagnosis yet, so only the investigate action shows.
  await page.getByRole('button', { name: 'Diagnosis' }).click();
  await page.getByRole('button', { name: 'Investigate with AI' }).click();

  await expect(page.getByText('Application bug')).toBeVisible();
  await expect(page.getByText('Stub AI response for E2E testing')).toBeVisible();
});
