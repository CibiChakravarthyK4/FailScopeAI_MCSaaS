from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.exceptions import AppException
from app.models.user import User, UserRole
from app.schemas.review import CreateExportRequest, ExportResponse
from app.services import export_service

router = APIRouter(prefix="/api/exports", tags=["exports"])


@router.post("", response_model=ExportResponse, status_code=201)
def create_export(
    req: CreateExportRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.admin, UserRole.reviewer)),
):
    try:
        export = export_service.create_draft(
            db,
            user.tenant_id,
            user.id,
            req.test_case_id,
            req.failure_group_id,
            req.title,
            req.steps,
            req.expected_result,
            req.actual_result,
        )
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return export


@router.post("/{export_id}/publish", response_model=ExportResponse)
def publish_export(
    export_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.admin, UserRole.reviewer)),
):
    try:
        export = export_service.publish(db, user.tenant_id, user.id, export_id)
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return export
