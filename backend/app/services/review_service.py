from sqlalchemy.orm import Session

from app.exceptions import NotFoundError, ValidationFailedError
from app.models.diagnosis import Diagnosis, DiagnosisStatus, FailureCategory
from app.models.review import Review, ReviewAction
from app.services import audit_service

_VALID_ACTIONS = {a.value for a in ReviewAction}


def submit_review(
    db: Session,
    tenant_id: int,
    reviewer_id: int,
    diagnosis_id: int,
    action: str,
    corrected_category: str | None,
    reason: str | None,
) -> Review:
    if action not in _VALID_ACTIONS:
        raise ValidationFailedError(f"action must be one of {sorted(_VALID_ACTIONS)}")

    diagnosis = (
        db.query(Diagnosis)
        .filter(Diagnosis.tenant_id == tenant_id, Diagnosis.id == diagnosis_id)
        .first()
    )
    if not diagnosis:
        raise NotFoundError("Diagnosis")

    if action == ReviewAction.correct.value and not corrected_category:
        raise ValidationFailedError("corrected_category is required when action is 'correct'")

    review = Review(
        tenant_id=tenant_id,
        diagnosis_id=diagnosis_id,
        reviewer_id=reviewer_id,
        action=ReviewAction(action),
        corrected_category=FailureCategory(corrected_category) if corrected_category else None,
        reason=reason,
    )
    db.add(review)

    diagnosis.status = DiagnosisStatus.reviewed
    db.flush()

    audit_service.record(
        db,
        tenant_id,
        reviewer_id,
        "diagnosis_reviewed",
        "diagnosis",
        diagnosis_id,
        metadata={"action": action, "corrected_category": corrected_category},
    )
    db.commit()
    return review
