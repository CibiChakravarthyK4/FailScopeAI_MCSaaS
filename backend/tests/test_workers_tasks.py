import pytest
from app.models.job import Job, JobStatus, JobType
from app.models.run import Run, RunStatus
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.workers import tasks as tasks_module


def _bind_task_session_to_test_connection(monkeypatch, db):
    from tests.conftest import TestSessionLocal

    monkeypatch.setattr(tasks_module, "SessionLocal", lambda: TestSessionLocal(bind=db.connection()))


def _seed_tenant_and_user(db) -> tuple[Tenant, User]:
    tenant = Tenant(name="T", slug="t-task-test")
    db.add(tenant)
    db.flush()
    user = User(tenant_id=tenant.id, email="u@example.com", role=UserRole.admin)
    db.add(user)
    db.flush()
    return tenant, user


def test_process_import_job_run_not_found(db, monkeypatch):
    _bind_task_session_to_test_connection(monkeypatch, db)
    tenant, _user = _seed_tenant_and_user(db)

    job = Job(
        tenant_id=tenant.id,
        type=JobType.import_run,
        status=JobStatus.queued,
        idempotency_key="k1",
        payload={"run_id": 999999, "parsed_cases": [], "attachments": []},
    )
    db.add(job)
    db.flush()
    db.commit()

    tasks_module.process_import_job(job.id)

    db.refresh(job)
    assert job.status == JobStatus.failed
    assert job.error["message"] == "Run not found"


def test_process_import_job_marks_failed_after_max_attempts(db, monkeypatch):
    _bind_task_session_to_test_connection(monkeypatch, db)
    tenant, user = _seed_tenant_and_user(db)
    run = Run(
        tenant_id=tenant.id,
        external_run_id="r1",
        source_type="junit",
        status=RunStatus.pending,
        imported_by=user.id,
    )
    db.add(run)
    db.flush()

    job = Job(
        tenant_id=tenant.id,
        type=JobType.import_run,
        status=JobStatus.queued,
        attempts=0,
        max_attempts=1,
        idempotency_key="k2",
        payload={
            "run_id": run.id,
            "junit_path": "x",
            "junit_checksum": "x",
            "attachments": [],
            # "bogus" is not a valid TestCaseStatus - this forces process_import_job
            # into its exception branch so we can verify the give-up-after-N behavior.
            "parsed_cases": [
                {"name": "t", "classname": "C", "status": "bogus", "duration_ms": 1, "stack_trace": None, "started_at": None}
            ],
        },
    )
    db.add(job)
    db.flush()
    db.commit()

    with pytest.raises(ValueError):
        tasks_module.process_import_job(job.id)

    db.refresh(job)
    db.refresh(run)
    assert job.attempts == 1
    assert job.status == JobStatus.failed
    assert run.status == RunStatus.failed


def test_process_import_job_leaves_room_for_retry_below_max_attempts(db, monkeypatch):
    _bind_task_session_to_test_connection(monkeypatch, db)
    tenant, user = _seed_tenant_and_user(db)
    run = Run(
        tenant_id=tenant.id,
        external_run_id="r2",
        source_type="junit",
        status=RunStatus.pending,
        imported_by=user.id,
    )
    db.add(run)
    db.flush()

    job = Job(
        tenant_id=tenant.id,
        type=JobType.import_run,
        status=JobStatus.queued,
        attempts=0,
        max_attempts=3,
        idempotency_key="k3",
        payload={
            "run_id": run.id,
            "junit_path": "x",
            "junit_checksum": "x",
            "attachments": [],
            "parsed_cases": [
                {"name": "t", "classname": "C", "status": "bogus", "duration_ms": 1, "stack_trace": None, "started_at": None}
            ],
        },
    )
    db.add(job)
    db.flush()
    db.commit()

    with pytest.raises(ValueError):
        tasks_module.process_import_job(job.id)

    db.refresh(job)
    db.refresh(run)
    assert job.attempts == 1
    assert job.status != JobStatus.failed  # below max_attempts, not given up on yet
    assert run.status != RunStatus.failed
