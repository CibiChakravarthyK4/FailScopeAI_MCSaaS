import { describe, expect, it } from 'vitest';
import { validateXml, validateAttachments, MAX_XML_MB, MAX_ATTACHMENT_MB } from './uploadValidation';

function makeFile(name: string, sizeBytes: number, type = ''): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('validateXml', () => {
  it('accepts a well-formed .xml file within the size limit', () => {
    expect(validateXml(makeFile('results.xml', 1024))).toBeNull();
  });

  it('rejects a non-.xml file', () => {
    expect(validateXml(makeFile('results.json', 1024))).toMatch(/only \.xml/i);
  });

  it('rejects a file over the size limit', () => {
    const oversized = makeFile('results.xml', (MAX_XML_MB + 1) * 1024 * 1024);
    expect(validateXml(oversized)).toMatch(new RegExp(`${MAX_XML_MB} MB`));
  });

  it('is case-insensitive on the extension', () => {
    expect(validateXml(makeFile('RESULTS.XML', 1024))).toBeNull();
  });
});

describe('validateAttachments', () => {
  it('returns null for an empty list', () => {
    expect(validateAttachments([])).toBeNull();
  });

  it('accepts files with allowed extensions', () => {
    const files = [makeFile('console.log', 1024), makeFile('screenshot.png', 1024)];
    expect(validateAttachments(files)).toBeNull();
  });

  it('rejects a file with a disallowed extension', () => {
    const files = [makeFile('archive.zip', 1024)];
    expect(validateAttachments(files)).toMatch(/only .*files are accepted/i);
  });

  it('rejects a file over the per-attachment size limit', () => {
    const oversized = makeFile('big.png', (MAX_ATTACHMENT_MB + 1) * 1024 * 1024);
    expect(validateAttachments([oversized])).toMatch(new RegExp(`${MAX_ATTACHMENT_MB} MB`));
  });

  it('reports the first invalid file when multiple are given', () => {
    const files = [makeFile('ok.log', 1024), makeFile('bad.zip', 1024)];
    expect(validateAttachments(files)).toContain('bad.zip');
  });
});
