import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TaxonomyChip } from '../components/ui/TaxonomyChip';
import { ConfidenceMeter } from '../components/ui/ConfidenceMeter';
import { FormMessage } from '../components/ui/FormMessage';
import { LoadingIndicator } from '../components/ui/TraceRing';
import { StackTraceViewer } from '../components/ui/StackTraceViewer';
import { findMatchingLine } from '../utils/stackTraceMatch';
import { EvidenceRail } from '../components/ui/EvidenceRail';
import { ExportDraftForm } from '../components/export/ExportDraftForm';
import { getEvidence, getHistory } from '../services/runService';
import { runDiagnosis, submitReview } from '../services/diagnosisService';
import type { Evidence, HistoryEntry, FailureCategory } from '../types';

type Tab = 'evidence' | 'diagnosis' | 'history' | 'export';
const TABS: Tab[] = ['evidence', 'diagnosis', 'history', 'export'];

const CATEGORIES: FailureCategory[] = [
  'application_bug',
  'script_issue',
  'data_issue',
  'environment',
  'integration',
  'unknown',
];

const ACTION_LABELS: Record<string, string> = {
  run_import_queued: 'Run imported',
  diagnosis_model_call: 'AI diagnosis run',
  diagnosis_reviewed: 'Reviewer action',
};

// The "case file" (CLAUDE.md 4.3): one failure, one page, with a bold title, a
// status strip, then tabs (Evidence, Diagnosis, History, Export) and a
// persistent Evidence Rail wherever citations are relevant.
export function CaseFilePage() {
  const { runId, testCaseId } = useParams<{ runId: string; testCaseId: string }>();
  const [searchParams] = useSearchParams();

  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'evidence');
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigateError, setInvestigateError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [correctedCategory, setCorrectedCategory] = useState<FailureCategory>('unknown');
  const [reason, setReason] = useState('');

  const load = () => {
    if (!runId || !testCaseId) return;
    getEvidence(Number(runId), Number(testCaseId))
      .then(setEvidence)
      .finally(() => setIsLoading(false));
  };
  useEffect(load, [runId, testCaseId]);

  useEffect(() => {
    if (tab === 'history' && !history && runId && testCaseId) {
      getHistory(Number(runId), Number(testCaseId)).then(setHistory);
    }
  }, [tab, runId, testCaseId, history]);

  const diagnosis = evidence?.diagnoses[0] ?? null;
  const stackLines = (evidence?.test_case.stack_trace ?? '').split('\n');

  const handleInvestigate = async () => {
    if (!testCaseId) return;
    setInvestigateError(null);
    setIsInvestigating(true);
    try {
      await runDiagnosis(Number(testCaseId));
      load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not run the investigation.';
      setInvestigateError(message);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleReview = async (action: 'accept' | 'reject' | 'correct') => {
    if (!diagnosis) return;
    setReviewError(null);
    setIsReviewing(true);
    try {
      await submitReview(diagnosis.id, action, action === 'correct' ? correctedCategory : undefined, reason || undefined);
      load();
    } catch {
      setReviewError('Could not submit this review.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSelectCitation = (index: number) => {
    setSelectedCitation(index);
    setTab('evidence');
    const citation = diagnosis?.evidence.citations[index];
    setHighlightedLine(citation ? findMatchingLine(citation, stackLines) : null);
  };

  const showRail = (tab === 'evidence' || tab === 'diagnosis') && diagnosis != null;

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {isLoading ? (
          <LoadingIndicator />
        ) : !evidence ? (
          <p className="text-sm text-muted">Test case not found.</p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-ink">{evidence.test_case.name}</h1>
              <StatusBadge status={evidence.test_case.status} />
            </div>
            {diagnosis && <div className="mb-6">{<TaxonomyChip category={diagnosis.category} />}</div>}

            <div className="mb-6 flex gap-6 border-b border-line">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 pb-3 text-sm font-medium capitalize transition-colors ${
                    tab === t ? 'border-iv-blue text-iv-blue' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className={showRail ? 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]' : ''}>
              <div>
                {tab === 'evidence' && (
                  <>
                    <Card className="mb-6">
                      <p className="mb-2 text-sm font-medium text-ink">Stack trace</p>
                      <StackTraceViewer text={evidence.test_case.stack_trace} highlightedLine={highlightedLine} />
                    </Card>
                    <p className="mb-2 text-sm font-medium text-ink">Artifacts</p>
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

                {tab === 'diagnosis' &&
                  (!diagnosis ? (
                    <Card>
                      <p className="mb-3 text-sm text-muted">No diagnosis yet for this test case.</p>
                      <Button fullWidth={false} className="px-4" onClick={handleInvestigate} isLoading={isInvestigating}>
                        Investigate with AI
                      </Button>
                      {investigateError && (
                        <div className="mt-2">
                          <FormMessage>{investigateError}</FormMessage>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <>
                      <Card className="mb-6">
                        <ConfidenceMeter score={diagnosis.confidence_score} />
                      </Card>
                      <Card className="mb-6">
                        <p className="text-xs text-muted">
                          {diagnosis.model_provider} / {diagnosis.model_name} · prompt {diagnosis.prompt_version}
                        </p>
                        {diagnosis.evidence.secrets_redacted > 0 && (
                          <p className="mt-2 text-xs text-muted">
                            {diagnosis.evidence.secrets_redacted} secret value(s) were redacted before this evidence
                            was sent to the model.
                          </p>
                        )}
                      </Card>

                      {diagnosis.status === 'pending' ? (
                        <Card>
                          <p className="mb-3 text-sm font-medium text-ink">Reviewer action</p>
                          <div className="mb-3 flex gap-3">
                            <Button fullWidth={false} className="px-4" onClick={() => handleReview('accept')} isLoading={isReviewing}>
                              Accept
                            </Button>
                            <Button
                              variant="secondary"
                              fullWidth={false} className="px-4"
                              onClick={() => handleReview('reject')}
                              isLoading={isReviewing}
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
                              fullWidth={false} className="px-4"
                              onClick={() => handleReview('correct')}
                              isLoading={isReviewing}
                            >
                              Correct
                            </Button>
                          </div>
                          {reviewError && (
                            <div className="mt-2">
                              <FormMessage>{reviewError}</FormMessage>
                            </div>
                          )}
                        </Card>
                      ) : (
                        <Button fullWidth={false} className="px-4" onClick={() => setTab('export')}>
                          Create defect export
                        </Button>
                      )}
                    </>
                  ))}

                {tab === 'history' &&
                  (!history ? (
                    <LoadingIndicator />
                  ) : history.length === 0 ? (
                    <Card>
                      <p className="text-sm text-muted">No history yet for this test case.</p>
                    </Card>
                  ) : (
                    <Card className="divide-y divide-line p-0">
                      {history.map((h, i) => (
                        <div key={i} className="px-4 py-3">
                          <p className="text-sm text-ink">{ACTION_LABELS[h.action] ?? h.action}</p>
                          <p className="text-xs text-muted">
                            {h.actor_email ?? 'system'} · {new Date(h.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </Card>
                  ))}

                {tab === 'export' && <ExportDraftForm testCaseId={testCaseId ? Number(testCaseId) : null} />}
              </div>

              {showRail && (
                <div>
                  <EvidenceRail
                    citations={diagnosis.evidence.citations}
                    selectedIndex={selectedCitation}
                    onSelect={handleSelectCitation}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
