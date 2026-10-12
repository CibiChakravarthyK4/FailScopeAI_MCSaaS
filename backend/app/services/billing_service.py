from sqlalchemy.orm import Session

from app.config import settings
from app.models.tenant import Tenant


def _plan_limits() -> dict:
    """Computed live from settings on each call, rather than a module-level
    constant captured once at import time, so changing settings (including in
    tests, via monkeypatch) actually takes effect. Plan limits are multiples of
    the base settings so one place controls the baseline, and upgrading a
    tenant's plan actually changes what's enforced, not just a label. "pilot"
    matches Tenant.plan's default and today's pre-billing defaults, so existing
    tenants are unaffected until they upgrade.
    """
    return {
        "pilot": {
            "storage_mb": settings.MAX_STORAGE_MB_PER_TENANT,
            "cost_ceiling_usd": settings.MODEL_COST_CEILING_USD,
        },
        "pro": {
            "storage_mb": settings.MAX_STORAGE_MB_PER_TENANT * 10,
            "cost_ceiling_usd": settings.MODEL_COST_CEILING_USD * 10,
        },
    }


def get_plan_limits(plan: str) -> dict:
    limits = _plan_limits()
    return limits.get(plan, limits["pilot"])


def billing_is_configured() -> bool:
    return bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_PRICE_ID_PRO)


def set_tenant_plan(db: Session, tenant_id: int, plan: str) -> None:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if tenant:
        tenant.plan = plan
        db.commit()
