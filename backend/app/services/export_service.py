import uuid

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError, ValidationFailedError
from app.models.artifact import Artifact
from app.models.defect_export import DefectExport, ExportStatus
from app.models.failure_group import FailureGroup, FailureGroupMember
from app.models.test_case import TestCase
from app.services import audit_service


def _collect_evidence_refs(db: Session, tenant_id: int, test_case_id: int | None, failure_group_id: int | None) -> dict:
    test_case_ids: list[int] = []
    if test_case_id:
        test_case_ids = [test_case_id]
    elif failure_group_id:
        members = (
            db.query(FailureGroupMember)
            .filter(FailureGroupMember.group_id == failure_group_id, FailureGroupMember.removed_at.is_(None))
            .all()
        )
        test_case_ids = [m.test_case_id for m in members]

    refs = []
    for tc_id in test_case_ids:
        artifacts = db.query(Artifact).filter(Artifact.tenant_id == tenant_id, Artifact.test_case_id == tc_id).all()
        refs.append({"test_case_id": tc_id, "artifact_ids": [a.id for a in artifacts]})
    return {"test_cases": refs}


def create_draft(
    db: Session,
    tenant_id: int,
    actor_id: int,
    test_case_id: int | None,
    failure_group_id: int | None,
    title: str,
    steps: str,
    expected_result: str,
    actual_result: str,
) -> DefectExport:
    if not test_case_id and not failure_group_id:
        raise ValidationFailedError("Either test_case_id or failure_group_id is required")

    if test_case_id:
        test_case = db.query(TestCase).filter(TestCase.tenant_id == tenant_id, TestCase.id == test_case_id).first()
        if not test_case:
            raise NotFoundError("Test case")
    if failure_group_id:
        group = (
            db.query(FailureGroup)
            .filter(FailureGroup.tenant_id == tenant_id, FailureGroup.id == failure_group_id)
            .first()
        )
        if not group:
            raise NotFoundError("Failure group")

    export = DefectExport(
        tenant_id=tenant_id,
        failure_group_id=failure_group_id,
        test_case_id=test_case_id,
        title=title,
        steps=steps,
        expected_result=expected_result,
        actual_result=actual_result,
        evidence_refs=_collect_evidence_refs(db, tenant_id, test_case_id, failure_group_id),
        idempotency_key=f"export:{tenant_id}:{uuid.uuid4()}",
        status=ExportStatus.draft,
    )
    db.add(export)
    db.flush()
    audit_service.record(db, tenant_id, actor_id, "defect_export_drafted", "defect_export", export.id)
    db.commit()
    return export


def publish(db: Session, tenant_id: int, actor_id: int, export_id: int) -> DefectExport:
    export = db.query(DefectExport).filter(DefectExport.tenant_id == tenant_id, DefectExport.id == export_id).first()
    if not export:
        raise NotFoundError("Defect export")

    if export.status == ExportStatus.published:
        return export  # idempotent: publishing twice returns the same result, no duplicate side effects

    # Sandbox Jira creation - no real Jira integration is configured yet.
    export.jira_issue_key = f"SANDBOX-{export.id}"
    export.status = ExportStatus.published
    db.flush()
    audit_service.record(
        db, tenant_id, actor_id, "defect_export_published", "defect_export", export.id,
        metadata={"jira_issue_key": export.jira_issue_key},
    )
    db.commit()
    return export
