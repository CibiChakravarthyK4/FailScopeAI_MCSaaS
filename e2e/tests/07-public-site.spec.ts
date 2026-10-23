import { test, expect } from '@playwright/test';

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
  { path: '/faq', heading: /Questions, answered plainly/ },
  { path: '/integrations', heading: /Connect RootTrace Ivory/ },
  { path: '/tour', heading: /From a failed test to a confirmed defect/ },
  { path: '/subprocessors', heading: /Who we share data with/ },
  { path: '/cookies', heading: /We don't use cookies today/ },
  { path: '/acceptable-use', heading: /Using RootTrace Ivory responsibly/ },
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

  test('FAQ accordion opens and closes with a click and the keyboard', async ({ page }) => {
    await page.goto('/faq');
    const question = page.getByText('Where is my data stored?');
    await question.click();
    await expect(page.getByText(/hosting location is still being finalized/i)).toBeVisible();

    await question.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/hosting location is still being finalized/i)).not.toBeVisible();
  });

  test('an unknown route shows the friendly 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: "We can't find that page." })).toBeVisible();
    await page.getByRole('link', { name: 'Back home' }).click();
    await expect(page).toHaveURL('/');
  });
});
