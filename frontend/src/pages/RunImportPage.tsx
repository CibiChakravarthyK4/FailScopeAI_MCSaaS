import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/app/AppLayout';
import { PageContainer } from '../components/app/PageContainer';
import { PageHeader } from '../components/app/PageHeader';
import { Stepper } from '../components/app/Stepper';
import { FileDropzone } from '../components/app/FileDropzone';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/ui/FormMessage';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TraceRing } from '../components/ui/TraceRing';
import { importRun, getRun } from '../services/runService';
import { parseJunitPreview, type JunitPreview } from '../utils/junitPreview';
import { validateXml, validateAttachments } from '../utils/uploadValidation';
import type { RunStatus } from '../types';

const STEPS = ['Upload', 'Details', 'Confirm'];
const ENVIRONMENTS = ['Development', 'Staging', 'QA', 'Production'];

type WizardStep = 0 | 1 | 2;

export function RunImportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(0);

  // Step 1: Upload
  const [junitFile, setJunitFile] = useState<File | null>(null);
  const [junitError, setJunitError] = useState<string | null>(null);
  const [preview, setPreview] = useState<JunitPreview | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // Step 2: Details
  const [runName, setRunName] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [environment, setEnvironment] = useState('Development');
  const [customEnvironment, setCustomEnvironment] = useState('');
  const [detailsTouched, setDetailsTouched] = useState(false);

  // Submit + progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [importedRunId, setImportedRunId] = useState<number | null>(null);
  const [importedExternalId, setImportedExternalId] = useState<string>('');
  const [pollStatus, setPollStatus] = useState<RunStatus | null>(null);

  const handleJunitChange = async (files: File[]) => {
    const file = files[0] ?? null;
    setJunitFile(file);
    setPreview(null);
    if (!file) {
      setJunitError(null);
      return;
    }
    const error = validateXml(file);
    setJunitError(error);
    if (error) return;

    const text = await file.text();
    const parsed = parseJunitPreview(text);
    if (!parsed) {
      setJunitError('This file does not look like a valid JUnit XML report.');
      return;
    }
    setPreview(parsed);
    if (!detailsTouched) {
      setRunName(file.name.replace(/\.xml$/i, ''));
    }
  };

  const handleAttachmentsChange = (files: File[]) => {
    setAttachments(files);
    setAttachmentError(validateAttachments(files));
  };

  const canGoToDetails = junitFile != null && !junitError && !attachmentError && preview != null;
  const canGoToConfirm = runName.trim().length > 0;
  const effectiveEnvironment = environment === 'Other' ? customEnvironment.trim() : environment;

  const handleSubmit = async () => {
    if (!junitFile) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const run = await importRun({
        externalRunId: runName.trim(),
        buildId: buildNumber.trim() || undefined,
        branch: branch.trim() || undefined,
        environment: effectiveEnvironment || undefined,
        junitFile,
        attachments,
      });
      setImportedRunId(run.id);
      setImportedExternalId(run.external_run_id);
      setPollStatus(run.status);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not import this run. Check the JUnit XML file is valid.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (importedRunId == null || !pollStatus) return;
    if (pollStatus !== 'pending' && pollStatus !== 'processing') return;
    const timer = setTimeout(() => {
      getRun(importedRunId).then((run) => setPollStatus(run.status));
    }, 1500);
    return () => clearTimeout(timer);
  }, [importedRunId, pollStatus]);

  const isImported = importedRunId != null;
  const isTerminal = pollStatus === 'completed' || pollStatus === 'failed' || pollStatus === 'partial';

  if (isImported) {
    return (
      <AppLayout>
        <PageContainer>
          <PageHeader
            breadcrumbs={[{ label: 'Runs', to: '/runs' }, { label: 'Import run' }]}
            title="Importing your run"
          />
          <Card className="mx-auto max-w-[880px]">
            <div className="flex flex-col items-center py-8 text-center">
              <TraceRing size={40} spinning={!isTerminal} />
              <p className="mt-4 font-medium text-ink">{importedExternalId}</p>
              <div className="mt-3">{pollStatus && <StatusBadge status={pollStatus} />}</div>

              {!isTerminal && (
                <p className="mt-4 max-w-sm text-sm text-muted">
                  You can leave this page; we'll keep working.
                </p>
              )}

              {pollStatus === 'completed' && (
                <div className="mt-6 flex gap-3">
                  <Button fullWidth={false} className="px-4" onClick={() => navigate(`/runs/${importedRunId}`)}>
                    Open run
                  </Button>
                  <Button variant="secondary" fullWidth={false} className="px-4" onClick={() => window.location.reload()}>
                    Import another
                  </Button>
                </div>
              )}

              {(pollStatus === 'failed' || pollStatus === 'partial') && (
                <>
                  <p className="mt-4 max-w-sm text-sm text-muted">
                    {pollStatus === 'failed'
                      ? 'This import could not be completed.'
                      : 'Some files in this import could not be processed.'}
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button fullWidth={false} className="px-4" onClick={() => navigate(`/runs/${importedRunId}`)}>
                      Open run
                    </Button>
                    <Button variant="secondary" fullWidth={false} className="px-4" onClick={() => window.location.reload()}>
                      Import another
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer>
        <PageHeader
          breadcrumbs={[{ label: 'Runs', to: '/runs' }, { label: 'Import run' }]}
          title="Import a failed run"
          description="Upload your JUnit XML results. Add logs and screenshots for stronger evidence."
        />

        <div className="mx-auto max-w-[880px]">
          <Stepper steps={STEPS} currentIndex={step} />

          <Card>
            {step === 0 && (
              <div className="space-y-6">
                <FileDropzone
                  label="JUnit XML (required)"
                  helperText=".xml up to 25 MB"
                  accept=".xml"
                  required
                  files={junitFile ? [junitFile] : []}
                  onFilesChange={handleJunitChange}
                  error={junitError}
                />
                {preview && (
                  <FormMessage variant="success">
                    {preview.testCount} test{preview.testCount === 1 ? '' : 's'} found, {preview.failureCount}{' '}
                    failure{preview.failureCount === 1 ? '' : 's'}.
                  </FormMessage>
                )}

                <FileDropzone
                  label="Logs and screenshots (optional)"
                  helperText=".log, .txt, .png, .jpg up to 10 MB each"
                  accept=".log,.txt,.png,.jpg,.jpeg"
                  multiple
                  files={attachments}
                  onFilesChange={handleAttachmentsChange}
                  error={attachmentError}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Run name"
                  helperText="Prefilled from your file name - edit if you'd like a clearer label."
                  value={runName}
                  onChange={(e) => {
                    setRunName(e.target.value);
                    setDetailsTouched(true);
                  }}
                  required
                />
                <p className="text-xs text-muted">A unique run ID will be assigned automatically when you import.</p>

                <Input
                  label="Build number"
                  placeholder="e.g. 1042"
                  helperText="Your CI build or pipeline number, if you have one."
                  value={buildNumber}
                  onChange={(e) => setBuildNumber(e.target.value)}
                />

                <Input
                  label="Branch"
                  placeholder="e.g. main"
                  helperText="Optional."
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />

                <div>
                  <label htmlFor="environment" className="mb-1 block text-sm font-medium text-ink">
                    Environment
                  </label>
                  <select
                    id="environment"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  >
                    {ENVIRONMENTS.map((env) => (
                      <option key={env} value={env}>
                        {env}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {environment === 'Other' && (
                    <Input
                      label="Custom environment"
                      className="mt-2"
                      value={customEnvironment}
                      onChange={(e) => setCustomEnvironment(e.target.value)}
                    />
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  We'll parse the results, collect the evidence and prepare a suggested diagnosis for review.
                </p>
                <dl className="divide-y divide-line rounded-md border border-line text-sm">
                  <div className="flex justify-between px-4 py-2.5">
                    <dt className="text-muted">Run name</dt>
                    <dd className="font-medium text-ink">{runName}</dd>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <dt className="text-muted">Build</dt>
                    <dd className="text-ink">{buildNumber || '—'}</dd>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <dt className="text-muted">Environment</dt>
                    <dd className="text-ink">{effectiveEnvironment || '—'}</dd>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <dt className="text-muted">JUnit file</dt>
                    <dd className="text-ink">{junitFile?.name}</dd>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <dt className="text-muted">Attachments</dt>
                    <dd className="text-ink">{attachments.length}</dd>
                  </div>
                  {preview && (
                    <div className="flex justify-between px-4 py-2.5">
                      <dt className="text-muted">Tests / failures found</dt>
                      <dd className="text-ink">
                        {preview.testCount} / {preview.failureCount}
                      </dd>
                    </div>
                  )}
                </dl>
                {submitError && <FormMessage>{submitError}</FormMessage>}
              </div>
            )}
          </Card>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-4"
              onClick={() => (step === 0 ? navigate('/runs') : setStep((s) => (s - 1) as WizardStep))}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < 2 ? (
              <Button
                fullWidth={false}
                className="px-4"
                disabled={step === 0 ? !canGoToDetails : !canGoToConfirm}
                onClick={() => setStep((s) => (s + 1) as WizardStep)}
              >
                Next
              </Button>
            ) : (
              <Button fullWidth={false} className="px-4" isLoading={isSubmitting} onClick={handleSubmit}>
                Start analysis
              </Button>
            )}
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
