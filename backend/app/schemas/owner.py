from datetime import date, datetime

from pydantic import BaseModel

from app.models.career_application import CareerApplicationStatus


class OwnerLoginRequest(BaseModel):
    email: str
    password: str
    totp_code: str


class OwnerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ClientSummary(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime
    admin_emails: list[str]
    user_count: int
    run_count: int
    plan: str
    billing_price_usd: float | None
    billing_purchase_date: date | None
    billing_renewal_date: date | None
    billing_status: str
    billing_payment_reference: str | None
    billing_notes: str | None
    usage_job_runs: int
    usage_storage_bytes: int
    usage_tokens: int


class OwnerUsageResponse(BaseModel):
    tenant_count: int
    total_runs: int
    total_diagnoses: int
    total_storage_bytes: int
    total_cost_estimate_usd: float
    period: str


class BillingReportRow(BaseModel):
    tenant_id: int
    tenant_name: str
    plan: str
    status: str
    price_usd: float | None
    purchase_date: date | None
    renewal_date: date | None
    renewal_due_soon: bool
    expired: bool
    usage_job_runs: int
    usage_storage_bytes: int


class BillingReportResponse(BaseModel):
    generated_at: datetime
    total_revenue_usd: float
    outstanding_usd: float
    renewals_due_count: int
    expired_count: int
    rows: list[BillingReportRow]


class CareerApplicationSummary(BaseModel):
    id: int
    role: str
    name: str
    email: str
    status: CareerApplicationStatus
    created_at: datetime

    class Config:
        from_attributes = True


class CareerApplicationDetail(CareerApplicationSummary):
    phone: str | None
    links: str | None
    note: str | None
    resume_original_filename: str


class CareerApplicationStatusUpdate(BaseModel):
    status: CareerApplicationStatus
