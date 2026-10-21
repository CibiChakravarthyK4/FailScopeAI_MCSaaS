from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.exceptions import AppException
from app.models.diagnosis import Diagnosis
from app.models.test_case import TestCase
from app.models.user import User, UserRole
from app.rate_limit import check_rate_limit
from app.schemas.diagnosis import DiagnosisListItem, DiagnosisResponse
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services import diagnosis_service, review_service

router = APIRouter(prefix="/api/diagnoses", tags=["diagnoses"])


@router.get("", response_model=list[DiagnosisListItem])
def list_diagnoses(
    status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = (
        db.query(Diagnosis, TestCase.name, TestCase.run_id)
        .join(TestCase, TestCase.id == Diagnosis.test_case_id)
        .filter(Diagnosis.tenant_id == user.tenant_id)
    )
    if status:
        query = query.filter(Diagnosis.status == status)

    results = []
    for diagnosis, test_case_name, run_id in query.order_by(Diagnosis.created_at.desc()).all():
        response = DiagnosisResponse(
            id=diagnosis.id,
            test_case_id=diagnosis.test_case_id,
            run_id=run_id,
            category=diagnosis.category,
            confidence_score=diagnosis.confidence_score,
            evidence=diagnosis.evidence,
            model_provider=diagnosis.model_provider,
            model_name=diagnosis.model_name,
            prompt_version=diagnosis.prompt_version,
            status=diagnosis.status,
            created_at=diagnosis.created_at,
        )
        results.append(DiagnosisListItem(test_case_name=test_case_name, **response.model_dump()))
    return results


@router.post("/{test_case_id}/run", response_model=DiagnosisResponse)
def run_diagnosis(
    test_case_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.admin, UserRole.analyst)),
):
    # Defense in depth alongside the monthly cost ceiling: caps how fast a tenant
    # can trigger model calls, independent of total monthly spend.
    check_rate_limit(f"ratelimit:diagnosis_run:{user.tenant_id}", limit=30, window_seconds=3600)
    try:
        diagnosis = diagnosis_service.run_investigation(db, user.tenant_id, user.id, test_case_id)
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return diagnosis_service.to_response(db, diagnosis)


@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
def get_diagnosis(diagnosis_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    diagnosis = (
        db.query(Diagnosis)
        .filter(Diagnosis.tenant_id == user.tenant_id, Diagnosis.id == diagnosis_id)
        .first()
    )
    if not diagnosis:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return diagnosis_service.to_response(db, diagnosis)


@router.post("/{diagnosis_id}/review", response_model=ReviewResponse)
def review_diagnosis(
    diagnosis_id: int,
    req: ReviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.admin, UserRole.reviewer)),
):
    try:
        review = review_service.submit_review(
            db, user.tenant_id, user.id, diagnosis_id, req.action, req.corrected_category, req.reason
        )
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return review
