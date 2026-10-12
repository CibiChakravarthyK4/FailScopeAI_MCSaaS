from app.services import ai_adapter
from tests.conftest import auth_header, register_tenant

VALID_JUNIT = b"""<testsuite>
  <testcase name="test_login_failure" classname="C" time="0.8">
    <failure message="boom">AssertionError: expected 200 but got 401</failure>
  </testcase>
</testsuite>"""


def _fake_result(category="application_bug", confidence=0.82):
    return ai_adapter.DiagnosisResult(
        category=category,
        confidence=confidence,
        evidence=["AssertionError indicates a real auth failure"],
        model_provider="openai",
        model_name="gpt-4o-mini",
        prompt_version="diagnosis-v1",
        tokens_in=100,
        tokens_out=30,
        cost_usd=0.0001,
    )


def _setup_run_with_test_case(client, headers):
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", VALID_JUNIT, "application/xml")},
    )
    run_id = resp.json()["id"]
    detail = client.get(f"/api/runs/{run_id}", headers=headers).json()
    return detail["test_cases"][0]["id"]


def test_run_diagnosis_without_api_key_returns_503(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    test_case_id = _setup_run_with_test_case(client, headers)

    resp = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers)
    assert resp.status_code == 503


def test_run_diagnosis_creates_diagnosis_and_group(client, monkeypatch):
    monkeypatch.setattr("app.services.diagnosis_service.ai_adapter.investigate", lambda *a, **kw: _fake_result())
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    test_case_id = _setup_run_with_test_case(client, headers)

    resp = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["category"] == "application_bug"
    assert body["status"] == "pending"

    groups = client.get("/api/failure-groups", headers=headers).json()
    assert len(groups) == 1
    assert groups[0]["member_count"] == 1


def test_run_diagnosis_is_idempotent_while_pending(client, monkeypatch):
    calls = {"n": 0}

    def fake_investigate(*a, **kw):
        calls["n"] += 1
        return _fake_result()

    monkeypatch.setattr("app.services.diagnosis_service.ai_adapter.investigate", fake_investigate)
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    test_case_id = _setup_run_with_test_case(client, headers)

    first = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers).json()
    second = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers).json()
    assert first["id"] == second["id"]
    assert calls["n"] == 1


def test_diagnosis_respects_cost_ceiling(client, monkeypatch):
    monkeypatch.setattr("app.config.settings.MODEL_COST_CEILING_USD", 0.0)
    monkeypatch.setattr("app.services.usage_service.settings.MODEL_COST_CEILING_USD", 0.0)
    monkeypatch.setattr("app.services.diagnosis_service.ai_adapter.investigate", lambda *a, **kw: _fake_result())
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    test_case_id = _setup_run_with_test_case(client, headers)

    resp = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers)
    assert resp.status_code == 403
