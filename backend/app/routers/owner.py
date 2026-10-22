from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_owner
from app.models.career_application import CareerApplication
from app.models.platform_owner import PlatformOwner
from app.rate_limit import rate_limit_by_ip
from app.schemas.owner import (
    BillingReportResponse,
    CareerApplicationDetail,
    CareerApplicationStatusUpdate,
    CareerApplicationSummary,
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


def _get_application_or_404(db: Session, application_id: int) -> CareerApplication:
    application = db.query(CareerApplication).filter(CareerApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.get("/careers/applications", response_model=list[CareerApplicationSummary])
def list_career_applications(db: Session = Depends(get_db), owner: PlatformOwner = Depends(get_current_owner)):
    applications = db.query(CareerApplication).order_by(CareerApplication.created_at.desc()).all()
    owner_audit_service.record(
        db, owner.id, "owner_viewed_career_applications", "career_application", metadata={"count": len(applications)}
    )
    return applications


@router.get("/careers/applications/{application_id}", response_model=CareerApplicationDetail)
def get_career_application(
    application_id: int, db: Session = Depends(get_db), owner: PlatformOwner = Depends(get_current_owner)
):
    application = _get_application_or_404(db, application_id)
    owner_audit_service.record(db, owner.id, "owner_viewed_career_application", "career_application", application.id)
    return application


@router.get("/careers/applications/{application_id}/resume")
def download_career_application_resume(
    application_id: int, db: Session = Depends(get_db), owner: PlatformOwner = Depends(get_current_owner)
):
    application = _get_application_or_404(db, application_id)
    owner_audit_service.record(
        db, owner.id, "owner_downloaded_career_application_resume", "career_application", application.id
    )
    return FileResponse(
        application.resume_path,
        filename=application.resume_original_filename,
        media_type="application/octet-stream",
    )


@router.patch("/careers/applications/{application_id}/status", response_model=CareerApplicationDetail)
def update_career_application_status(
    application_id: int,
    req: CareerApplicationStatusUpdate,
    db: Session = Depends(get_db),
    owner: PlatformOwner = Depends(get_current_owner),
):
    application = _get_application_or_404(db, application_id)
    application.status = req.status
    db.commit()
    db.refresh(application)
    owner_audit_service.record(
        db,
        owner.id,
        "owner_updated_career_application_status",
        "career_application",
        application.id,
        metadata={"status": req.status.value},
    )
    return application
