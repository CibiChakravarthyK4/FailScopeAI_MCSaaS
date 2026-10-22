from app.models.contact_message import ContactMessage


def _valid_payload(**overrides):
    payload = {
        "name": "Jamie Reviewer",
        "email": "jamie@example.com",
        "company": "Acme QA",
        "topic": "product_question",
        "message": "I'd like to know more about how the evidence rail works in practice.",
        "consent": True,
        "website": "",
    }
    payload.update(overrides)
    return payload


def test_contact_valid_submission_is_stored(client, db):
    resp = client.post("/api/public/contact", json=_valid_payload())
    assert resp.status_code == 201, resp.text

    stored = db.query(ContactMessage).filter_by(email="jamie@example.com").one()
    assert stored.name == "Jamie Reviewer"
    assert stored.message.startswith("I'd like to know")
    # Never store the raw IP, only a hash of it.
    assert stored.ip_hash is not None
    assert stored.ip_hash != "testclient"


def test_contact_invalid_email_rejected(client):
    resp = client.post("/api/public/contact", json=_valid_payload(email="not-an-email"))
    assert resp.status_code == 422


def test_contact_message_too_short_rejected(client):
    resp = client.post("/api/public/contact", json=_valid_payload(message="too short"))
    assert resp.status_code == 422


def test_contact_message_too_long_rejected(client):
    resp = client.post("/api/public/contact", json=_valid_payload(message="x" * 2001))
    assert resp.status_code == 422


def test_contact_missing_consent_rejected(client):
    resp = client.post("/api/public/contact", json=_valid_payload(consent=False))
    assert resp.status_code == 422


def test_contact_honeypot_filled_is_silently_dropped(client, db):
    resp = client.post("/api/public/contact", json=_valid_payload(email="bot@example.com", website="http://spam.example"))
    # Looks like success to whatever filled the honeypot...
    assert resp.status_code == 201
    # ...but nothing was actually stored.
    assert db.query(ContactMessage).filter_by(email="bot@example.com").first() is None


def test_contact_rate_limited_after_threshold(client):
    for i in range(5):
        resp = client.post("/api/public/contact", json=_valid_payload(email=f"rl{i}@example.com"))
        assert resp.status_code == 201

    blocked = client.post("/api/public/contact", json=_valid_payload(email="rl-blocked@example.com"))
    assert blocked.status_code == 429
