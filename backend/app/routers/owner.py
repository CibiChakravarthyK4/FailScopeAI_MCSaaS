from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_owner
from app.models.platform_owner import PlatformOwner
from app.rate_limit import rate_limit_by_ip
from app.schemas.owner import (
    BillingReportResponse,
    ClientSummary,
    OwnerLoginRequest,
    OwnerTokenResponse,
    OwnerUsageResponse,
)
from app.services import owner_audit_service, owner_auth_service, owner_service

router = APIRouter(prefix="/api/owner", tags=["owner"])


@router.post(
    "/auth/login",
    response_model=OwnerTokenResponse,
    dependencies=[Depends(rate_limit_by_ip("owner_login", limit=10, window_seconds=300))],
)
def owner_login(req: OwnerLoginRequest, db: Session = Depends(get_db)):
    owner = owner_auth_service.authenticate(db, req.email, req.password, req.totp_code)
    if not owner:
        raise HTTPException(status_code=401, detail="Invalid email, password or authentication code")
    token = owner_auth_service.issue_token(owner)
    return OwnerTokenResponse(access_token=token)


@router.get("/clients", response_model=list[ClientSummary])
def list_clients(db: Session = Depends(get_db), owner: PlatformOwner = Depends(get_current_owner)):
    summaries = owner_service.list_client_summaries(db)
    owner_audit_service.record(db, owner.id, "owner_viewed_clients", "tenant", metadata={"count": len(summaries)})
    return summaries


@router.get("/usage", response_model=OwnerUsageResponse)
def platform_usage(db: Session = Depends(get_db), owner: PlatformOwner = Depends(get_current_owner)):
    usage = owner_service.get_platform_usage(db)
    owner_audit_service.record(db, owner.id, "owner_viewed_usage", "platform")
    return usage


@router.get("/billing-report", response_model=BillingReportResponse)
def billing_report(db: Session = Depends(get_db), owner: PlatformOwner = Depends(get_current_owner)):
    report = owner_service.build_billing_report(db)
    owner_audit_service.record(db, owner.id, "owner_viewed_billing_report", "billing")
    return report


@router.get("/billing-report.csv", response_class=PlainTextResponse)
def billing_report_csv(db: Session = Depends(get_db), owner: PlatformOwner = Depends(get_current_owner)):
    report = owner_service.build_billing_report(db)
    owner_audit_service.record(db, owner.id, "owner_exported_billing_report_csv", "billing")
    return PlainTextResponse(
        owner_service.billing_report_to_csv(report),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=billing-report.csv"},
    )
