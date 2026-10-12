from datetime import datetime

from pydantic import BaseModel


class TenantSummary(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    created_at: datetime
    user_count: int
    run_count: int


class PlatformUsageResponse(BaseModel):
    tenant_count: int
    total_runs: int
    total_diagnoses: int
    total_storage_bytes: int
    total_cost_estimate_usd: float
    period: str
