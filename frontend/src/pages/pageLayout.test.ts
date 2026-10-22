import { describe, expect, it } from 'vitest';

// Every logged-in page must use AppLayout + PageContainer as its sole shell, with
// PageContainer as the direct child of AppLayout. This is what keeps every page's
// content starting at the same left edge - a page that wraps its own max-w-*/mx-auto
// div around (or instead of) PageContainer would silently drift out of alignment,
// the exact bug this test exists to catch.
const pageSources = import.meta.glob('./*.tsx', { as: 'raw', eager: true }) as Record<string, string>;

const appPages = Object.entries(pageSources).filter(([, src]) => src.includes('AppLayout'));

describe('app page layout consistency', () => {
  it('found at least one app-shell page to check', () => {
    expect(appPages.length).toBeGreaterThan(0);
  });

  it.each(appPages)('%s uses PageContainer as the direct child of AppLayout', (file, src) => {
    expect(file).toContain('.tsx');
    expect(src).toMatch(/import \{ PageContainer \} from ['"]\.\.\/components\/app\/PageContainer['"]/);
    expect(src).toMatch(/<AppLayout>\s*<PageContainer>/);
  });
});
