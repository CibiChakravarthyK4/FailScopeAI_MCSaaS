from rq import Retry
from sqlalchemy.orm import Session

from app.models.job import Job, JobStatus, JobType
from app.models.run import Run, RunStatus
from app.services import audit_service
from app.services.junit_parser import parse_junit_xml
from app.storage.local_storage import save_artifact
from app.workers.queue import import_queue


def import_run(
    db: Session,
    tenant_id: int,
    user_id: int,
    external_run_id: str,
    build_id: str | None,
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

    run = Run(
        tenant_id=tenant_id,
        external_run_id=external_run_id,
        build_id=build_id,
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
        saved_attachments.append({"filename": filename, "path": path, "checksum": digest})

    payload = {
        "run_id": run.id,
        "junit_path": junit_path,
        "junit_checksum": junit_checksum,
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
