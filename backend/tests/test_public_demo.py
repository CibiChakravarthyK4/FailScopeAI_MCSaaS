from app.models.demo_request import DemoRequest


def _valid_payload(**overrides):
    payload = {
        "name": "Jamie Reviewer",
        "email": "jamie@example.com",
        "company": "Acme QA",
        "role": "QA Lead",
        "team_size": "6-20",
        "want_to_see": "How the evidence rail and defect export work together.",
        "preferred_time": "Weekday mornings IST",
        "consent": True,
        "website": "",
    }
    payload.update(overrides)
    return payload


def test_demo_valid_submission_is_stored(client, db):
    resp = client.post("/api/public/demo", json=_valid_payload())
    assert resp.status_code == 201, resp.text

    stored = db.query(DemoRequest).filter_by(email="jamie@example.com").one()
    assert stored.company == "Acme QA"
    assert stored.team_size.value == "6-20"
    assert stored.ip_hash is not None


def test_demo_invalid_email_rejected(client):
    resp = client.post("/api/public/demo", json=_valid_payload(email="not-an-email"))
    assert resp.status_code == 422


def test_demo_missing_company_rejected(client):
    resp = client.post("/api/public/demo", json=_valid_payload(company=""))
    assert resp.status_code == 422


def test_demo_invalid_team_size_rejected(client):
    resp = client.post("/api/public/demo", json=_valid_payload(team_size="huge"))
    assert resp.status_code == 422


def test_demo_missing_consent_rejected(client):
    resp = client.post("/api/public/demo", json=_valid_payload(consent=False))
    assert resp.status_code == 422


def test_demo_optional_fields_can_be_omitted(client):
    payload = _valid_payload()
    del payload["want_to_see"]
    del payload["preferred_time"]
    resp = client.post("/api/public/demo", json=payload)
    assert resp.status_code == 201, resp.text


def test_demo_honeypot_filled_is_silently_dropped(client, db):
    resp = client.post(
        "/api/public/demo", json=_valid_payload(email="bot@example.com", website="http://spam.example")
    )
    assert resp.status_code == 201
    assert db.query(DemoRequest).filter_by(email="bot@example.com").first() is None


def test_demo_rate_limited_after_threshold(client):
    for i in range(5):
        resp = client.post("/api/public/demo", json=_valid_payload(email=f"rl{i}@example.com"))
        assert resp.status_code == 201

    blocked = client.post("/api/public/demo", json=_valid_payload(email="rl-blocked@example.com"))
    assert blocked.status_code == 429
