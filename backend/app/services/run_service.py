from rq import Retry
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.job import Job, JobStatus, JobType
from app.models.run import Run, RunStatus
from app.models.test_case import TestCase
from app.models.user import User
from app.schemas.run import RunResponse
from app.services import audit_service, usage_service
from app.services.junit_parser import parse_junit_xml
from app.storage.local_storage import save_artifact
from app.workers.queue import import_queue


def runs_to_responses(db: Session, runs: list[Run]) -> list[RunResponse]:
    """Batched, not one query per row - the Runs table can list many rows at once."""
    if not runs:
        return []
    run_ids = [r.id for r in runs]
    user_ids = {r.imported_by for r in runs}

    failure_counts: dict[int, int] = {
        row[0]: row[1]
        for row in db.query(TestCase.run_id, func.count(TestCase.id))
        .filter(TestCase.run_id.in_(run_ids))
        .group_by(TestCase.run_id)
        .all()
    }
    emails: dict[int, str] = {
        row[0]: row[1] for row in db.query(User.id, User.email).filter(User.id.in_(user_ids)).all()
    }

    return [
        RunResponse(
            id=r.id,
            external_run_id=r.external_run_id,
            build_id=r.build_id,
            branch=r.branch,
            environment=r.environment,
            source_type=r.source_type,
            status=r.status,
            created_at=r.created_at,
            failure_count=failure_counts.get(r.id, 0),
            imported_by_email=emails.get(r.imported_by),
        )
        for r in runs
    ]


def import_run(
    db: Session,
    tenant_id: int,
    user_id: int,
    external_run_id: str,
    build_id: str | None,
    branch: str | None,
    environment: str | None,
    junit_filename: str,
    junit_content: bytes,
    attachments: list[tuple[str, bytes]],
) -> tuple[Run, Job | None, bool]:
    existing = db.query(Run).filter(Run.tenant_id == tenant_id, Run.external_run_id == external_run_id).first()
    if existing:
        job = db.query(Job).filter(Job.idempotency_key == f"import:{tenant_id}:{external_run_id}").first()
        return existing, job, True

    parsed_cases = parse_junit_xml(junit_content)  # raises ValidationFailedError on malformed input

    incoming_bytes = len(junit_content) + sum(len(content) for _, content in attachments)
    usage_service.check_storage_quota(db, tenant_id, incoming_bytes)

    run = Run(
        tenant_id=tenant_id,
        external_run_id=external_run_id,
        build_id=build_id,
        branch=branch,
        environment=environment,
        source_type="junit",
        status=RunStatus.pending,
        imported_by=user_id,
    )
    db.add(run)
    db.flush()

    junit_path, junit_checksum = save_artifact(tenant_id, run.id, junit_filename, junit_content)
    saved_attachments = []
    for filename, content in attachments:
        path, digest = save_artifact(tenant_id, run.id, filename, content)
        saved_attachments.append({"filename": filename, "path": path, "checksum": digest, "size": len(content)})

    payload = {
        "run_id": run.id,
        "junit_path": junit_path,
        "junit_checksum": junit_checksum,
        "junit_size": len(junit_content),
        "attachments": saved_attachments,
        "parsed_cases": [
            {
                "name": c.name,
                "classname": c.classname,
                "status": c.status,
                "duration_ms": c.duration_ms,
                "stack_trace": c.stack_trace,
                "started_at": c.started_at.isoformat() if c.started_at else None,
            }
            for c in parsed_cases
        ],
    }

    job = Job(
        tenant_id=tenant_id,
        type=JobType.import_run,
        status=JobStatus.queued,
        idempotency_key=f"import:{tenant_id}:{external_run_id}",
        payload=payload,
    )
    db.add(job)
    db.flush()
    audit_service.record(db, tenant_id, user_id, "run_import_queued", "run", run.id)
    db.commit()

    import_queue.enqueue("app.workers.tasks.process_import_job", job.id, retry=Retry(max=3))
    return run, job, False
