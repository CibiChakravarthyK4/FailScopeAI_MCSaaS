from tests.conftest import auth_header, register_tenant


def test_platform_tenants_forbidden_without_owner_email(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.get("/api/platform/tenants", headers=headers)
    assert resp.status_code == 403


def test_platform_tenants_visible_to_configured_owner(client, monkeypatch, tenant_a, tenant_b):
    _tokens_a, headers_a = tenant_a
    monkeypatch.setattr("app.dependencies.settings.PLATFORM_OWNER_EMAILS", "a@example.com")

    resp = client.get("/api/platform/tenants", headers=headers_a)
    assert resp.status_code == 200
    slugs = {t["slug"] for t in resp.json()}
    # Platform owner sees across tenants - the one deliberate exception to
    # per-tenant scoping, gated behind the config allowlist.
    assert {"tenant-a", "tenant-b"}.issubset(slugs)


def test_platform_usage_aggregates_across_tenants(client, monkeypatch, tenant_a, tenant_b):
    _tokens_a, headers_a = tenant_a
    monkeypatch.setattr("app.dependencies.settings.PLATFORM_OWNER_EMAILS", "a@example.com")

    resp = client.get("/api/platform/usage", headers=headers_a)
    assert resp.status_code == 200
    body = resp.json()
    assert body["tenant_count"] >= 2


def test_platform_owner_email_check_is_case_insensitive(client, monkeypatch):
    tokens = register_tenant(client, email="Owner@Example.com")
    headers = auth_header(tokens)
    monkeypatch.setattr("app.dependencies.settings.PLATFORM_OWNER_EMAILS", "owner@example.com")

    resp = client.get("/api/platform/tenants", headers=headers)
    assert resp.status_code == 200
