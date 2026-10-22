import api from './api';
import type { TokenResponse, User } from '../types';

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  tenantName: string,
  acceptedTerms: boolean,
  fullName?: string
): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/register', {
    email,
    password,
    tenant_name: tenantName,
    full_name: fullName,
    accepted_terms: acceptedTerms,
  });
  return data;
}

export async function acceptLegal(): Promise<void> {
  await api.post('/auth/accept-legal');
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refresh_token: refreshToken });
}

export function googleLoginUrl(): string {
  return `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/auth/google/login`;
}
