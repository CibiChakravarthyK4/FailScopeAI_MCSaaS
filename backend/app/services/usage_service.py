from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import ForbiddenError
from app.models.usage_record import UsageRecord


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


def check_cost_ceiling(db: Session, tenant_id: int) -> None:
    record = _get_or_create(db, tenant_id)
    if record.cost_estimate_usd >= settings.MODEL_COST_CEILING_USD:
        raise ForbiddenError(
            f"Monthly model cost ceiling (${settings.MODEL_COST_CEILING_USD:.2f}) reached for this workspace"
        )


def record_model_call(db: Session, tenant_id: int, tokens_in: int, tokens_out: int, cost_usd: float) -> None:
    record = _get_or_create(db, tenant_id)
    record.jobs_count += 1
    record.model_tokens_in += tokens_in
    record.model_tokens_out += tokens_out
    record.cost_estimate_usd += cost_usd
    db.commit()
