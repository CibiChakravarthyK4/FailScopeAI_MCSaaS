import { useEffect } from 'react';

// Injects a single JSON-LD <script> tag for the page, keyed by id so a
// re-render replaces rather than duplicates it. Hand-rolled like useSeo -
// no SSR here, so a client-side script tag is equivalent for crawlers that
// execute JS.
export function useStructuredData(id: string, data: Record<string, unknown>) {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [id, data]);
}
