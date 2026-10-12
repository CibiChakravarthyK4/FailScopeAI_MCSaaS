from app.services import ai_adapter
from tests.conftest import auth_header, register_tenant

JUNIT = b"""<testsuite>
  <testcase name="test_login_failure" classname="C" time="0.1">
    <failure message="x">AssertionError: a</failure>
  </testcase>
</testsuite>"""


def _result():
    return ai_adapter.DiagnosisResult(
        category="application_bug",
        confidence=0.8,
        evidence=["evidence"],
        model_provider="openai",
        model_name="gpt-4o-mini",
        prompt_version="diagnosis-v1",
        tokens_in=100,
        tokens_out=40,
        cost_usd=0.0005,
    )


def _setup(client, monkeypatch):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    run_id = resp.json()["id"]
    detail = client.get(f"/api/runs/{run_id}", headers=headers).json()
    test_case_id = detail["test_cases"][0]["id"]

    monkeypatch.setattr("app.services.diagnosis_service.ai_adapter.investigate", lambda *a, **kw: _result())
    diagnosis = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers).json()
    return headers, test_case_id, diagnosis


def test_create_export_draft_collects_evidence_refs(client, monkeypatch):
    headers, test_case_id, _diagnosis = _setup(client, monkeypatch)
    resp = client.post(
        "/api/exports",
        headers=headers,
        json={
            "test_case_id": test_case_id,
            "title": "Login fails with 401",
            "steps": "1. Login",
            "expected_result": "200",
            "actual_result": "401",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "draft"
    assert body["evidence_refs"]["test_cases"][0]["test_case_id"] == test_case_id


def test_create_export_requires_test_case_or_group(client, monkeypatch):
    headers, _tc, _d = _setup(client, monkeypatch)
    resp = client.post(
        "/api/exports",
        headers=headers,
        json={"title": "x", "steps": "x", "expected_result": "x", "actual_result": "x"},
    )
    assert resp.status_code == 422


def test_publish_is_idempotent(client, monkeypatch):
    headers, test_case_id, _d = _setup(client, monkeypatch)
    draft = client.post(
        "/api/exports",
        headers=headers,
        json={
            "test_case_id": test_case_id,
            "title": "Login fails",
            "steps": "x",
            "expected_result": "x",
            "actual_result": "x",
        },
    ).json()

    first = client.post(f"/api/exports/{draft['id']}/publish", headers=headers).json()
    second = client.post(f"/api/exports/{draft['id']}/publish", headers=headers).json()
    assert first["jira_issue_key"] == second["jira_issue_key"]
    assert first["status"] == "published"


def test_dashboard_groups_unresolved_filter(client, monkeypatch):
    headers, _tc, diagnosis = _setup(client, monkeypatch)

    unresolved = client.get("/api/dashboard/groups", headers=headers).json()
    assert len(unresolved) == 1
    assert unresolved[0]["pending_count"] == 1
    assert unresolved[0]["resolved"] is False

    client.post(f"/api/diagnoses/{diagnosis['id']}/review", headers=headers, json={"action": "accept"})

    unresolved_after = client.get("/api/dashboard/groups", headers=headers).json()
    assert unresolved_after == []

    all_groups = client.get("/api/dashboard/groups?unresolved_only=false", headers=headers).json()
    assert all_groups[0]["resolved"] is True


def test_dashboard_metrics_agreement_rate(client, monkeypatch):
    headers, _tc, diagnosis = _setup(client, monkeypatch)
    client.post(f"/api/diagnoses/{diagnosis['id']}/review", headers=headers, json={"action": "accept"})

    metrics = client.get("/api/dashboard/metrics", headers=headers).json()
    assert metrics["accepted"] == 1
    assert metrics["reviewer_agreement_rate"] == 1.0


def test_usage_tracks_model_calls(client, monkeypatch):
    headers, _tc, _diagnosis = _setup(client, monkeypatch)
    usage = client.get("/api/usage", headers=headers).json()
    assert usage["jobs_count"] == 1
    assert usage["model_tokens_in"] == 100
    assert usage["cost_estimate_usd"] > 0
