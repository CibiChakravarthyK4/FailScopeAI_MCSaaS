import csv
import io
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.artifact import Artifact
from app.models.diagnosis import Diagnosis
from app.models.run import Run
from app.models.tenant import Tenant
from app.models.usage_record import UsageRecord
from app.models.user import User, UserRole
from app.services.usage_service import current_period

_RENEWAL_DUE_WINDOW_DAYS = 30


def _tenant_usage(db: Session, tenant_id: int) -> tuple[int, int, int]:
    run_count = db.query(Run).filter(Run.tenant_id == tenant_id).count()
    storage_bytes = db.query(func.sum(Artifact.size_bytes)).filter(Artifact.tenant_id == tenant_id).scalar() or 0
    period = current_period()
    usage = (
        db.query(UsageRecord)
        .filter(UsageRecord.tenant_id == tenant_id, UsageRecord.period == period)
        .first()
    )
    tokens = (usage.model_tokens_in + usage.model_tokens_out) if usage else 0
    return run_count, int(storage_bytes), tokens


def list_client_summaries(db: Session) -> list[dict]:
    tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).all()
    summaries = []
    for tenant in tenants:
        admin_emails = [
            u.email for u in db.query(User).filter(User.tenant_id == tenant.id, User.role == UserRole.admin).all()
        ]
        user_count = db.query(User).filter(User.tenant_id == tenant.id).count()
        run_count, storage_bytes, tokens = _tenant_usage(db, tenant.id)
        summaries.append(
            {
                "id": tenant.id,
                "name": tenant.name,
                "slug": tenant.slug,
                "created_at": tenant.created_at,
                "admin_emails": admin_emails,
                "user_count": user_count,
                "run_count": run_count,
                "plan": tenant.plan,
                "billing_price_usd": tenant.billing_price_usd,
                "billing_purchase_date": tenant.billing_purchase_date,
                "billing_renewal_date": tenant.billing_renewal_date,
                "billing_status": tenant.billing_status,
                "billing_payment_reference": tenant.billing_payment_reference,
                "billing_notes": tenant.billing_notes,
                "usage_job_runs": run_count,
                "usage_storage_bytes": storage_bytes,
                "usage_tokens": tokens,
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


def _is_renewal_due_soon(renewal_date: date | None, today: date) -> bool:
    if not renewal_date:
        return False
    return today <= renewal_date <= today + timedelta(days=_RENEWAL_DUE_WINDOW_DAYS)


def _is_expired(renewal_date: date | None, status: str, today: date) -> bool:
    if status == "expired":
        return True
    return bool(renewal_date and renewal_date < today)


def build_billing_report(db: Session) -> dict:
    """Billing data is manual/placeholder pre-release (CLAUDE.md Section 16) -
    there's no payment provider yet, so "revenue" and "outstanding" are read
    directly off each tenant's hand-maintained `billing_status`: "active" counts
    as collected revenue, "overdue" as outstanding. Both numbers are informational
    until a real provider's events become the source of truth."""
    today = datetime.now(UTC).date()
    tenants = db.query(Tenant).order_by(Tenant.name).all()

    rows = []
    total_revenue = 0.0
    outstanding = 0.0
    renewals_due_count = 0
    expired_count = 0

    for tenant in tenants:
        run_count, storage_bytes, _tokens = _tenant_usage(db, tenant.id)
        price = tenant.billing_price_usd or 0.0
        due_soon = _is_renewal_due_soon(tenant.billing_renewal_date, today)
        expired = _is_expired(tenant.billing_renewal_date, tenant.billing_status, today)

        if tenant.billing_status == "active":
            total_revenue += price
        elif tenant.billing_status == "overdue":
            outstanding += price
        if due_soon:
            renewals_due_count += 1
        if expired:
            expired_count += 1

        rows.append(
            {
                "tenant_id": tenant.id,
                "tenant_name": tenant.name,
                "plan": tenant.plan,
                "status": tenant.billing_status,
                "price_usd": tenant.billing_price_usd,
                "purchase_date": tenant.billing_purchase_date,
                "renewal_date": tenant.billing_renewal_date,
                "renewal_due_soon": due_soon,
                "expired": expired,
                "usage_job_runs": run_count,
                "usage_storage_bytes": storage_bytes,
            }
        )

    return {
        "generated_at": datetime.now(UTC),
        "total_revenue_usd": total_revenue,
        "outstanding_usd": outstanding,
        "renewals_due_count": renewals_due_count,
        "expired_count": expired_count,
        "rows": rows,
    }


def billing_report_to_csv(report: dict) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "tenant_id",
            "tenant_name",
            "plan",
            "status",
            "price_usd",
            "purchase_date",
            "renewal_date",
            "renewal_due_soon",
            "expired",
            "usage_job_runs",
            "usage_storage_bytes",
        ]
    )
    for row in report["rows"]:
        writer.writerow(
            [
                row["tenant_id"],
                row["tenant_name"],
                row["plan"],
                row["status"],
                row["price_usd"],
                row["purchase_date"],
                row["renewal_date"],
                row["renewal_due_soon"],
                row["expired"],
                row["usage_job_runs"],
                row["usage_storage_bytes"],
            ]
        )
    return buffer.getvalue()
