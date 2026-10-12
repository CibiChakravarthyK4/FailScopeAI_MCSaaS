import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { ConfidenceMeter } from '../components/ui/ConfidenceMeter';
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
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Review queue</h1>

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
                  <p className="font-medium text-ink">{item.test_case_name}</p>
                  <p className="text-sm capitalize text-muted">{item.category.replace(/_/g, ' ')}</p>
                </div>
                <div className="w-32">
                  <ConfidenceMeter score={item.confidence_score} />
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
