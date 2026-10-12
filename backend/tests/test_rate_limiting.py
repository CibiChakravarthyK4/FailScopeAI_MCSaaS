from tests.conftest import auth_header, register_tenant


def test_login_rate_limited_after_threshold(client):
    register_tenant(client, email="rl@example.com")
    for _ in range(10):
        resp = client.post("/auth/login", json={"email": "rl@example.com", "password": "wrong"})
        assert resp.status_code == 401

    blocked = client.post("/auth/login", json={"email": "rl@example.com", "password": "wrong"})
    assert blocked.status_code == 429


def test_register_rate_limited_after_threshold(client):
    for i in range(5):
        client.post(
            "/auth/register",
            json={"email": f"spam{i}@example.com", "password": "password123", "tenant_name": f"Spam {i}"},
        )

    blocked = client.post(
        "/auth/register",
        json={"email": "spam-blocked@example.com", "password": "password123", "tenant_name": "Blocked"},
    )
    assert blocked.status_code == 429


def test_diagnosis_run_rate_limit_is_per_tenant(client, monkeypatch):
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

    tokens = register_tenant(client)
    headers = auth_header(tokens)
    junit = b'<testsuite><testcase name="t" classname="C"><failure>x</failure></testcase></testsuite>'
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", junit, "application/xml")},
    )
    test_case_id = client.get(f"/api/runs/{resp.json()['id']}", headers=headers).json()["test_cases"][0]["id"]
    tenant_id = client.get("/auth/me", headers=headers).json()["tenant_id"]

    from app.rate_limit import _redis as rl_redis

    # Pre-fill the counter just below the threshold rather than making 30 real calls.
    rl_redis.set(f"ratelimit:diagnosis_run:{tenant_id}", 30, ex=3600)

    resp = client.post(f"/api/diagnoses/{test_case_id}/run", headers=headers)
    assert resp.status_code == 429
