import api from './api';

export interface BillingStatus {
  configured: boolean;
  plan: string;
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const { data } = await api.get<BillingStatus>('/api/billing/status');
  return data;
}

export async function startCheckout(): Promise<string> {
  const { data } = await api.post<{ checkout_url: string }>('/api/billing/checkout');
  return data.checkout_url;
}
