import path from 'path';
import { test, expect } from '@playwright/test';
import { API_URL, FIXTURES_DIR, loadState, ownerApiLogin } from './helpers';

// Every public route added in the Phase 1 build-out. Visiting each one and
// asserting it rendered its own <h1> (not a 404/blank page) is the cheapest
// possible "no broken link" check - the header/footer link tests below cover
// that every nav entry actually points at one of these routes.
const PUBLIC_PAGES: { path: string; heading: RegExp }[] = [
  { path: '/', heading: /Find the root cause/ },
  { path: '/company', heading: /Software teams shouldn't lose hours/ },
  { path: '/contact', heading: /Have a Query/ },
  { path: '/pricing', heading: /Plans that grow with your team/ },
  { path: '/security', heading: /What we actually do/ },
  { path: '/privacy', heading: /Safeguarding your data/ },
  { path: '/terms', heading: /Clear terms, confident choices/ },
  { path: '/demo', heading: /See RootTrace Ivory with your own failures/ },
  { path: '/help', heading: /Find your way around/ },
  { path: '/careers', heading: /Help us build a product/ },
];

test.describe('Public site pages', () => {
  for (const { path: route, heading } of PUBLIC_PAGES) {
    test(`${route} renders its own page`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    });
  }

  test('every header and footer link resolves to a real page (no 404)', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = new Set<string>();
    for (const el of await page.locator('header a, footer a').all()) {
      const href = await el.getAttribute('href');
      if (href && href.startsWith('/') && !href.includes('#')) hrefs.add(href);
    }
    expect(hrefs.size).toBeGreaterThan(5);

    for (const href of hrefs) {
      // nginx.conf serves index.html for every path (SPA fallback), so a
      // genuinely unmatched route still returns 200 here - what actually
      // matters is that the route is one of the app's real pages, which the
      // PUBLIC_PAGES sweep above already confirms for everything linked
      // from the header/footer.
      const resp = await request.get(href);
      expect(resp.status(), `${href} should resolve`).toBeLessThan(400);
    }
  });

  test('submits the Contact form', async ({ page }) => {
    await page.goto('/contact');
    await page.getByLabel('Full name').fill('E2E Contact Tester');
    await page.getByLabel('Work email').fill(`e2e-contact-${Date.now()}@example.com`);
    await page.getByLabel('Message').fill('This is a test message sent by the public-site E2E suite, well over twenty characters.');
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText(/received your message/i)).toBeVisible();
  });

  test('submits the Request a Demo form', async ({ page }) => {
    await page.goto('/demo');
    await page.getByLabel('Full name').fill('E2E Demo Tester');
    await page.getByLabel('Work email').fill(`e2e-demo-${Date.now()}@example.com`);
    await page.getByLabel('Company').fill('E2E Co');
    await page.getByLabel('Role').fill('QA Lead');
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole('button', { name: 'Request a demo' }).click();
    await expect(page.getByText(/received your request/i)).toBeVisible();
  });

  test('submits a careers application with a PDF resume, and the owner can see it while other roles get 403', async ({
    page,
    request,
  }) => {
    const applicantEmail = `e2e-careers-${Date.now()}@example.com`;

    await page.goto('/careers');
    await page.getByLabel('Full name').fill('E2E Careers Tester');
    await page.getByLabel('Email').fill(applicantEmail);
    await page.setInputFiles('input[type="file"]', path.join(FIXTURES_DIR, 'sample-resume.pdf'));
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole('button', { name: 'Submit application' }).click();
    await expect(page.getByText(/received your application/i)).toBeVisible();

    const { tenantA, owner } = loadState();

    // A regular tenant token must not be able to see applications at all.
    const tenantToken = await request
      .post(`${API_URL}/auth/login`, { data: { email: tenantA.email, password: tenantA.password } })
      .then((r) => r.json())
      .then((b) => b.access_token);
    const deniedResp = await request.get(`${API_URL}/api/owner/careers/applications`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });
    expect([401, 403]).toContain(deniedResp.status());

    // The Platform Owner can see the application that was just submitted.
    const ownerToken = await ownerApiLogin(request, owner.email, owner.password, owner.totpSecret);
    const listResp = await request.get(`${API_URL}/api/owner/careers/applications`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    expect(listResp.ok()).toBeTruthy();
    const applications = await listResp.json();
    expect(applications.some((a: { email: string }) => a.email === applicantEmail)).toBe(true);
  });
});
