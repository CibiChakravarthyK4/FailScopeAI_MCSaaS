import api from './api';

export interface GroupSummary {
  id: number;
  title: string;
  created_at: string;
  member_count: number;
  pending_count: number;
  resolved: boolean;
}

export interface Metrics {
  total_diagnoses: number;
  pending_review: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  corrected: number;
  reviewer_agreement_rate: number | null;
  note: string;
}

export interface Usage {
  period: string;
  jobs_count: number;
  storage_bytes: number;
  model_tokens_in: number;
  model_tokens_out: number;
  cost_estimate_usd: number;
  cost_ceiling_usd: number;
}

export async function getUnresolvedGroups(): Promise<GroupSummary[]> {
  const { data } = await api.get<GroupSummary[]>('/api/dashboard/groups', { params: { unresolved_only: true } });
  return data;
}

export async function getMetrics(): Promise<Metrics> {
  const { data } = await api.get<Metrics>('/api/dashboard/metrics');
  return data;
}

export async function getUsage(): Promise<Usage> {
  const { data } = await api.get<Usage>('/api/usage');
  return data;
}
