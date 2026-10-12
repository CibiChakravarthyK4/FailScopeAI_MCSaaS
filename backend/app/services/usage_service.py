from datetime import UTC, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.exceptions import ForbiddenError, NotFoundError
from app.models.artifact import Artifact
from app.models.tenant import Tenant
from app.models.usage_record import UsageRecord
from app.services.billing_service import get_plan_limits


def current_period() -> str:
    now = datetime.now(UTC)
    return f"{now.year:04d}-{now.month:02d}"


def _get_or_create(db: Session, tenant_id: int) -> UsageRecord:
    period = current_period()
    record = (
        db.query(UsageRecord)
        .filter(UsageRecord.tenant_id == tenant_id, UsageRecord.period == period)
        .first()
    )
    if not record:
        record = UsageRecord(tenant_id=tenant_id, period=period)
        db.add(record)
        db.flush()
    return record


def _get_plan_limits_for_tenant(db: Session, tenant_id: int) -> dict:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise NotFoundError("Tenant")
    return get_plan_limits(tenant.plan)


def check_cost_ceiling(db: Session, tenant_id: int) -> None:
    limits = _get_plan_limits_for_tenant(db, tenant_id)
    record = _get_or_create(db, tenant_id)
    if record.cost_estimate_usd >= limits["cost_ceiling_usd"]:
        raise ForbiddenError(
            f"Monthly model cost ceiling (${limits['cost_ceiling_usd']:.2f}) reached for this workspace. "
            "Upgrade your plan to raise it."
        )


def record_model_call(db: Session, tenant_id: int, tokens_in: int, tokens_out: int, cost_usd: float) -> None:
    record = _get_or_create(db, tenant_id)
    record.jobs_count += 1
    record.model_tokens_in += tokens_in
    record.model_tokens_out += tokens_out
    record.cost_estimate_usd += cost_usd
    db.commit()


def get_total_storage_bytes(db: Session, tenant_id: int) -> int:
    """Storage is a running total, not a monthly flow, so it's computed live from
    the artifacts table rather than an incrementable counter that could drift."""
    total = db.query(func.sum(Artifact.size_bytes)).filter(Artifact.tenant_id == tenant_id).scalar()
    return int(total or 0)


def check_storage_quota(db: Session, tenant_id: int, incoming_bytes: int) -> None:
    limits = _get_plan_limits_for_tenant(db, tenant_id)
    quota_bytes = limits["storage_mb"] * 1024 * 1024
    current_total = get_total_storage_bytes(db, tenant_id)
    if current_total + incoming_bytes > quota_bytes:
        raise ForbiddenError(
            f"This import would exceed the workspace storage quota ({limits['storage_mb']} MB). "
            "Delete old runs or upgrade your plan."
        )
