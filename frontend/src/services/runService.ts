import api from './api';
import type { Run, RunDetail, Evidence } from '../types';

export async function listRuns(): Promise<Run[]> {
  const { data } = await api.get<Run[]>('/api/runs');
  return data;
}

export async function getRun(runId: number): Promise<RunDetail> {
  const { data } = await api.get<RunDetail>(`/api/runs/${runId}`);
  return data;
}

export async function getEvidence(runId: number, testCaseId: number): Promise<Evidence> {
  const { data } = await api.get<Evidence>(`/api/runs/${runId}/tests/${testCaseId}/evidence`);
  return data;
}

export async function importRun(form: {
  externalRunId: string;
  buildId?: string;
  environment?: string;
  junitFile: File;
  attachments: File[];
}): Promise<Run> {
  const body = new FormData();
  body.append('external_run_id', form.externalRunId);
  if (form.buildId) body.append('build_id', form.buildId);
  if (form.environment) body.append('environment', form.environment);
  body.append('junit_file', form.junitFile);
  form.attachments.forEach((file) => body.append('attachments', file));

  const { data } = await api.post<Run>('/api/runs/import', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
