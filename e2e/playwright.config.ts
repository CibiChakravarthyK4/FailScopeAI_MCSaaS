import { defineConfig, devices } from '@playwright/test';

// Runs against the real Docker Compose stack (CLAUDE.md 10.4), not a dev server
// Playwright starts itself: `docker compose -f docker-compose.yml -f docker-compose.e2e.yml up`
// must already be running (see e2e/README section in CLAUDE.md Section 11).
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  globalSetup: './global-setup.ts',
  use: {
    baseURL: process.env.E2E_FRONTEND_URL ?? 'http://localhost:8081',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
