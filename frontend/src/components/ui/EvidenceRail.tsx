import { Card } from './Card';

// Persistent right-hand panel listing the AI's citations (CLAUDE.md 4.3
// "Evidence Rail"). Clicking one scrolls to and highlights the stack-trace
// line it most likely refers to (see StackTraceViewer.findMatchingLine).
export function EvidenceRail({
  citations,
  selectedIndex,
  onSelect,
}: {
  citations: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  if (citations.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">No citations yet - run a diagnosis to populate the evidence rail.</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-line p-0">
      <p className="px-4 py-3 text-sm font-medium text-ink">Evidence</p>
      {citations.map((citation, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`block w-full px-4 py-3 text-left text-sm transition-colors ${
            selectedIndex === i ? 'bg-iv-blue-50 text-iv-blue-deep' : 'text-ink hover:bg-iv-blue-50'
          }`}
        >
          {citation}
        </button>
      ))}
    </Card>
  );
}
