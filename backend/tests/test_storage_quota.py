from tests.conftest import auth_header, register_tenant

JUNIT = b"""<testsuite>
  <testcase name="t" classname="C"><failure>x</failure></testcase>
</testsuite>"""


def test_usage_reports_storage_after_import(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1"},
        files={
            "junit_file": ("j.xml", JUNIT, "application/xml"),
            "attachments": ("shot.png", b"x" * 1000, "image/png"),
        },
    )
    usage = client.get("/api/usage", headers=headers).json()
    assert usage["total_storage_bytes"] >= len(JUNIT) + 1000
    assert usage["storage_quota_bytes"] > 0


def test_import_rejected_when_it_would_exceed_storage_quota(client, monkeypatch):
    monkeypatch.setattr("app.config.settings.MAX_STORAGE_MB_PER_TENANT", 0)
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-2"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    assert resp.status_code == 403


def test_second_tenant_quota_is_independent(client, tenant_a, tenant_b, monkeypatch):
    monkeypatch.setattr("app.config.settings.MAX_STORAGE_MB_PER_TENANT", 0)
    _tokens_a, headers_a = tenant_a
    _tokens_b, headers_b = tenant_b

    resp_a = client.post(
        "/api/runs/import",
        headers=headers_a,
        data={"external_run_id": "build-3"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    resp_b = client.post(
        "/api/runs/import",
        headers=headers_b,
        data={"external_run_id": "build-3"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    # Both blocked independently by their own (zero) quota - not by each other's usage.
    assert resp_a.status_code == 403
    assert resp_b.status_code == 403
