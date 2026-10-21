// A 10-block segmented bar (CLAUDE.md 4.3 "Confidence Meter") - filled blue
// blocks vs outlined, never a gradient and never red/amber/green for "how
// confident is this."
export function ConfidenceMeter({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const filledBlocks = Math.round(pct / 10);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>Confidence</span>
        <span>{pct}%</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-sm ${
              i < filledBlocks ? 'bg-iv-blue' : 'border border-iv-border bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
