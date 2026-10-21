from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.exceptions import AppException
from app.models.audit_log import AuditLog
from app.models.artifact import Artifact
from app.models.diagnosis import Diagnosis
from app.models.run import Run
from app.models.test_case import TestCase
from app.models.user import User, UserRole
from app.schemas.diagnosis import HistoryEntryResponse
from app.schemas.run import ArtifactResponse, EvidenceResponse, RunDetailResponse, RunResponse, TestCaseResponse
from app.services import diagnosis_service, run_service

router = APIRouter(prefix="/api/runs", tags=["runs"])


@router.post("/import", response_model=RunResponse)
async def import_run(
    response: Response,
    external_run_id: str = Form(...),
    build_id: str | None = Form(None),
    environment: str | None = Form(None),
    junit_file: UploadFile = File(...),
    attachments: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.admin, UserRole.analyst)),
):
    junit_content = await junit_file.read()
    attachment_data = [(f.filename, await f.read()) for f in attachments if f.filename]

    try:
        run, _job, was_existing = run_service.import_run(
            db,
            user.tenant_id,
            user.id,
            external_run_id,
            build_id,
            environment,
            junit_file.filename or "junit.xml",
            junit_content,
            attachment_data,
        )
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    response.status_code = 200 if was_existing else 201
    return run


@router.get("", response_model=list[RunResponse])
def list_runs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Run).filter(Run.tenant_id == user.tenant_id).order_by(Run.created_at.desc()).all()


@router.get("/{run_id}", response_model=RunDetailResponse)
def get_run(run_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    run = db.query(Run).filter(Run.tenant_id == user.tenant_id, Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.get("/{run_id}/tests/{test_case_id}/evidence", response_model=EvidenceResponse)
def get_evidence(
    run_id: int,
    test_case_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    test_case = (
        db.query(TestCase)
        .filter(TestCase.tenant_id == user.tenant_id, TestCase.id == test_case_id, TestCase.run_id == run_id)
        .first()
    )
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")

    artifacts = (
        db.query(Artifact)
        .filter(Artifact.tenant_id == user.tenant_id, Artifact.test_case_id == test_case_id)
        .all()
    )
    diagnoses = (
        db.query(Diagnosis)
        .filter(Diagnosis.tenant_id == user.tenant_id, Diagnosis.test_case_id == test_case_id)
        .order_by(Diagnosis.created_at.desc())
        .all()
    )
    return EvidenceResponse(
        test_case=TestCaseResponse.model_validate(test_case),
        artifacts=[ArtifactResponse.model_validate(a) for a in artifacts],
        diagnoses=[diagnosis_service.to_response(db, d) for d in diagnoses],
    )


@router.get("/{run_id}/tests/{test_case_id}/history", response_model=list[HistoryEntryResponse])
def get_history(
    run_id: int,
    test_case_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    test_case = (
        db.query(TestCase)
        .filter(TestCase.tenant_id == user.tenant_id, TestCase.id == test_case_id, TestCase.run_id == run_id)
        .first()
    )
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")

    diagnosis_ids = [
        d.id
        for d in db.query(Diagnosis.id)
        .filter(Diagnosis.tenant_id == user.tenant_id, Diagnosis.test_case_id == test_case_id)
        .all()
    ]

    entries = (
        db.query(AuditLog, User.email)
        .outerjoin(User, User.id == AuditLog.actor_id)
        .filter(
            AuditLog.tenant_id == user.tenant_id,
            ((AuditLog.entity_type == "run") & (AuditLog.entity_id == run_id))
            | ((AuditLog.entity_type == "diagnosis") & (AuditLog.entity_id.in_(diagnosis_ids))),
        )
        .order_by(AuditLog.created_at.asc())
        .all()
    )
    return [
        HistoryEntryResponse(
            action=entry.action,
            actor_email=actor_email,
            entity_type=entry.entity_type,
            entity_id=entry.entity_id,
            metadata=entry.event_metadata,
            created_at=entry.created_at,
        )
        for entry, actor_email in entries
    ]
