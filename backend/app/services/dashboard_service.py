from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.models.diagnosis import Diagnosis, DiagnosisStatus
from app.models.failure_group import FailureGroup, FailureGroupMember
from app.models.review import Review, ReviewAction
from app.models.usage_record import UsageRecord
from app.services.usage_service import current_period, get_total_storage_bytes


def list_group_summaries(db: Session, tenant_id: int, unresolved_only: bool, max_age_days: int | None) -> list[dict]:
    groups = db.query(FailureGroup).filter(FailureGroup.tenant_id == tenant_id).all()
    summaries = []
    now = datetime.now(UTC)

    for group in groups:
        members = (
            db.query(FailureGroupMember)
            .filter(FailureGroupMember.group_id == group.id, FailureGroupMember.removed_at.is_(None))
            .all()
        )
        if not members:
            continue

        test_case_ids = [m.test_case_id for m in members]
        pending_count = (
            db.query(Diagnosis)
            .filter(Diagnosis.test_case_id.in_(test_case_ids), Diagnosis.status == DiagnosisStatus.pending)
            .count()
        )
        resolved = pending_count == 0

        if unresolved_only and resolved:
            continue

        age_days = (now - group.created_at).days
        if max_age_days is not None and age_days > max_age_days:
            continue

        summaries.append(
            {
                "id": group.id,
                "title": group.title,
                "created_at": group.created_at,
                "member_count": len(members),
                "pending_count": pending_count,
                "resolved": resolved,
            }
        )

    return summaries


def compute_metrics(db: Session, tenant_id: int) -> dict:
    total = db.query(Diagnosis).filter(Diagnosis.tenant_id == tenant_id).count()
    pending = (
        db.query(Diagnosis)
        .filter(Diagnosis.tenant_id == tenant_id, Diagnosis.status == DiagnosisStatus.pending)
        .count()
    )
    reviewed = total - pending

    accepted = db.query(Review).filter(Review.tenant_id == tenant_id, Review.action == ReviewAction.accept).count()
    rejected = db.query(Review).filter(Review.tenant_id == tenant_id, Review.action == ReviewAction.reject).count()
    corrected = db.query(Review).filter(Review.tenant_id == tenant_id, Review.action == ReviewAction.correct).count()

    total_reviewed_actions = accepted + rejected + corrected
    agreement_rate = (accepted / total_reviewed_actions) if total_reviewed_actions else None

    return {
        "total_diagnoses": total,
        "pending_review": pending,
        "reviewed": reviewed,
        "accepted": accepted,
        "rejected": rejected,
        "corrected": corrected,
        "reviewer_agreement_rate": agreement_rate,
        "note": (
            "Agreement rate = accepted / (accepted + rejected + corrected) reviews. "
            "Investigation-time-saved and holdout-precision metrics require a recorded "
            "pre-pilot baseline and a labeled holdout set, which are collected during the "
            "pilot (see FT01/FT02), not derivable from in-app data alone."
        ),
    }


def get_usage(db: Session, tenant_id: int) -> dict:
    period = current_period()
    record = db.query(UsageRecord).filter(UsageRecord.tenant_id == tenant_id, UsageRecord.period == period).first()
    return {
        "period": period,
        "jobs_count": record.jobs_count if record else 0,
        "model_tokens_in": record.model_tokens_in if record else 0,
        "model_tokens_out": record.model_tokens_out if record else 0,
        "cost_estimate_usd": record.cost_estimate_usd if record else 0.0,
        "cost_ceiling_usd": settings.MODEL_COST_CEILING_USD,
        "total_storage_bytes": get_total_storage_bytes(db, tenant_id),
        "storage_quota_bytes": settings.MAX_STORAGE_MB_PER_TENANT * 1024 * 1024,
    }
