import api from './api';

export interface SearchResults {
  runs: { id: number; external_run_id: string; status: string }[];
  test_cases: { id: number; run_id: number; name: string; status: string }[];
  failure_groups: { id: number; title: string; signature_hash: string }[];
}

export async function search(query: string): Promise<SearchResults> {
  const { data } = await api.get<SearchResults>('/api/search', { params: { q: query } });
  return data;
}
