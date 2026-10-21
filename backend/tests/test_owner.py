import pyotp

from tests.conftest import auth_header, register_tenant


def _owner_login(client, owner, secret, password):
    resp = client.post(
        "/api/owner/auth/login",
        json={"email": owner.email, "password": password, "totp_code": pyotp.TOTP(secret).now()},
    )
    return resp


def _owner_header(client, owner, secret, password) -> dict:
    resp = _owner_login(client, owner, secret, password)
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def test_owner_login_requires_correct_totp_code(client, platform_owner):
    owner, _secret, password = platform_owner
    resp = client.post(
        "/api/owner/auth/login",
        json={"email": owner.email, "password": password, "totp_code": "000000"},
    )
    assert resp.status_code == 401


def test_owner_login_requires_correct_password(client, platform_owner):
    owner, secret, _password = platform_owner
    resp = client.post(
        "/api/owner/auth/login",
        json={"email": owner.email, "password": "wrong-password", "totp_code": pyotp.TOTP(secret).now()},
    )
    assert resp.status_code == 401


def test_owner_login_succeeds_with_both_factors(client, platform_owner):
    owner, secret, password = platform_owner
    resp = _owner_login(client, owner, secret, password)
    assert resp.status_code == 200
    assert resp.json()["access_token"]


def test_tenant_user_token_cannot_access_owner_endpoints(client):
    tokens = register_tenant(client)
    resp = client.get("/api/owner/clients", headers=auth_header(tokens))
    assert resp.status_code == 403


def test_owner_cannot_be_created_through_public_signup(client):
    # Public /auth/register always creates a tenant admin (app/services/auth_service.py);
    # there is no field or path that produces a platform_owners row, so a
    # normal signup can never satisfy get_current_owner.
    tokens = register_tenant(client, email="owner@example.com", tenant_name="Not The Real Owner")
    resp = client.get("/api/owner/clients", headers=auth_header(tokens))
    assert resp.status_code == 403


def test_owner_sees_clients_across_tenants(client, platform_owner, tenant_a, tenant_b):
    owner, secret, password = platform_owner
    headers = _owner_header(client, owner, secret, password)

    resp = client.get("/api/owner/clients", headers=headers)
    assert resp.status_code == 200
    slugs = {c["slug"] for c in resp.json()}
    assert {"tenant-a", "tenant-b"}.issubset(slugs)


def test_owner_cannot_read_tenant_artifacts_or_diagnoses(client, platform_owner, tenant_a):
    # Client data protection (CLAUDE.md 15): the owner API surface only ever
    # queries Tenant/User/Run/Artifact aggregates and billing fields - there is
    # no owner endpoint that returns artifact content, stack traces, or
    # diagnosis evidence. Asserting the shape of what IS returned is the most
    # direct way to pin that down.
    owner, secret, password = platform_owner
    headers = _owner_header(client, owner, secret, password)

    resp = client.get("/api/owner/clients", headers=headers)
    assert resp.status_code == 200
    client_fields = set(resp.json()[0].keys())
    assert "billing_status" in client_fields
    assert not {"artifacts", "diagnoses", "stack_trace", "evidence"} & client_fields


def test_owner_access_is_audited(client, platform_owner, tenant_a, db):
    from app.models.owner_audit_log import OwnerAuditLog

    owner, secret, password = platform_owner
    headers = _owner_header(client, owner, secret, password)

    client.get("/api/owner/clients", headers=headers)

    entries = db.query(OwnerAuditLog).filter(OwnerAuditLog.owner_id == owner.id).all()
    actions = {e.action for e in entries}
    assert "owner_viewed_clients" in actions


def test_owner_login_is_rate_limited(client, platform_owner):
    owner, secret, password = platform_owner
    for _ in range(10):
        client.post(
            "/api/owner/auth/login",
            json={"email": owner.email, "password": "wrong-password", "totp_code": "000000"},
        )
    resp = client.post(
        "/api/owner/auth/login",
        json={"email": owner.email, "password": password, "totp_code": pyotp.TOTP(secret).now()},
    )
    assert resp.status_code == 429


def test_billing_report_computes_revenue_outstanding_and_renewals(client, platform_owner, db):
    import datetime

    from app.models.tenant import Tenant

    owner, secret, password = platform_owner
    headers = _owner_header(client, owner, secret, password)

    today = datetime.date.today()
    active = Tenant(
        name="Active Co", slug="active-co", plan="pro",
        billing_price_usd=99.0, billing_status="active",
        billing_renewal_date=today + datetime.timedelta(days=10),
    )
    overdue = Tenant(
        name="Overdue Co", slug="overdue-co", plan="pilot",
        billing_price_usd=49.0, billing_status="overdue",
        billing_renewal_date=today - datetime.timedelta(days=5),
    )
    db.add_all([active, overdue])
    db.commit()

    resp = client.get("/api/owner/billing-report", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_revenue_usd"] >= 99.0
    assert body["outstanding_usd"] >= 49.0
    assert body["renewals_due_count"] >= 1
    assert body["expired_count"] >= 1


def test_billing_report_csv_export(client, platform_owner):
    owner, secret, password = platform_owner
    headers = _owner_header(client, owner, secret, password)

    resp = client.get("/api/owner/billing-report.csv", headers=headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert "tenant_id,tenant_name,plan,status" in resp.text
