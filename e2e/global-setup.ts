import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { API_URL, saveState, type SharedState } from './tests/helpers';

// /auth/register is rate-limited to 5/hour per IP (app/rate_limit.py), and every
// Playwright request in this suite shares one IP - so global setup registers
// exactly twice here, and every other test reuses these two tenants rather
// than registering its own. See e2e/tests/01-auth.spec.ts for the one
// additional UI-driven registration the suite does (3 total, well under 5).
const RUN_ID = Date.now();
const PASSWORD = 'e2e-test-password-1!';

async function register(api: APIRequestContext, email: string, tenantName: string): Promise<void> {
  const resp = await api.post(`${API_URL}/auth/register`, {
    data: { email, password: PASSWORD, tenant_name: tenantName, accepted_terms: true },
  });
  if (!resp.ok()) {
    throw new Error(`Setup registration failed for ${email}: ${resp.status()} ${await resp.text()}`);
  }
}

export default async function globalSetup(): Promise<void> {
  const api = await playwrightRequest.newContext();

  const tenantA = { email: `e2e-a-${RUN_ID}@example.com`, password: PASSWORD, tenantName: `E2E Tenant A ${RUN_ID}` };
  const tenantB = { email: `e2e-b-${RUN_ID}@example.com`, password: PASSWORD, tenantName: `E2E Tenant B ${RUN_ID}` };
  const viewer = { email: `e2e-viewer-${RUN_ID}@example.com`, password: PASSWORD };
  const owner = {
    email: `e2e-owner-${RUN_ID}@example.com`,
    password: PASSWORD,
    totpSecret: 'JBSWY3DPEHPK3PXP',
  };

  await register(api, tenantA.email, tenantA.tenantName);
  await register(api, tenantB.email, tenantB.tenantName);
  await api.dispose();

  // No API exists to create a non-admin user (roles are assigned via database
  // records in this MVP, not self-service), so the viewer fixture for the
  // role-based access-denied journey is inserted directly.
  const pg = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'failscope',
    password: 'failscope',
    database: 'failscope',
  });
  await pg.connect();
  try {
    const { rows } = await pg.query('SELECT id FROM tenants WHERE name = $1', [tenantA.tenantName]);
    const tenantAId = rows[0].id;
    const hashed = bcrypt.hashSync(viewer.password, 10);
    const { rows: userRows } = await pg.query(
      `INSERT INTO users (tenant_id, email, hashed_password, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'viewer', true, now(), now()) RETURNING id`,
      [tenantAId, viewer.email, hashed]
    );
    // /auth/register records legal acceptance as part of signup (CLAUDE.md
    // 17.4) - this user is inserted directly, bypassing that, so without this
    // they'd hit the "Updated terms" interstitial (ProtectedRoute's
    // needs_legal_acceptance redirect) on first login instead of their
    // intended destination.
    const viewerId = userRows[0].id;
    await pg.query(
      `INSERT INTO legal_acceptances (user_id, document, version, created_at, updated_at)
       VALUES ($1, 'privacy', '0.1-draft', now(), now()), ($1, 'terms', '0.1-draft', now(), now())`,
      [viewerId]
    );

    // No HTTP endpoint creates a Platform Owner either (by design - see
    // app/models/platform_owner.py) - seeded directly, same as the viewer
    // above. The TOTP secret is a fixed base32 string; it only needs to be
    // valid, not secret, for a throwaway test account.
    const ownerPasswordHash = bcrypt.hashSync(owner.password, 10);
    await pg.query(
      `INSERT INTO platform_owners (email, hashed_password, totp_secret, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, now(), now())`,
      [owner.email, ownerPasswordHash, owner.totpSecret]
    );
  } finally {
    await pg.end();
  }

  saveState({ tenantA, tenantB, viewer, owner } satisfies SharedState);
}
