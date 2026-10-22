from app.models.help_article_feedback import HelpArticleFeedback


def test_help_feedback_valid_submission_is_stored(client, db):
    resp = client.post("/api/public/help-feedback", json={"slug": "import-your-first-run", "helpful": True})
    assert resp.status_code == 201, resp.text

    stored = db.query(HelpArticleFeedback).filter_by(slug="import-your-first-run").one()
    assert stored.helpful is True


def test_help_feedback_missing_slug_rejected(client):
    resp = client.post("/api/public/help-feedback", json={"helpful": True})
    assert resp.status_code == 422


def test_help_feedback_rate_limited_after_threshold(client):
    for _ in range(20):
        resp = client.post("/api/public/help-feedback", json={"slug": "roles-and-permissions", "helpful": False})
        assert resp.status_code == 201

    blocked = client.post("/api/public/help-feedback", json={"slug": "roles-and-permissions", "helpful": False})
    assert blocked.status_code == 429
