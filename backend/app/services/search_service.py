from sqlalchemy.orm import Session

from app.models.failure_group import FailureGroup
from app.models.run import Run
from app.models.test_case import TestCase

_LIMIT = 5


def search(db: Session, tenant_id: int, query: str) -> dict:
    """Backs the search-first header (CLAUDE.md 4.3) - find a run, test or
    failure signature. A simple ILIKE search, tenant-scoped like everything
    else; fine at this data volume, would need a real search index later."""
    term = f"%{query}%"

    runs = (
        db.query(Run)
        .filter(Run.tenant_id == tenant_id)
        .filter((Run.external_run_id.ilike(term)) | (Run.build_id.ilike(term)))
        .order_by(Run.created_at.desc())
        .limit(_LIMIT)
        .all()
    )
    test_cases = (
        db.query(TestCase)
        .filter(TestCase.tenant_id == tenant_id)
        .filter((TestCase.name.ilike(term)) | (TestCase.classname.ilike(term)))
        .order_by(TestCase.id.desc())
        .limit(_LIMIT)
        .all()
    )
    failure_groups = (
        db.query(FailureGroup)
        .filter(FailureGroup.tenant_id == tenant_id)
        .filter((FailureGroup.title.ilike(term)) | (FailureGroup.signature_hash.ilike(term)))
        .order_by(FailureGroup.created_at.desc())
        .limit(_LIMIT)
        .all()
    )

    return {
        "runs": [{"id": r.id, "external_run_id": r.external_run_id, "status": r.status} for r in runs],
        "test_cases": [
            {"id": tc.id, "run_id": tc.run_id, "name": tc.name, "status": tc.status} for tc in test_cases
        ],
        "failure_groups": [{"id": g.id, "title": g.title, "signature_hash": g.signature_hash} for g in failure_groups],
    }
