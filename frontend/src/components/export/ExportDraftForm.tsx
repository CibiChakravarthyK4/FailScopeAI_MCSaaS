import { useState, FormEvent } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FormMessage } from '../ui/FormMessage';
import { createExport, publishExport } from '../../services/exportService';
import type { DefectExport } from '../../types';

// The export journey's content, with no page chrome - used both standalone
// (ExportDraftPage, driven by a ?test_case_id= query param) and embedded as
// the "Export" tab of the case-file page (CaseFilePage), driven by a prop.
export function ExportDraftForm({ testCaseId }: { testCaseId: number | null }) {
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [draft, setDraft] = useState<DefectExport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDraft = async (e: FormEvent) => {
    e.preventDefault();
    if (!testCaseId) {
      setError('Missing test_case_id in the URL.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await createExport({ testCaseId, title, steps, expectedResult, actualResult });
      setDraft(result);
    } catch {
      setError('Could not create the defect draft.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!draft) return;
    setIsLoading(true);
    try {
      const published = await publishExport(draft.id);
      setDraft(published);
    } catch {
      setError('Could not publish this defect.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!draft) {
    return (
      <Card>
        <form onSubmit={handleCreateDraft} className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div>
            <label htmlFor="export-steps" className="mb-1 block text-sm font-medium text-ink">
              Steps
            </label>
            <textarea
              id="export-steps"
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
              rows={4}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              required
            />
          </div>
          <Input label="Expected result" value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} required />
          <Input label="Actual result" value={actualResult} onChange={(e) => setActualResult(e.target.value)} required />
          {error && <FormMessage>{error}</FormMessage>}
          <Button type="submit" isLoading={isLoading}>
            Create draft
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <p className="mb-1 text-sm text-muted">Draft #{draft.id}</p>
      <h2 className="mb-4 text-lg font-medium text-ink">{draft.title}</h2>
      <p className="mb-1 text-sm font-medium text-ink">Steps</p>
      <p className="mb-4 text-sm text-ink">{draft.steps}</p>
      <p className="mb-1 text-sm font-medium text-ink">Expected</p>
      <p className="mb-4 text-sm text-ink">{draft.expected_result}</p>
      <p className="mb-1 text-sm font-medium text-ink">Actual</p>
      <p className="mb-6 text-sm text-ink">{draft.actual_result}</p>

      {draft.status === 'published' ? (
        <FormMessage variant="success">Published as {draft.jira_issue_key}</FormMessage>
      ) : (
        <Button fullWidth={false} className="px-4" onClick={handlePublish} isLoading={isLoading}>
          Publish to Jira (sandbox)
        </Button>
      )}
      {error && (
        <div className="mt-2">
          <FormMessage>{error}</FormMessage>
        </div>
      )}
    </Card>
  );
}
