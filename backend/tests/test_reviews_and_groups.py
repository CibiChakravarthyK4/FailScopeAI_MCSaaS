from app.services import ai_adapter
from tests.conftest import auth_header, register_tenant

JUNIT_TWO_FAILURES = b"""<testsuite>
  <testcase name="test_a" classname="C" time="0.1">
    <failure message="x">AssertionError: a</failure>
  </testcase>
  <testcase name="test_b" classname="C" time="0.1">
    <error message="y">TimeoutError: b</error>
  </testcase>
</testsuite>"""


def _result(category, confidence=0.7):
    return ai_adapter.DiagnosisResult(
        category=category,
        confidence=confidence,
        evidence=["evidence"],
        model_provider="openai",
        model_name="gpt-4o-mini",
        prompt_version="diagnosis-v1",
        tokens_in=10,
        tokens_out=5,
        cost_usd=0.0,
    )


def _setup(client, monkeypatch, category_a="application_bug", category_b="environment"):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.post(
        "/api/runs/import",
        headers=headers,
        data={"external_run_id": "build-1"},
        files={"junit_file": ("j.xml", JUNIT_TWO_FAILURES, "application/xml")},
    )
    run_id = resp.json()["id"]
    detail = client.get(f"/api/runs/{run_id}", headers=headers).json()
    tc_a = next(tc["id"] for tc in detail["test_cases"] if tc["name"] == "test_a")
    tc_b = next(tc["id"] for tc in detail["test_cases"] if tc["name"] == "test_b")

    results = iter([_result(category_a), _result(category_b)])
    monkeypatch.setattr("app.services.diagnosis_service.ai_adapter.investigate", lambda *a, **kw: next(results))

    diag_a = client.post(f"/api/diagnoses/{tc_a}/run", headers=headers).json()
    diag_b = client.post(f"/api/diagnoses/{tc_b}/run", headers=headers).json()
    return headers, tc_a, tc_b, diag_a, diag_b


def test_accept_review_marks_diagnosis_reviewed(client, monkeypatch):
    headers, _tc_a, _tc_b, diag_a, _diag_b = _setup(client, monkeypatch)

    resp = client.post(f"/api/diagnoses/{diag_a['id']}/review", headers=headers, json={"action": "accept"})
    assert resp.status_code == 200

    updated = client.get(f"/api/diagnoses/{diag_a['id']}", headers=headers).json()
    assert updated["status"] == "reviewed"
    assert updated["category"] == "application_bug"  # original AI call preserved for calibration


def test_correct_review_requires_corrected_category(client, monkeypatch):
    headers, _tc_a, _tc_b, diag_a, _diag_b = _setup(client, monkeypatch)
    resp = client.post(f"/api/diagnoses/{diag_a['id']}/review", headers=headers, json={"action": "correct"})
    assert resp.status_code == 422


def test_invalid_review_action_rejected(client, monkeypatch):
    headers, _tc_a, _tc_b, diag_a, _diag_b = _setup(client, monkeypatch)
    resp = client.post(f"/api/diagnoses/{diag_a['id']}/review", headers=headers, json={"action": "bogus"})
    assert resp.status_code == 422


def test_merge_groups_preserves_history(client, monkeypatch):
    headers, _tc_a, _tc_b, diag_a, diag_b = _setup(client, monkeypatch)
    groups = client.get("/api/failure-groups", headers=headers).json()
    assert len(groups) == 2
    source_id, target_id = groups[0]["id"], groups[1]["id"]

    resp = client.post(f"/api/failure-groups/{source_id}/merge", headers=headers, json={"target_group_id": target_id})
    assert resp.status_code == 200
    assert resp.json()["member_count"] == 2

    groups_after = {g["id"]: g["member_count"] for g in client.get("/api/failure-groups", headers=headers).json()}
    assert groups_after[source_id] == 0  # history preserved, not deleted
    assert groups_after[target_id] == 2


def test_split_group_moves_members(client, monkeypatch):
    headers, tc_a, tc_b, diag_a, diag_b = _setup(client, monkeypatch)
    groups = client.get("/api/failure-groups", headers=headers).json()
    source_id, target_id = groups[0]["id"], groups[1]["id"]
    client.post(f"/api/failure-groups/{source_id}/merge", headers=headers, json={"target_group_id": target_id})

    resp = client.post(
        f"/api/failure-groups/{target_id}/split",
        headers=headers,
        json={"test_case_ids": [tc_a], "new_title": "Split out"},
    )
    assert resp.status_code == 200
    assert resp.json()["member_count"] == 1


def test_split_with_no_active_members_fails(client, monkeypatch):
    headers, tc_a, _tc_b, diag_a, _diag_b = _setup(client, monkeypatch)
    groups = client.get("/api/failure-groups", headers=headers).json()
    group_id = groups[0]["id"]

    resp = client.post(
        f"/api/failure-groups/{group_id}/split",
        headers=headers,
        json={"test_case_ids": [999999], "new_title": "x"},
    )
    assert resp.status_code == 403
