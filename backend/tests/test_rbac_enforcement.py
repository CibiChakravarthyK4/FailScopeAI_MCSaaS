from app.auth.jwt import hash_password
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from tests.conftest import auth_header, register_tenant

JUNIT = b"""<testsuite>
  <testcase name="t" classname="C"><failure>x</failure></testcase>
</testsuite>"""


def _make_user(db, tenant_id: int, email: str, role: UserRole) -> dict:
    user = User(tenant_id=tenant_id, email=email, hashed_password=hash_password("password123"), role=role)
    db.add(user)
    db.commit()
    return {"email": email, "password": "password123"}


def _login_headers(client, creds: dict) -> dict:
    resp = client.post("/auth/login", json={"email": creds["email"], "password": creds["password"]})
    return auth_header(resp.json())


def _setup_tenant_with_role(client, db, role: UserRole):
    admin_tokens = register_tenant(client, email="admin@example.com", tenant_name="RBAC Co")
    tenant = db.query(Tenant).filter(Tenant.slug == "rbac-co").first()
    creds = _make_user(db, tenant.id, f"{role.value}@example.com", role)
    return auth_header(admin_tokens), _login_headers(client, creds)


def test_viewer_cannot_import_run(client, db):
    admin_headers, viewer_headers = _setup_tenant_with_role(client, db, UserRole.viewer)
    resp = client.post(
        "/api/runs/import",
        headers=viewer_headers,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    assert resp.status_code == 403
    assert admin_headers  # admin ability to import is covered by test_runs.py


def test_analyst_can_import_run_but_not_review(client, db):
    _admin_headers, analyst_headers = _setup_tenant_with_role(client, db, UserRole.analyst)
    resp = client.post(
        "/api/runs/import",
        headers=analyst_headers,
        data={"external_run_id": "build-2"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    assert resp.status_code == 201

    resp2 = client.post("/api/diagnoses/1/review", headers=analyst_headers, json={"action": "accept"})
    assert resp2.status_code == 403


def test_reviewer_cannot_import_run_but_can_review(client, db, monkeypatch):
    admin_headers, reviewer_headers = _setup_tenant_with_role(client, db, UserRole.reviewer)

    resp = client.post(
        "/api/runs/import",
        headers=reviewer_headers,
        data={"external_run_id": "build-3"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    assert resp.status_code == 403

    # Admin imports and diagnoses; reviewer should still be able to review it.
    run_resp = client.post(
        "/api/runs/import",
        headers=admin_headers,
        data={"external_run_id": "build-4"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    run_id = run_resp.json()["id"]
    detail = client.get(f"/api/runs/{run_id}", headers=admin_headers).json()
    test_case_id = detail["test_cases"][0]["id"]

    from app.services import ai_adapter

    fake = ai_adapter.DiagnosisResult(
        category="application_bug",
        confidence=0.8,
        evidence=["evidence"],
        model_provider="openai",
        model_name="gpt-4o-mini",
        prompt_version="diagnosis-v1",
        tokens_in=10,
        tokens_out=5,
        cost_usd=0.0,
    )
    monkeypatch.setattr("app.services.diagnosis_service.ai_adapter.investigate", lambda *a, **kw: fake)
    diagnosis = client.post(f"/api/diagnoses/{test_case_id}/run", headers=admin_headers).json()

    review_resp = client.post(
        f"/api/diagnoses/{diagnosis['id']}/review", headers=reviewer_headers, json={"action": "accept"}
    )
    assert review_resp.status_code == 200


def test_viewer_can_still_read(client, db):
    _admin_headers, viewer_headers = _setup_tenant_with_role(client, db, UserRole.viewer)
    assert client.get("/api/runs", headers=viewer_headers).status_code == 200
    assert client.get("/api/failure-groups", headers=viewer_headers).status_code == 200
    assert client.get("/api/dashboard/groups", headers=viewer_headers).status_code == 200


def test_viewer_cannot_publish_export(client, db):
    _admin_headers, viewer_headers = _setup_tenant_with_role(client, db, UserRole.viewer)
    resp = client.post(
        "/api/exports",
        headers=viewer_headers,
        json={"test_case_id": 1, "title": "x", "steps": "x", "expected_result": "x", "actual_result": "x"},
    )
    assert resp.status_code == 403
