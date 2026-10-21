import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ExportDraftForm } from '../components/export/ExportDraftForm';

// Standalone route for exports not scoped to a single test case's case file
// (e.g. exporting a whole failure group). Single-test-case exports normally
// happen inside the case file's Export tab (CaseFilePage) instead.
export function ExportDraftPage() {
  const [params] = useSearchParams();
  const testCaseId = params.get('test_case_id');

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Defect export</h1>
        <ExportDraftForm testCaseId={testCaseId ? Number(testCaseId) : null} />
      </div>
    </PageWrapper>
  );
}
