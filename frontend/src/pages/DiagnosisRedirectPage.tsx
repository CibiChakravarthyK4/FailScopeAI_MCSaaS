import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { LoadingIndicator } from '../components/ui/TraceRing';
import { getDiagnosis } from '../services/diagnosisService';

// /diagnoses/:diagnosisId is a deep link (used by ReviewQueuePage) into the
// case file's Diagnosis tab - there's no standalone diagnosis page anymore
// (CLAUDE.md 4.3 "case-file layout"), so this just resolves run_id/test_case_id
// and redirects.
export function DiagnosisRedirectPage() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const [target, setTarget] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!diagnosisId) return;
    getDiagnosis(Number(diagnosisId))
      .then((d) => setTarget(`/runs/${d.run_id}/tests/${d.test_case_id}?tab=diagnosis`))
      .catch(() => setNotFound(true));
  }, [diagnosisId]);

  if (notFound) return <Navigate to="/review-queue" replace />;
  if (!target) return <LoadingIndicator />;
  return <Navigate to={target} replace />;
}
