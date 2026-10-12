from app.models.tenant import Tenant
from app.services import billing_service
from tests.conftest import auth_header, register_tenant


def test_billing_status_defaults_unconfigured(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.get("/api/billing/status", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["configured"] is False
    assert body["plan"] == "pilot"


def test_checkout_rejected_when_not_configured(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.post("/api/billing/checkout", headers=headers)
    assert resp.status_code == 503


def test_checkout_requires_admin_role(client, db):
    from app.auth.jwt import hash_password
    from app.models.user import User, UserRole

    register_tenant(client, email="owner@example.com", tenant_name="Billing Co")
    tenant = db.query(Tenant).filter(Tenant.slug == "billing-co").first()
    viewer = User(
        tenant_id=tenant.id, email="viewer@example.com", hashed_password=hash_password("password123"),
        role=UserRole.viewer,
    )
    db.add(viewer)
    db.commit()
    viewer_tokens = client.post("/auth/login", json={"email": viewer.email, "password": "password123"}).json()

    resp = client.post("/api/billing/checkout", headers=auth_header(viewer_tokens))
    assert resp.status_code == 403


def test_webhook_rejected_when_not_configured(client):
    resp = client.post("/api/billing/webhook", content=b"{}", headers={"stripe-signature": "x"})
    assert resp.status_code == 503


def test_plan_limits_differ_between_pilot_and_pro():
    pilot = billing_service.get_plan_limits("pilot")
    pro = billing_service.get_plan_limits("pro")
    assert pro["storage_mb"] > pilot["storage_mb"]
    assert pro["cost_ceiling_usd"] > pilot["cost_ceiling_usd"]


def test_pro_plan_allows_larger_storage_quota(client, db, monkeypatch):
    tokens = register_tenant(client)
    headers = auth_header(tokens)

    # Stub plan limits directly so each tier is controlled independently - the
    # real pro tier is 10x the pilot tier, so a shared base of 0 would leave
    # pro at 0 too (0 * 10 == 0) and never actually unlock anything.
    stub_limits = {
        "pilot": {"storage_mb": 0, "cost_ceiling_usd": 5.0},
        "pro": {"storage_mb": 999, "cost_ceiling_usd": 50.0},
    }
    monkeypatch.setattr("app.services.billing_service._plan_limits", lambda: stub_limits)

    junit = b'<testsuite><testcase name="t" classname="C"><failure>x</failure></testcase></testsuite>'
    blocked = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", junit, "application/xml")},
    )
    assert blocked.status_code == 403

    tenant = db.query(Tenant).filter(Tenant.slug == "acme-qa").first()
    tenant.plan = "pro"
    db.commit()

    allowed = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-2"},
        files={"junit_file": ("j.xml", junit, "application/xml")},
    )
    assert allowed.status_code == 201
