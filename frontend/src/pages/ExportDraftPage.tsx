import { useState, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { createExport, publishExport } from '../services/exportService';
import type { DefectExport } from '../types';

export function ExportDraftPage() {
  const [params] = useSearchParams();
  const testCaseId = params.get('test_case_id');

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
      const result = await createExport({
        testCaseId: Number(testCaseId),
        title,
        steps,
        expectedResult,
        actualResult,
      });
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

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Defect export</h1>

        {!draft ? (
          <Card>
            <form onSubmit={handleCreateDraft} className="space-y-4">
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Steps</label>
                <textarea
                  className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  rows={4}
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Expected result"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                required
              />
              <Input
                label="Actual result"
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" isLoading={isLoading}>
                Create draft
              </Button>
            </form>
          </Card>
        ) : (
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
              <p className="text-sm font-medium text-green-700">Published as {draft.jira_issue_key}</p>
            ) : (
              <Button className="w-auto px-4" onClick={handlePublish} isLoading={isLoading}>
                Publish to Jira (sandbox)
              </Button>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
