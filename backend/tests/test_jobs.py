from app.models.job import Job
from tests.conftest import auth_header, register_tenant

JUNIT = b"""<testsuite>
  <testcase name="t" classname="C"><failure>x</failure></testcase>
</testsuite>"""


def test_get_job_status(client, db):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    job = db.query(Job).filter(Job.idempotency_key.like("import:%build-1")).first()

    job_resp = client.get(f"/api/jobs/{job.id}", headers=headers)
    assert job_resp.status_code == 200
    body = job_resp.json()
    assert body["type"] == "import"
    assert body["status"] == "completed"


def test_job_not_found_for_other_tenant(client, db, tenant_a, tenant_b):
    _tokens_a, headers_a = tenant_a
    _tokens_b, headers_b = tenant_b
    client.post(
        "/api/runs/import",
        headers=headers_a,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", JUNIT, "application/xml")},
    )
    job = db.query(Job).filter(Job.idempotency_key.like("import:%build-1")).first()

    resp = client.get(f"/api/jobs/{job.id}", headers=headers_b)
    assert resp.status_code == 404
