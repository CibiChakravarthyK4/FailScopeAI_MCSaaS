from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.artifact import Artifact, ArtifactType
from app.models.diagnosis import Diagnosis, DiagnosisStatus, FailureCategory
from app.models.test_case import TestCase
from app.schemas.diagnosis import DiagnosisResponse
from app.services import (
    ai_adapter,
    audit_service,
    grouping_service,
    redaction_service,
    usage_service,
)
from app.storage.local_storage import read_artifact

_MAX_LOG_CHARS = 4000


def to_response(db: Session, diagnosis: Diagnosis) -> DiagnosisResponse:
    test_case = db.query(TestCase).filter(TestCase.id == diagnosis.test_case_id).first()
    return DiagnosisResponse(
        id=diagnosis.id,
        test_case_id=diagnosis.test_case_id,
        run_id=test_case.run_id if test_case else 0,
        category=diagnosis.category,
        confidence_score=diagnosis.confidence_score,
        evidence=diagnosis.evidence,
        model_provider=diagnosis.model_provider,
        model_name=diagnosis.model_name,
        prompt_version=diagnosis.prompt_version,
        status=diagnosis.status,
        created_at=diagnosis.created_at,
    )


def run_investigation(db: Session, tenant_id: int, actor_id: int, test_case_id: int) -> Diagnosis:
    test_case = (
        db.query(TestCase)
        .filter(TestCase.tenant_id == tenant_id, TestCase.id == test_case_id)
        .first()
    )
    if not test_case:
        raise NotFoundError("Test case")

    existing_pending = (
        db.query(Diagnosis)
        .filter(Diagnosis.test_case_id == test_case_id, Diagnosis.status == DiagnosisStatus.pending)
        .order_by(Diagnosis.created_at.desc())
        .first()
    )
    if existing_pending:
        return existing_pending

    usage_service.check_cost_ceiling(db, tenant_id)

    stack_trace_redacted, stack_redactions = redaction_service.redact(test_case.stack_trace)

    log_artifacts = (
        db.query(Artifact)
        .filter(Artifact.test_case_id == test_case_id, Artifact.type == ArtifactType.log)
        .all()
    )
    log_excerpts: list[str] = []
    total_redactions = stack_redactions
    for artifact in log_artifacts:
        raw = read_artifact(artifact.storage_path).decode("utf-8", errors="replace")[:_MAX_LOG_CHARS]
        redacted, n = redaction_service.redact(raw)
        log_excerpts.append(redacted)
        total_redactions += n

    result = ai_adapter.investigate(test_case.name, test_case.classname, stack_trace_redacted, log_excerpts)

    diagnosis = Diagnosis(
        tenant_id=tenant_id,
        test_case_id=test_case_id,
        category=FailureCategory(result.category),
        confidence_score=result.confidence,
        evidence={"citations": result.evidence, "secrets_redacted": total_redactions},
        model_provider=result.model_provider,
        model_name=result.model_name,
        prompt_version=result.prompt_version,
        status=DiagnosisStatus.pending,
    )
    db.add(diagnosis)
    db.flush()

    grouping_service.assign_to_group(db, tenant_id, test_case, diagnosis, actor_id)
    usage_service.record_model_call(db, tenant_id, result.tokens_in, result.tokens_out, result.cost_usd)
    audit_service.record(
        db,
        tenant_id,
        actor_id,
        "diagnosis_model_call",
        "diagnosis",
        diagnosis.id,
        metadata={
            "model": result.model_name,
            "prompt_version": result.prompt_version,
            "secrets_redacted": total_redactions,
        },
    )
    db.commit()
    return diagnosis
