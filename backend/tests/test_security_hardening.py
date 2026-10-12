from tests.conftest import register_tenant


def test_register_rejects_short_password(client):
    resp = client.post(
        "/auth/register",
        json={"email": "a@example.com", "password": "short", "tenant_name": "T"},
    )
    assert resp.status_code == 422


def test_register_rejects_password_over_bcrypt_limit(client):
    resp = client.post(
        "/auth/register",
        json={"email": "a@example.com", "password": "x" * 73, "tenant_name": "T"},
    )
    assert resp.status_code == 422


def test_logout_revokes_refresh_token(client):
    tokens = register_tenant(client)
    logout_resp = client.post("/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert logout_resp.status_code == 204

    refresh_resp = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert refresh_resp.status_code == 422


def test_logout_with_unknown_token_is_a_safe_no_op(client):
    resp = client.post("/auth/logout", json={"refresh_token": "never-issued"})
    assert resp.status_code == 204


def test_oversized_upload_rejected_before_processing(client):
    tokens = register_tenant(client)
    from tests.conftest import auth_header

    headers = auth_header(tokens)
    # MAX_UPLOAD_SIZE_MB defaults to 25MB in Settings; this body declares itself
    # larger than that via Content-Length, so the middleware should reject it
    # without the app ever reading the body.
    oversized = b"x" * (26 * 1024 * 1024)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-huge"},
        files={"junit_file": ("huge.xml", oversized, "application/xml")},
    )
    assert resp.status_code == 413
