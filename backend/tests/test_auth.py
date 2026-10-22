from tests.conftest import auth_header, register_tenant


def test_register_creates_tenant_and_admin(client):
    tokens = register_tenant(client)
    assert "access_token" in tokens
    assert "refresh_token" in tokens


def test_register_duplicate_email_same_tenant_name_creates_new_tenant(client):
    # Self-serve signup always creates a new tenant; the same email can register
    # again under a different tenant name without colliding.
    register_tenant(client, email="dup@example.com", tenant_name="Dup A")
    tokens2 = register_tenant(client, email="dup@example.com", tenant_name="Dup B")
    assert "access_token" in tokens2


def test_me_requires_token(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user(client):
    tokens = register_tenant(client)
    resp = client.get("/auth/me", headers=auth_header(tokens))
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "qa@example.com"
    assert body["tenant_name"] == "Acme QA"
    assert body["role"] == "admin"


def test_login_success(client):
    register_tenant(client)
    resp = client.post("/auth/login", json={"email": "qa@example.com", "password": "password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    register_tenant(client)
    resp = client.post("/auth/login", json={"email": "qa@example.com", "password": "wrong"})
    assert resp.status_code == 401


def test_refresh_token_issues_new_access_token(client):
    tokens = register_tenant(client)
    resp = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_refresh_rejects_invalid_token(client):
    resp = client.post("/auth/refresh", json={"refresh_token": "not-a-real-token"})
    assert resp.status_code == 422
