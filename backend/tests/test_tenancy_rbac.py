from app.models.user import User, UserRole
from tests.conftest import auth_header, register_tenant


def _make_viewer(db, tenant_id: int, email: str) -> User:
    from app.auth.jwt import hash_password

    user = User(tenant_id=tenant_id, email=email, hashed_password=hash_password("password123"), role=UserRole.viewer)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _import_run(client, headers, external_run_id: str) -> int:
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": external_run_id},
        files={"junit_file": ("j.xml", _valid_junit(), "application/xml")},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def _valid_junit() -> bytes:
    return b"""<testsuite>
      <testcase name="t1" classname="C" timestamp="2026-01-01T00:00:00">
        <failure message="boom">AssertionError: boom</failure>
      </testcase>
    </testsuite>"""


def test_cross_tenant_run_list_is_scoped(client, tenant_a, tenant_b):
    _tokens_a, headers_a = tenant_a
    _tokens_b, headers_b = tenant_b

    run_id = _import_run(client, headers_a, "run-1")

    # Tenant B's list must not include tenant A's run.
    resp_b = client.get("/api/runs", headers=headers_b)
    assert resp_b.status_code == 200
    assert resp_b.json() == []

    # Direct ID access from tenant B must 404, not leak existence.
    resp_direct = client.get(f"/api/runs/{run_id}", headers=headers_b)
    assert resp_direct.status_code == 404


def test_cross_tenant_diagnosis_review_blocked(client, tenant_a, tenant_b, monkeypatch):
    _tokens_a, headers_a = tenant_a
    _tokens_b, headers_b = tenant_b

    from app.services import ai_adapter

    fake = ai_adapter.DiagnosisResult(
        category="application_bug",
        confidence=0.9,
        evidence=["clear evidence"],
        model_provider="openai",
        model_name="gpt-4o-mini",
        prompt_version="diagnosis-v1",
        tokens_in=10,
        tokens_out=5,
        cost_usd=0.0,
    )
    monkeypatch.setattr("app.services.diagnosis_service.ai_adapter.investigate", lambda *a, **kw: fake)

    run_id = _import_run(client, headers_a, "run-2")
    run_detail = client.get(f"/api/runs/{run_id}", headers=headers_a).json()
    test_case_id = run_detail["test_cases"][0]["id"]

    diag_resp = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers_a)
    assert diag_resp.status_code == 200
    diagnosis_id = diag_resp.json()["id"]

    # Tenant B cannot see or act on tenant A's diagnosis.
    assert client.get(f"/api/diagnoses/{diagnosis_id}", headers=headers_b).status_code == 404
    review_resp = client.post(f"/api/diagnoses/{diagnosis_id}/review", headers=headers_b, json={"action": "accept"})
    assert review_resp.status_code == 404


def test_viewer_blocked_from_admin_audit_logs(client, db):
    tokens = register_tenant(client, email="owner@example.com", tenant_name="Owner Co")
    from app.models.tenant import Tenant

    tenant = db.query(Tenant).filter(Tenant.slug == "owner-co").first()
    viewer = _make_viewer(db, tenant.id, "viewer@example.com")

    login_resp = client.post("/auth/login", json={"email": viewer.email, "password": "password123"})
    viewer_headers = auth_header(login_resp.json())

    admin_headers = auth_header(tokens)
    assert client.get("/api/audit-logs", headers=admin_headers).status_code == 200
    assert client.get("/api/audit-logs", headers=viewer_headers).status_code == 403
