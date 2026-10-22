export type UserRole = 'admin' | 'analyst' | 'reviewer' | 'viewer';

export interface User {
  id: number;
  tenant_id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  tenant_name: string;
  needs_legal_acceptance: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type RunStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
export type TestCaseStatus = 'failed' | 'error' | 'skipped';
export type ArtifactType = 'log' | 'screenshot' | 'trace';

export interface TestCase {
  id: number;
  name: string;
  classname: string | null;
  status: TestCaseStatus;
  duration_ms: number | null;
  stack_trace: string | null;
}

export interface Run {
  id: number;
  external_run_id: string;
  build_id: string | null;
  branch: string | null;
  environment: string | null;
  source_type: string;
  status: RunStatus;
  created_at: string;
  failure_count: number;
  imported_by_email: string | null;
}

export interface RunDetail extends Run {
  test_cases: TestCase[];
}

export interface Artifact {
  id: number;
  type: ArtifactType;
  storage_path: string;
  checksum_sha256: string;
  redacted: boolean;
}

export interface Evidence {
  test_case: TestCase;
  artifacts: Artifact[];
  diagnoses: Diagnosis[];
}

export interface HistoryEntry {
  action: string;
  actor_email: string | null;
  entity_type: string;
  entity_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type FailureCategory =
  | 'application_bug'
  | 'script_issue'
  | 'data_issue'
  | 'environment'
  | 'integration'
  | 'unknown';

export interface Diagnosis {
  id: number;
  test_case_id: number;
  run_id: number;
  category: FailureCategory;
  confidence_score: number;
  evidence: { citations: string[]; secrets_redacted: number };
  model_provider: string;
  model_name: string;
  prompt_version: string;
  status: 'pending' | 'reviewed';
  created_at: string;
}

export interface FailureGroup {
  id: number;
  title: string;
  signature_hash: string;
  created_at: string;
  member_count: number;
}

export interface DiagnosisListItem extends Diagnosis {
  test_case_name: string;
}

export interface DefectExport {
  id: number;
  title: string;
  steps: string;
  expected_result: string;
  actual_result: string;
  evidence_refs: { test_cases: { test_case_id: number; artifact_ids: number[] }[] };
  jira_issue_key: string | null;
  status: 'draft' | 'published';
  created_at: string;
}
