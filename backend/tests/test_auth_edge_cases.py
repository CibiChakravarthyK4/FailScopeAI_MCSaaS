from unittest.mock import AsyncMock

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.tenant import Tenant
from app.models.user import User
from tests.conftest import register_tenant


def test_duplicate_email_within_same_tenant_violates_db_constraint(db):
    # auth_service.register() always creates a brand-new tenant per call (slugs are
    # auto-deduped), so its own same-tenant ConflictError guard is currently
    # unreachable through any existing code path - flagged in the security review.
    # What actually has to hold, today, is the DB-level invariant: within one tenant,
    # email is unique. Verify that constraint directly.
    tenant = Tenant(name="T", slug="dup-email-test")
    db.add(tenant)
    db.flush()
    db.add(User(tenant_id=tenant.id, email="dup@example.com"))
    db.flush()
    db.add(User(tenant_id=tenant.id, email="dup@example.com"))
    with pytest.raises(IntegrityError):
        db.flush()


def test_refresh_rejects_revoked_token(client, db):
    tokens = register_tenant(client)
    from app.models.refresh_token import RefreshToken

    db.query(RefreshToken).update({RefreshToken.revoked: True})
    db.commit()

    resp = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 422


def test_google_login_redirects_to_google_when_configured(client, monkeypatch):
    monkeypatch.setattr("app.routers.auth.settings.GOOGLE_CLIENT_ID", "fake-client-id")
    monkeypatch.setattr("app.routers.auth.settings.GOOGLE_CLIENT_SECRET", "fake-client-secret")
    resp = client.get("/auth/google/login", follow_redirects=False)
    assert resp.status_code in (302, 307)
    assert "accounts.google.com" in resp.headers["location"]


def test_google_login_redirects_to_frontend_error_when_not_configured(client, monkeypatch):
    # GOOGLE_CLIENT_ID/SECRET are unset in the test environment by default, so this
    # exercises the real "not configured" branch rather than special-casing it.
    monkeypatch.setattr("app.routers.auth.settings.GOOGLE_CLIENT_ID", "")
    monkeypatch.setattr("app.routers.auth.settings.GOOGLE_CLIENT_SECRET", "")
    resp = client.get("/auth/google/login", follow_redirects=False)
    assert resp.status_code in (302, 307)
    assert resp.headers["location"] == "http://localhost:5180/login?error=google_oauth_not_configured"


def test_google_callback_creates_tenant_on_first_signup(client, monkeypatch):
    monkeypatch.setattr(
        "app.routers.auth.exchange_code_for_tokens",
        AsyncMock(return_value={"access_token": "fake-google-token"}),
    )
    monkeypatch.setattr(
        "app.routers.auth.fetch_google_userinfo",
        AsyncMock(return_value={"id": "google-sub-1", "email": "newuser@example.com", "name": "New User"}),
    )

    resp = client.get("/auth/google/callback?code=abc", follow_redirects=False)
    assert resp.status_code in (302, 307)
    assert "access_token=" in resp.headers["location"]


def test_google_callback_second_login_reuses_same_user(client, monkeypatch):
    monkeypatch.setattr(
        "app.routers.auth.exchange_code_for_tokens",
        AsyncMock(return_value={"access_token": "fake-google-token"}),
    )
    monkeypatch.setattr(
        "app.routers.auth.fetch_google_userinfo",
        AsyncMock(return_value={"id": "google-sub-2", "email": "repeat@example.com", "name": "Repeat User"}),
    )

    first = client.get("/auth/google/callback?code=abc", follow_redirects=False)
    second = client.get("/auth/google/callback?code=abc", follow_redirects=False)

    def extract_token(resp):
        location = resp.headers["location"]
        return location.split("access_token=")[1].split("&")[0]

    import jwt

    from app.config import settings

    payload1 = jwt.decode(extract_token(first), settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    payload2 = jwt.decode(extract_token(second), settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload1["sub"] == payload2["sub"]
