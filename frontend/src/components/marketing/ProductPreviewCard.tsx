import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { ConfidenceMeter } from '../ui/ConfidenceMeter';
import { TaxonomyChip } from '../ui/TaxonomyChip';
import { EvidenceRail } from '../ui/EvidenceRail';

// A static mockup of the real case-file layout (CLAUDE.md 4.3), built from
// the actual app components with fixed demo data - not a screenshot, so it
// always matches the real design system, but it fetches nothing and is
// purely decorative.
const DEMO_CITATIONS = [
  'AssertionError: expected 200 but got 500',
  'checkout_test.py:42 - response.status_code == 200',
];

export function ProductPreviewCard() {
  return (
    <Card className="p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-ink">test_checkout_flow</p>
        <StatusBadge status="failed" />
      </div>
      <div className="mb-4">
        <TaxonomyChip category="application_bug" />
      </div>
      <div className="mb-4">
        <ConfidenceMeter score={0.87} />
      </div>
      <EvidenceRail citations={DEMO_CITATIONS} selectedIndex={0} onSelect={() => {}} />
    </Card>
  );
}
