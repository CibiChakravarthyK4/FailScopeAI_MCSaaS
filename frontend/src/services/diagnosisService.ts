import api from './api';
import type { Diagnosis, DiagnosisListItem, FailureGroup } from '../types';

export async function runDiagnosis(testCaseId: number): Promise<Diagnosis> {
  const { data } = await api.post<Diagnosis>(`/api/diagnoses/${testCaseId}/run`);
  return data;
}

export async function getDiagnosis(diagnosisId: number): Promise<Diagnosis> {
  const { data } = await api.get<Diagnosis>(`/api/diagnoses/${diagnosisId}`);
  return data;
}

export async function listPendingDiagnoses(): Promise<DiagnosisListItem[]> {
  const { data } = await api.get<DiagnosisListItem[]>('/api/diagnoses', { params: { status: 'pending' } });
  return data;
}

export async function submitReview(
  diagnosisId: number,
  action: 'accept' | 'reject' | 'correct',
  correctedCategory?: string,
  reason?: string
): Promise<void> {
  await api.post(`/api/diagnoses/${diagnosisId}/review`, {
    action,
    corrected_category: correctedCategory,
    reason,
  });
}

export async function listFailureGroups(): Promise<FailureGroup[]> {
  const { data } = await api.get<FailureGroup[]>('/api/failure-groups');
  return data;
}

export async function mergeGroups(sourceGroupId: number, targetGroupId: number): Promise<FailureGroup> {
  const { data } = await api.post<FailureGroup>(`/api/failure-groups/${sourceGroupId}/merge`, {
    target_group_id: targetGroupId,
  });
  return data;
}

export async function splitGroup(
  groupId: number,
  testCaseIds: number[],
  newTitle: string
): Promise<FailureGroup> {
  const { data } = await api.post<FailureGroup>(`/api/failure-groups/${groupId}/split`, {
    test_case_ids: testCaseIds,
    new_title: newTitle,
  });
  return data;
}
