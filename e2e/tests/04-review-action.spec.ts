import { test, expect } from '@playwright/test';
import { API_URL, apiLogin, importSampleRunViaApi, loadState, uiLogin, waitForRunCompleted } from './helpers';

// Journey 4: "Reviewer accepts, rejects or corrects a category (audit entry created)."
test('reviewer accepts a diagnosis and an audit entry is recorded', async ({ page, request }) => {
  const { tenantA } = loadState();
  const token = await apiLogin(request, tenantA.email, tenantA.password);
  const run = await importSampleRunViaApi(request, token, `e2e-review-${Date.now()}`);
  const completed = await waitForRunCompleted(request, token, run.id);
  const testCase = completed.test_cases.find((tc) => tc.name === 'test_checkout_flow');
  if (!testCase) throw new Error('Expected test_checkout_flow in the imported run');

  const diagResp = await request.post(`${API_URL}/api/diagnoses/${testCase.id}/run`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(diagResp.ok()).toBeTruthy();
  const diagnosis = await diagResp.json();

  await uiLogin(page, tenantA.email, tenantA.password);
  // /diagnoses/:id is a client-side redirect (DiagnosisRedirectPage) into the
  // case file's Diagnosis tab - there's no standalone diagnosis page anymore.
  await page.goto(`/diagnoses/${diagnosis.id}`);
  await page.waitForURL(/\/runs\/\d+\/tests\/\d+\?tab=diagnosis/);

  await page.getByRole('button', { name: 'Accept' }).click();

  // Accepting moves the diagnosis out of "pending" - the reviewer action
  // buttons disappear and a "Create defect export" action takes their place.
  await expect(page.getByRole('button', { name: 'Create defect export' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept' })).not.toBeVisible();

  const auditResp = await request.get(`${API_URL}/api/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(auditResp.ok()).toBeTruthy();
  const auditLogs: { action: string; entity_type: string; entity_id: number }[] = await auditResp.json();
  const reviewEntry = auditLogs.find(
    (entry) => entry.action === 'diagnosis_reviewed' && entry.entity_id === diagnosis.id
  );
  expect(reviewEntry).toBeTruthy();
});
