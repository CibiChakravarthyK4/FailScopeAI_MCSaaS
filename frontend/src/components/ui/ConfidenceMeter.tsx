// A 10-block segmented bar (CLAUDE.md 4.3 "Confidence Meter") - filled blue
// blocks vs outlined, never a gradient and never red/amber/green for "how
// confident is this."
export function ConfidenceMeter({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  // Rounding the fill count (e.g. 87% -> round(8.7) = 9 full blocks) reads as
  // 90%, not 87% - a block only counts as full once its own 10% is entirely
  // earned. The remainder becomes a partial fill *within* the next block
  // instead, so 87% visibly looks like "most of the way through block 9,"
  // never mistakable for a full 9/10.
  const fullBlocks = Math.floor(pct / 10);
  const partialFraction = (pct % 10) / 10;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>Confidence</span>
        <span>{pct}%</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => {
          if (i < fullBlocks) {
            return <div key={i} className="h-2 flex-1 rounded-sm bg-iv-blue" />;
          }
          if (i === fullBlocks && partialFraction > 0) {
            return (
              <div
                key={i}
                className="relative h-2 flex-1 overflow-hidden rounded-sm border border-iv-border bg-white"
              >
                <div className="absolute inset-y-0 left-0 bg-iv-blue" style={{ width: `${partialFraction * 100}%` }} />
              </div>
            );
          }
          return <div key={i} className="h-2 flex-1 rounded-sm border border-iv-border bg-white" />;
        })}
      </div>
    </div>
  );
}
