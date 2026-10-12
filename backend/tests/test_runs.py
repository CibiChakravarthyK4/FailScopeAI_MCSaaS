from tests.conftest import auth_header, register_tenant

VALID_JUNIT = b"""<testsuite>
  <testcase name="test_login_failure" classname="C" time="0.8" timestamp="2026-01-01T00:00:00">
    <failure message="boom">AssertionError: expected 200 but got 401</failure>
  </testcase>
  <testcase name="test_login_timeout" classname="C" time="2.0">
    <error message="timeout">TimeoutError: connection timed out</error>
  </testcase>
</testsuite>"""


def _headers(client):
    tokens = register_tenant(client)
    return auth_header(tokens)


def test_import_run_creates_test_cases(client):
    headers = _headers(client)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1", "environment": "staging"},
        files={"junit_file": ("j.xml", VALID_JUNIT, "application/xml")},
    )
    assert resp.status_code == 201
    run_id = resp.json()["id"]

    detail = client.get(f"/api/runs/{run_id}", headers=headers).json()
    assert detail["status"] == "completed"
    names = {tc["name"] for tc in detail["test_cases"]}
    assert names == {"test_login_failure", "test_login_timeout"}


def test_reimport_same_external_run_id_is_idempotent(client):
    headers = _headers(client)
    data = {"external_run_id": "build-2"}
    files = {"junit_file": ("j.xml", VALID_JUNIT, "application/xml")}

    first = client.post("/api/runs/import", headers=headers, data=data, files=files)
    assert first.status_code == 201

    second = client.post("/api/runs/import", headers=headers, data=data, files=files)
    assert second.status_code == 200
    assert second.json()["id"] == first.json()["id"]

    all_runs = client.get("/api/runs", headers=headers).json()
    assert len(all_runs) == 1


def test_malformed_xml_rejected(client):
    headers = _headers(client)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-bad"},
        files={"junit_file": ("bad.xml", b"not xml", "application/xml")},
    )
    assert resp.status_code == 422


def test_evidence_correlates_screenshot_by_filename(client):
    headers = _headers(client)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-3"},
        files={
            "junit_file": ("j.xml", VALID_JUNIT, "application/xml"),
            "attachments": ("test_login_failure.png", b"fake-png-bytes", "image/png"),
        },
    )
    run_id = resp.json()["id"]
    detail = client.get(f"/api/runs/{run_id}", headers=headers).json()
    failing_test = next(tc for tc in detail["test_cases"] if tc["name"] == "test_login_failure")

    evidence = client.get(f"/api/runs/{run_id}/tests/{failing_test['id']}/evidence", headers=headers).json()
    assert len(evidence["artifacts"]) == 1
    assert evidence["artifacts"][0]["type"] == "screenshot"


def test_duplicate_attachment_within_run_yields_partial_status(client):
    headers = _headers(client)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-dup"},
        files=[
            ("junit_file", ("j.xml", VALID_JUNIT, "application/xml")),
            ("attachments", ("dup.png", b"same-bytes", "image/png")),
            ("attachments", ("dup.png", b"same-bytes", "image/png")),
        ],
    )
    run_id = resp.json()["id"]
    detail = client.get(f"/api/runs/{run_id}", headers=headers).json()
    assert detail["status"] == "partial"
    assert len(detail["test_cases"]) == 2  # test cases still created despite the duplicate attachment
