import { describe, expect, it } from 'vitest';

// Every public marketing/legal page must use the shared MarketingHeader and
// MarketingFooter, so left/right content edges and nav/footer links stay
// consistent across the whole public site - the same invariant
// pageLayout.test.ts checks for the logged-in app shell.
const pageSources = import.meta.glob('./*.tsx', { as: 'raw', eager: true }) as Record<string, string>;

const EXCLUDED = new Set([
  './HomePage.tsx', // uses the marketing components directly, not a thin page wrapper
  './AcceptTermsPage.tsx', // logged-in interstitial, not a public marketing page
  './LoginPage.tsx',
  './RegisterPage.tsx',
  './AuthCallbackPage.tsx',
  './DiagnosisRedirectPage.tsx',
]);

const publicPages = Object.entries(pageSources).filter(
  ([file, src]) => !EXCLUDED.has(file) && !file.includes('/owner/') && (src.includes('MarketingHeader') || src.includes('MarketingFooter'))
);

describe('public page layout consistency', () => {
  it('found at least one public marketing page to check', () => {
    expect(publicPages.length).toBeGreaterThan(5);
  });

  it.each(publicPages)('%s uses both MarketingHeader and MarketingFooter', (file, src) => {
    expect(file).toContain('.tsx');
    expect(src).toMatch(/import \{ MarketingHeader \} from ['"]\.\.\/components\/marketing\/MarketingHeader['"]/);
    expect(src).toMatch(/import \{ MarketingFooter \} from ['"]\.\.\/components\/marketing\/MarketingFooter['"]/);
    expect(src).toMatch(/<MarketingHeader\s*\/>/);
    expect(src).toMatch(/<MarketingFooter\s*\/>/);
  });

  it.each(publicPages)('%s calls useSeo for title/description/canonical', (file, src) => {
    expect(file).toContain('.tsx');
    expect(src).toMatch(/useSeo\(/);
  });
});
