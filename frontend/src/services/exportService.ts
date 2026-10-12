import api from './api';
import type { DefectExport } from '../types';

export async function createExport(form: {
  testCaseId: number;
  title: string;
  steps: string;
  expectedResult: string;
  actualResult: string;
}): Promise<DefectExport> {
  const { data } = await api.post<DefectExport>('/api/exports', {
    test_case_id: form.testCaseId,
    title: form.title,
    steps: form.steps,
    expected_result: form.expectedResult,
    actual_result: form.actualResult,
  });
  return data;
}

export async function publishExport(exportId: number): Promise<DefectExport> {
  const { data } = await api.post<DefectExport>(`/api/exports/${exportId}/publish`);
  return data;
}
