import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getEvidence } from '../services/runService';
import { runDiagnosis } from '../services/diagnosisService';
import type { Evidence } from '../types';

export function EvidencePage() {
  const { runId, testCaseId } = useParams<{ runId: string; testCaseId: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigateError, setInvestigateError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || !testCaseId) return;
    getEvidence(Number(runId), Number(testCaseId))
      .then(setEvidence)
      .finally(() => setIsLoading(false));
  }, [runId, testCaseId]);

  const handleInvestigate = async () => {
    if (!testCaseId) return;
    setInvestigateError(null);
    setIsInvestigating(true);
    try {
      const diagnosis = await runDiagnosis(Number(testCaseId));
      navigate(`/diagnoses/${diagnosis.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not run the investigation.';
      setInvestigateError(message);
    } finally {
      setIsInvestigating(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : !evidence ? (
          <p className="text-sm text-muted">Test case not found.</p>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-ink">{evidence.test_case.name}</h1>
              <StatusBadge status={evidence.test_case.status} />
            </div>

            <div className="mb-6">
              <Button className="w-auto px-4" onClick={handleInvestigate} isLoading={isInvestigating}>
                Investigate with AI
              </Button>
              {investigateError && <p className="mt-2 text-sm text-red-600">{investigateError}</p>}
            </div>

            <Card className="mb-6">
              <p className="mb-2 text-sm font-medium text-ink">Stack trace</p>
              <pre className="overflow-x-auto rounded-md bg-ink/5 p-4 text-xs text-ink">
                {evidence.test_case.stack_trace ?? 'No stack trace captured.'}
              </pre>
            </Card>

            <p className="mb-2 text-sm font-medium text-ink">Evidence</p>
            {evidence.artifacts.length === 0 ? (
              <Card>
                <p className="text-sm text-muted">No evidence linked to this test case yet.</p>
              </Card>
            ) : (
              <Card className="divide-y divide-line p-0">
                {evidence.artifacts.map((artifact) => (
                  <div key={artifact.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm text-ink">{artifact.storage_path.split(/[\\/]/).pop()}</p>
                      <p className="text-xs text-muted">{artifact.checksum_sha256.slice(0, 12)}...</p>
                    </div>
                    <span className="text-xs capitalize text-muted">{artifact.type}</span>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
