import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/ui/FormMessage';
import { importRun } from '../services/runService';

export function RunImportPage() {
  const navigate = useNavigate();
  const [externalRunId, setExternalRunId] = useState('');
  const [buildId, setBuildId] = useState('');
  const [environment, setEnvironment] = useState('');
  const [junitFile, setJunitFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!junitFile) {
      setError('A JUnit XML file is required.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const run = await importRun({ externalRunId, buildId, environment, junitFile, attachments });
      navigate(`/runs/${run.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not import this run. Check the JUnit XML file is valid.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold text-ink">Import a failed run</h1>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Run ID"
              value={externalRunId}
              onChange={(e) => setExternalRunId(e.target.value)}
              placeholder="build-104"
              required
            />
            <Input label="Build ID" value={buildId} onChange={(e) => setBuildId(e.target.value)} />
            <Input
              label="Environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder="staging"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">JUnit XML file</label>
              <input
                type="file"
                accept=".xml"
                required
                onChange={(e) => setJunitFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-md border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Logs / screenshots (optional)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
                className="w-full rounded-md border border-line px-3 py-2 text-sm"
              />
            </div>
            {error && <FormMessage>{error}</FormMessage>}
            <Button type="submit" isLoading={isLoading}>
              Import
            </Button>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
