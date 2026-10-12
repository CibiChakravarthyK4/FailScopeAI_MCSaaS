from datetime import datetime

from pydantic import BaseModel


class GroupSummary(BaseModel):
    id: int
    title: str
    created_at: datetime
    member_count: int
    pending_count: int
    resolved: bool


class MetricsResponse(BaseModel):
    total_diagnoses: int
    pending_review: int
    reviewed: int
    accepted: int
    rejected: int
    corrected: int
    reviewer_agreement_rate: float | None
    note: str


class UsageResponse(BaseModel):
    period: str
    jobs_count: int
    model_tokens_in: int
    model_tokens_out: int
    cost_estimate_usd: float
    cost_ceiling_usd: float
    total_storage_bytes: int
    storage_quota_bytes: int
