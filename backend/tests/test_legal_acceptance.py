from app.models.legal_acceptance import LegalAcceptance
from tests.conftest import auth_header, register_tenant


def test_register_without_accepted_terms_rejected(client):
    resp = client.post(
        "/auth/register",
        json={
            "email": "noterms@example.com",
            "password": "password123",
            "tenant_name": "No Terms",
            "accepted_terms": False,
        },
    )
    assert resp.status_code == 422


def test_register_records_acceptance_of_both_documents(client, db):
    tokens = register_tenant(client, email="accepts@example.com")
    headers = auth_header(tokens)
    user_id = client.get("/auth/me", headers=headers).json()["id"]

    rows = db.query(LegalAcceptance).filter_by(user_id=user_id).all()
    documents = {row.document.value for row in rows}
    assert documents == {"privacy", "terms"}


def test_me_reports_no_acceptance_needed_right_after_register(client):
    tokens = register_tenant(client, email="fresh@example.com")
    headers = auth_header(tokens)
    body = client.get("/auth/me", headers=headers).json()
    assert body["needs_legal_acceptance"] is False


def test_me_reports_acceptance_needed_after_version_bump(client, monkeypatch):
    tokens = register_tenant(client, email="bump@example.com")
    headers = auth_header(tokens)

    import app.services.legal_acceptance_service as svc
    from app.models.legal_acceptance import LegalDocument

    monkeypatch.setitem(svc.CURRENT_VERSIONS, LegalDocument.terms, "0.2-draft")

    body = client.get("/auth/me", headers=headers).json()
    assert body["needs_legal_acceptance"] is True


def test_accept_legal_clears_the_flag(client, monkeypatch):
    tokens = register_tenant(client, email="reaccept@example.com")
    headers = auth_header(tokens)

    import app.services.legal_acceptance_service as svc
    from app.models.legal_acceptance import LegalDocument

    monkeypatch.setitem(svc.CURRENT_VERSIONS, LegalDocument.terms, "0.2-draft")
    assert client.get("/auth/me", headers=headers).json()["needs_legal_acceptance"] is True

    resp = client.post("/auth/accept-legal", headers=headers)
    assert resp.status_code == 204

    assert client.get("/auth/me", headers=headers).json()["needs_legal_acceptance"] is False


def test_accept_legal_requires_auth(client):
    resp = client.post("/auth/accept-legal")
    assert resp.status_code == 401
