from datetime import datetime
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models.artifact import Artifact, ArtifactType
from app.models.job import Job, JobStatus
from app.models.run import Run, RunStatus
from app.models.test_case import TestCase, TestCaseStatus


def _artifact_type(filename: str) -> ArtifactType:
    ext = Path(filename).suffix.lower()
    if ext in (".png", ".jpg", ".jpeg", ".gif"):
        return ArtifactType.screenshot
    if ext in (".log", ".txt"):
        return ArtifactType.log
    return ArtifactType.trace


def _match_test_case(filename: str, test_cases: list[TestCase]) -> int | None:
    stem = Path(filename).stem.lower()
    for tc in test_cases:
        token = tc.name.lower().replace(" ", "_")
        if token and token in stem:
            return tc.id
    return None


def process_import_job(job_id: int) -> None:
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job or job.status == JobStatus.completed:
            return

        job.status = JobStatus.processing
        job.attempts += 1
        db.commit()

        payload = job.payload
        run = db.query(Run).filter(Run.id == payload["run_id"]).first()
        if not run:
            job.status = JobStatus.failed
            job.error = {"message": "Run not found"}
            db.commit()
            return

        run.status = RunStatus.processing
        db.commit()

        created_cases: list[TestCase] = []
        for case in payload["parsed_cases"]:
            tc = TestCase(
                tenant_id=run.tenant_id,
                run_id=run.id,
                name=case["name"],
                classname=case["classname"],
                status=TestCaseStatus(case["status"]),
                duration_ms=case["duration_ms"],
                stack_trace=case["stack_trace"],
                started_at=datetime.fromisoformat(case["started_at"]) if case["started_at"] else None,
            )
            db.add(tc)
            created_cases.append(tc)
        db.flush()

        failed_attachments = 0
        for att in payload["attachments"]:
            test_case_id = _match_test_case(att["filename"], created_cases)
            try:
                # A savepoint isolates this insert: a constraint violation (e.g. a
                # duplicate checksum) rolls back only this attachment, not the whole
                # job - SQLAlchemy only raises IntegrityError at flush, not at add().
                with db.begin_nested():
                    db.add(
                        Artifact(
                            tenant_id=run.tenant_id,
                            run_id=run.id,
                            test_case_id=test_case_id,
                            type=_artifact_type(att["filename"]),
                            storage_path=att["path"],
                            checksum_sha256=att["checksum"],
                            size_bytes=att.get("size", 0),
                            redacted=False,
                        )
                    )
                    db.flush()
            except IntegrityError:
                failed_attachments += 1

        db.add(
            Artifact(
                tenant_id=run.tenant_id,
                run_id=run.id,
                test_case_id=None,
                type=ArtifactType.trace,
                storage_path=payload["junit_path"],
                checksum_sha256=payload["junit_checksum"],
                size_bytes=payload.get("junit_size", 0),
                redacted=False,
            )
        )

        total_attachments = len(payload["attachments"])
        if failed_attachments and failed_attachments < total_attachments:
            run.status = RunStatus.partial
            job.status = JobStatus.partial
        elif failed_attachments and total_attachments:
            run.status = RunStatus.failed
            job.status = JobStatus.failed
        else:
            run.status = RunStatus.completed
            job.status = JobStatus.completed

        db.commit()
    except Exception as exc:
        db.rollback()
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            if job.attempts >= job.max_attempts:
                job.status = JobStatus.failed
                run = db.query(Run).filter(Run.id == job.payload.get("run_id")).first()
                if run:
                    run.status = RunStatus.failed
            job.error = {"message": str(exc)}
            db.commit()
        raise
    finally:
        db.close()
