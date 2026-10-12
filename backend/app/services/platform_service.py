from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.artifact import Artifact
from app.models.diagnosis import Diagnosis
from app.models.run import Run
from app.models.tenant import Tenant
from app.models.usage_record import UsageRecord
from app.models.user import User
from app.services.usage_service import current_period


def list_tenant_summaries(db: Session) -> list[dict]:
    tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).all()
    summaries = []
    for tenant in tenants:
        user_count = db.query(User).filter(User.tenant_id == tenant.id).count()
        run_count = db.query(Run).filter(Run.tenant_id == tenant.id).count()
        summaries.append(
            {
                "id": tenant.id,
                "name": tenant.name,
                "slug": tenant.slug,
                "plan": tenant.plan,
                "created_at": tenant.created_at,
                "user_count": user_count,
                "run_count": run_count,
            }
        )
    return summaries


def get_platform_usage(db: Session) -> dict:
    period = current_period()
    tenant_count = db.query(Tenant).count()
    total_runs = db.query(Run).count()
    total_diagnoses = db.query(Diagnosis).count()
    total_storage = db.query(func.sum(Artifact.size_bytes)).scalar() or 0
    total_cost = (
        db.query(func.sum(UsageRecord.cost_estimate_usd)).filter(UsageRecord.period == period).scalar() or 0.0
    )
    return {
        "tenant_count": tenant_count,
        "total_runs": total_runs,
        "total_diagnoses": total_diagnoses,
        "total_storage_bytes": int(total_storage),
        "total_cost_estimate_usd": float(total_cost),
        "period": period,
    }
