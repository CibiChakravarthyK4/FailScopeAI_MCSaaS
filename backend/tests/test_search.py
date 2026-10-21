from tests.conftest import auth_header, register_tenant


def _import_run(client, headers, external_run_id="build-104"):
    junit = (
        '<testsuite><testcase name="test_checkout_flow" classname="tests.CheckoutTest">'
        "<failure>boom</failure></testcase></testsuite>"
    ).encode()
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": external_run_id},
        files={"junit_file": ("j.xml", junit, "application/xml")},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_search_requires_at_least_two_characters(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.get("/api/search?q=a", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body == {"runs": [], "test_cases": [], "failure_groups": []}


def test_search_finds_run_by_external_id(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    _import_run(client, headers, external_run_id="build-104")

    resp = client.get("/api/search?q=build-104", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert any(r["external_run_id"] == "build-104" for r in body["runs"])


def test_search_finds_test_case_by_name(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    _import_run(client, headers)

    resp = client.get("/api/search?q=checkout_flow", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert any(tc["name"] == "test_checkout_flow" for tc in body["test_cases"])


def test_search_is_scoped_to_the_caller_tenant(client, tenant_a, tenant_b):
    _tokens_a, headers_a = tenant_a
    _tokens_b, headers_b = tenant_b
    _import_run(client, headers_a, external_run_id="tenant-a-only-run")

    resp = client.get("/api/search?q=tenant-a-only-run", headers=headers_b)
    assert resp.status_code == 200
    assert resp.json()["runs"] == []
