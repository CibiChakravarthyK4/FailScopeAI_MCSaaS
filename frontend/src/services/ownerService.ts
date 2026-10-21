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
