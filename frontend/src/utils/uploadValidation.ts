export const MAX_XML_MB = 25;
export const MAX_ATTACHMENT_MB = 10;
export const ATTACHMENT_EXTENSIONS = ['.log', '.txt', '.png', '.jpg', '.jpeg'];

export function validateXml(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.xml')) return 'Only .xml files are accepted here.';
  if (file.size > MAX_XML_MB * 1024 * 1024) return `File is larger than the ${MAX_XML_MB} MB limit.`;
  return null;
}

export function validateAttachments(files: File[]): string | null {
  for (const file of files) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
      return `${file.name}: only ${ATTACHMENT_EXTENSIONS.join(', ')} files are accepted.`;
    }
    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      return `${file.name} is larger than the ${MAX_ATTACHMENT_MB} MB limit.`;
    }
  }
  return null;
}
