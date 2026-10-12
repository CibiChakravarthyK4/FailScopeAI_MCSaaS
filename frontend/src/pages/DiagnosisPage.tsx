import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfidenceMeter } from '../components/ui/ConfidenceMeter';
import { getDiagnosis, submitReview } from '../services/diagnosisService';
import type { Diagnosis, FailureCategory } from '../types';

const CATEGORIES: FailureCategory[] = [
  'application_bug',
  'script_issue',
  'data_issue',
  'environment',
  'integration',
  'unknown',
];

export function DiagnosisPage() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctedCategory, setCorrectedCategory] = useState<FailureCategory>('unknown');
  const [reason, setReason] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const load = () => {
    if (!diagnosisId) return;
    getDiagnosis(Number(diagnosisId))
      .then(setDiagnosis)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [diagnosisId]);

  const handleReview = async (action: 'accept' | 'reject' | 'correct') => {
    if (!diagnosis) return;
    setReviewError(null);
    setIsSubmitting(true);
    try {
      await submitReview(diagnosis.id, action, action === 'correct' ? correctedCategory : undefined, reason || undefined);
      load();
    } catch {
      setReviewError('Could not submit this review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : !diagnosis ? (
          <p className="text-sm text-muted">Diagnosis not found.</p>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-semibold capitalize text-ink">
                {diagnosis.category.replace(/_/g, ' ')}
              </h1>
              <StatusBadge status={diagnosis.status} />
            </div>

            <Card className="mb-6">
              <ConfidenceMeter score={diagnosis.confidence_score} />
            </Card>

            <Card className="mb-6">
              <p className="mb-2 text-sm font-medium text-ink">Evidence</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-ink">
                {diagnosis.evidence.citations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              {diagnosis.evidence.secrets_redacted > 0 && (
                <p className="mt-3 text-xs text-muted">
                  {diagnosis.evidence.secrets_redacted} secret value(s) were redacted before this evidence was sent
                  to the model.
                </p>
              )}
            </Card>

            <Card className="mb-6">
              <p className="text-xs text-muted">
                {diagnosis.model_provider} / {diagnosis.model_name} · prompt {diagnosis.prompt_version}
              </p>
            </Card>

            {diagnosis.status === 'pending' ? (
              <Card>
                <p className="mb-3 text-sm font-medium text-ink">Reviewer action</p>
                <div className="mb-3 flex gap-3">
                  <Button className="w-auto px-4" onClick={() => handleReview('accept')} isLoading={isSubmitting}>
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-auto px-4"
                    onClick={() => handleReview('reject')}
                    isLoading={isSubmitting}
                  >
                    Reject
                  </Button>
                </div>
                <div className="flex items-end gap-3 border-t border-line pt-4">
                  <select
                    value={correctedCategory}
                    onChange={(e) => setCorrectedCategory(e.target.value as FailureCategory)}
                    className="rounded-md border border-line px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="flex-1 rounded-md border border-line px-3 py-2 text-sm"
                  />
                  <Button
                    variant="secondary"
                    className="w-auto px-4"
                    onClick={() => handleReview('correct')}
                    isLoading={isSubmitting}
                  >
                    Correct
                  </Button>
                </div>
                {reviewError && <p className="mt-2 text-sm text-red-600">{reviewError}</p>}
              </Card>
            ) : (
              <Button
                className="w-auto px-4"
                onClick={() => navigate(`/exports/new?test_case_id=${diagnosis.test_case_id}`)}
              >
                Create defect export
              </Button>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
