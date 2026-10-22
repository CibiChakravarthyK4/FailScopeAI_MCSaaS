import { marked } from 'marked';

export interface HelpArticle {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  html: string;
  headings: { id: string; text: string; level: number }[];
}

// Hand-rolled frontmatter split (not gray-matter): the format here is just
// flat "key: value" pairs between --- delimiters, so a small regex-based
// parser avoids pulling in a YAML parser for content we fully control.
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const [, frontmatter, body] = match;
  const meta: Record<string, string> = {};
  for (const line of frontmatter.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    meta[key] = value;
  }
  return { meta, body };
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const rawFiles = import.meta.glob('../content/help/*.md', { as: 'raw', eager: true }) as Record<string, string>;

export const helpArticles: HelpArticle[] = Object.values(rawFiles)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw);
    const headings: HelpArticle['headings'] = [];
    const renderer = new marked.Renderer();
    renderer.heading = (text: string, level: number) => {
      const id = slugifyHeading(text);
      headings.push({ id, text, level });
      return `<h${level} id="${id}">${text}</h${level}>`;
    };
    const html = marked.parse(body, { renderer }) as string;
    return {
      slug: meta.slug ?? '',
      title: meta.title ?? 'Untitled',
      summary: meta.summary ?? '',
      updated: meta.updated ?? '',
      html,
      headings,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return helpArticles.find((a) => a.slug === slug);
}
