import fs from 'fs';
import path from 'path';
import type { APIRequestContext, Page } from '@playwright/test';

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8010';

const STATE_PATH = path.join(__dirname, '..', '.auth', 'state.json');

export interface SharedState {
  tenantA: { email: string; password: string; tenantName: string };
  tenantB: { email: string; password: string; tenantName: string };
  viewer: { email: string; password: string };
}

export function loadState(): SharedState {
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
}

export function saveState(state: SharedState): void {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export async function apiLogin(request: APIRequestContext, email: string, password: string): Promise<string> {
  const resp = await request.post(`${API_URL}/auth/login`, { data: { email, password } });
  if (!resp.ok()) {
    throw new Error(`Login failed for ${email}: ${resp.status()} ${await resp.text()}`);
  }
  const body = await resp.json();
  return body.access_token;
}

export async function uiLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
}

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const SAMPLE_JUNIT_XML = fs.readFileSync(path.join(FIXTURES_DIR, 'sample-run.xml'));
const SAMPLE_LOG = fs.readFileSync(path.join(FIXTURES_DIR, 'test_checkout_flow.txt'));

/** Imports a run directly via the API (fast, reliable test setup) rather than
 * through the UI - the UI-driven import itself is what 02-import-run.spec.ts
 * tests; other specs just need a completed run to exist. */
export async function importSampleRunViaApi(
  request: APIRequestContext,
  token: string,
  externalRunId: string
): Promise<{ id: number }> {
  const resp = await request.post(`${API_URL}/api/runs/import`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      external_run_id: externalRunId,
      junit_file: {
        name: 'sample-run.xml',
        mimeType: 'application/xml',
        buffer: Buffer.from(SAMPLE_JUNIT_XML),
      },
      attachments: {
        name: 'test_checkout_flow.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(SAMPLE_LOG),
      },
    },
  });
  if (!resp.ok()) {
    throw new Error(`Run import failed: ${resp.status()} ${await resp.text()}`);
  }
  return resp.json();
}

export async function waitForRunCompleted(
  request: APIRequestContext,
  token: string,
  runId: number
): Promise<{ id: number; status: string; test_cases: { id: number; name: string; status: string }[] }> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const resp = await request.get(`${API_URL}/api/runs/${runId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const run = await resp.json();
    if (!['pending', 'processing'].includes(run.status)) {
      return run;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Run ${runId} did not finish processing within 30s`);
}
