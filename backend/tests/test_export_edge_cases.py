from tests.conftest import auth_header, register_tenant


def test_create_export_unknown_test_case_404(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.post(
        "/api/exports",
        headers=headers,
        json={"test_case_id": 999999, "title": "x", "steps": "x", "expected_result": "x", "actual_result": "x"},
    )
    assert resp.status_code == 404


def test_create_export_unknown_failure_group_404(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.post(
        "/api/exports",
        headers=headers,
        json={"failure_group_id": 999999, "title": "x", "steps": "x", "expected_result": "x", "actual_result": "x"},
    )
    assert resp.status_code == 404


def test_publish_unknown_export_404(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.post("/api/exports/999999/publish", headers=headers)
    assert resp.status_code == 404
