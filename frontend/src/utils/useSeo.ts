import { useEffect } from 'react';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Hand-rolled instead of react-helmet-async: this app has no SSR, so a
// useEffect that sets document.title/meta tags on mount is equivalent for
// crawlers that execute JS, without adding a dependency.
export function useSeo(title: string, description: string, path: string) {
  useEffect(() => {
    const fullTitle = `${title} | RootTrace Ivory`;
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', '/og-image.png');
    upsertCanonical(`${window.location.origin}${path}`);
  }, [title, description, path]);
}
