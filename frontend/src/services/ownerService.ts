import ownerApi from './ownerApi';

export interface ClientSummary {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  admin_emails: string[];
  user_count: number;
  run_count: number;
  plan: string;
  billing_price_usd: number | null;
  billing_purchase_date: string | null;
  billing_renewal_date: string | null;
  billing_status: string;
  billing_payment_reference: string | null;
  billing_notes: string | null;
  usage_job_runs: number;
  usage_storage_bytes: number;
  usage_tokens: number;
}

export interface OwnerUsage {
  tenant_count: number;
  total_runs: number;
  total_diagnoses: number;
  total_storage_bytes: number;
  total_cost_estimate_usd: number;
  period: string;
}

export interface BillingReportRow {
  tenant_id: number;
  tenant_name: string;
  plan: string;
  status: string;
  price_usd: number | null;
  purchase_date: string | null;
  renewal_date: string | null;
  renewal_due_soon: boolean;
  expired: boolean;
  usage_job_runs: number;
  usage_storage_bytes: number;
}

export interface BillingReport {
  generated_at: string;
  total_revenue_usd: number;
  outstanding_usd: number;
  renewals_due_count: number;
  expired_count: number;
  rows: BillingReportRow[];
}

export async function ownerLogin(email: string, password: string, totpCode: string): Promise<string> {
  const { data } = await ownerApi.post<{ access_token: string }>('/api/owner/auth/login', {
    email,
    password,
    totp_code: totpCode,
  });
  return data.access_token;
}

export async function listClients(): Promise<ClientSummary[]> {
  const { data } = await ownerApi.get<ClientSummary[]>('/api/owner/clients');
  return data;
}

export async function getOwnerUsage(): Promise<OwnerUsage> {
  const { data } = await ownerApi.get<OwnerUsage>('/api/owner/usage');
  return data;
}

export async function getBillingReport(): Promise<BillingReport> {
  const { data } = await ownerApi.get<BillingReport>('/api/owner/billing-report');
  return data;
}

export type CareerApplicationStatus = 'new' | 'reviewed';

export interface CareerApplicationSummary {
  id: number;
  role: string;
  name: string;
  email: string;
  status: CareerApplicationStatus;
  created_at: string;
}

export interface CareerApplicationDetail extends CareerApplicationSummary {
  phone: string | null;
  links: string | null;
  note: string | null;
  resume_original_filename: string;
}

export async function listCareerApplications(): Promise<CareerApplicationSummary[]> {
  const { data } = await ownerApi.get<CareerApplicationSummary[]>('/api/owner/careers/applications');
  return data;
}

export async function getCareerApplication(id: number): Promise<CareerApplicationDetail> {
  const { data } = await ownerApi.get<CareerApplicationDetail>(`/api/owner/careers/applications/${id}`);
  return data;
}

export async function updateCareerApplicationStatus(
  id: number,
  status: CareerApplicationStatus
): Promise<CareerApplicationDetail> {
  const { data } = await ownerApi.patch<CareerApplicationDetail>(`/api/owner/careers/applications/${id}/status`, {
    status,
  });
  return data;
}

export async function downloadCareerApplicationResume(id: number, filename: string): Promise<void> {
  const { data } = await ownerApi.get(`/api/owner/careers/applications/${id}/resume`, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadBillingReportCsv(): Promise<void> {
  // A plain <a href> download wouldn't carry the owner's bearer token (the API
  // has no cookie-based session), so the CSV is fetched with auth attached and
  // handed to the browser as a blob instead.
  const { data } = await ownerApi.get('/api/owner/billing-report.csv', { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'billing-report.csv';
  link.click();
  URL.revokeObjectURL(url);
}
