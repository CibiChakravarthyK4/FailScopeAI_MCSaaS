import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/app/AppLayout';
import { PageContainer } from '../components/app/PageContainer';
import { PageHeader } from '../components/app/PageHeader';
import { Card } from '../components/ui/Card';
import { ConfidenceMeter } from '../components/ui/ConfidenceMeter';
import { TaxonomyChip } from '../components/ui/TaxonomyChip';
import { listPendingDiagnoses } from '../services/diagnosisService';
import type { DiagnosisListItem } from '../types';

export function ReviewQueuePage() {
  const [items, setItems] = useState<DiagnosisListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listPendingDiagnoses()
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppLayout>
      <PageContainer>
        <PageHeader title="Review queue" description="Diagnoses waiting for a reviewer to accept, reject or correct." />

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : items.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">Nothing pending review.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-line p-0">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/diagnoses/${item.id}`}
                className="flex items-center justify-between gap-6 px-6 py-4 hover:bg-brand-blue-light"
              >
                <div>
                  <p className="mb-1.5 font-medium text-ink">{item.test_case_name}</p>
                  <TaxonomyChip category={item.category} />
                </div>
                <div className="w-32">
                  <ConfidenceMeter score={item.confidence_score} />
                </div>
              </Link>
            ))}
          </Card>
        )}
      </PageContainer>
    </AppLayout>
  );
}
