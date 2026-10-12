import api from './api';

export interface TenantSummary {
  id: number;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  user_count: number;
  run_count: number;
}

export interface PlatformUsage {
  tenant_count: number;
  total_runs: number;
  total_diagnoses: number;
  total_storage_bytes: number;
  total_cost_estimate_usd: number;
  period: string;
}

export async function listTenants(): Promise<TenantSummary[]> {
  const { data } = await api.get<TenantSummary[]>('/api/platform/tenants');
  return data;
}

export async function getPlatformUsage(): Promise<PlatformUsage> {
  const { data } = await api.get<PlatformUsage>('/api/platform/usage');
  return data;
}
