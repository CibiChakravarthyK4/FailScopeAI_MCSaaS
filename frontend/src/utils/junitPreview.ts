export interface JunitPreview {
  testCount: number;
  failureCount: number;
}

/** Client-side-only preview (DOMParser, no network round trip) so step 1 of
 * the import wizard can show "N tests, M failures found" before the file is
 * even uploaded. The backend's own parser (app/services/junit_parser.py) is
 * still the source of truth once the file is actually submitted - this is
 * just a quick sanity check and a nicer first impression. */
export function parseJunitPreview(xmlText: string): JunitPreview | null {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    if (doc.querySelector('parsererror')) return null;
    if (!doc.documentElement || !['testsuite', 'testsuites'].includes(doc.documentElement.tagName)) return null;

    const testcases = doc.querySelectorAll('testcase');
    if (testcases.length === 0) return null;

    let failureCount = 0;
    testcases.forEach((tc) => {
      if (tc.querySelector('failure') || tc.querySelector('error')) failureCount += 1;
    });

    return { testCount: testcases.length, failureCount };
  } catch {
    return null;
  }
}
