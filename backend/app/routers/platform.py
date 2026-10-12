from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_platform_owner
from app.schemas.platform import PlatformUsageResponse, TenantSummary
from app.services import platform_service

router = APIRouter(prefix="/api/platform", tags=["platform"])


@router.get("/tenants", response_model=list[TenantSummary])
def list_tenants(db: Session = Depends(get_db), _owner=Depends(require_platform_owner)):
    return platform_service.list_tenant_summaries(db)


@router.get("/usage", response_model=PlatformUsageResponse)
def platform_usage(db: Session = Depends(get_db), _owner=Depends(require_platform_owner)):
    return platform_service.get_platform_usage(db)
