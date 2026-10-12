from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import GroupSummary, MetricsResponse, UsageResponse
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/groups", response_model=list[GroupSummary])
def dashboard_groups(
    unresolved_only: bool = True,
    max_age_days: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return dashboard_service.list_group_summaries(db, user.tenant_id, unresolved_only, max_age_days)


@router.get("/metrics", response_model=MetricsResponse)
def dashboard_metrics(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return dashboard_service.compute_metrics(db, user.tenant_id)


usage_router = APIRouter(prefix="/api/usage", tags=["usage"])


@usage_router.get("", response_model=UsageResponse)
def usage(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return dashboard_service.get_usage(db, user.tenant_id)
