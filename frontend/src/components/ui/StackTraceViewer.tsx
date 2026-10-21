import { useEffect, useRef } from 'react';

// Renders the stack trace one line at a time (rather than a single <pre>
// blob) so the Evidence Rail can scroll to and highlight the exact line a
// citation points at (CLAUDE.md 4.3 "Evidence Rail").
export function StackTraceViewer({
  text,
  highlightedLine,
}: {
  text: string | null;
  highlightedLine: number | null;
}) {
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (highlightedLine == null || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-line="${highlightedLine}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedLine]);

  const lines = (text ?? 'No stack trace captured.').split('\n');

  return (
    <pre ref={containerRef} className="max-h-96 overflow-auto rounded-md bg-iv-bg p-4 text-xs text-ink">
      {lines.map((line, i) => (
        <div
          key={i}
          data-line={i}
          className={`rounded px-1 ${i === highlightedLine ? 'bg-iv-blue-100' : ''}`}
        >
          {line || ' '}
        </div>
      ))}
    </pre>
  );
}
