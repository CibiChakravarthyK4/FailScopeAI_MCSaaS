import pyotp

from app.models.career_application import CareerApplication
from app.models.owner_audit_log import OwnerAuditLog
from tests.conftest import auth_header, register_tenant

PDF_BYTES = b"%PDF-1.4\n%fake pdf content for tests\n"
DOCX_BYTES = b"PK\x03\x04" + b"fake docx zip content"


def _owner_header(client, owner, secret, password) -> dict:
    resp = client.post(
        "/api/owner/auth/login",
        json={"email": owner.email, "password": password, "totp_code": pyotp.TOTP(secret).now()},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _submit(client, **overrides):
    data = {
        "role": "General application",
        "name": "Jamie Reviewer",
        "email": "jamie@example.com",
        "consent": "true",
        "website": "",
    }
    data.update({k: v for k, v in overrides.items() if k not in ("files",)})
    files = overrides.get("files") or {"resume": ("resume.pdf", PDF_BYTES, "application/pdf")}
    return client.post("/api/public/careers/applications", data=data, files=files)


def test_careers_roles_endpoint_returns_a_list(client):
    resp = client.get("/api/public/careers/roles")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_careers_application_valid_pdf_is_stored(client, db):
    resp = _submit(client)
    assert resp.status_code == 201, resp.text

    stored = db.query(CareerApplication).filter_by(email="jamie@example.com").one()
    assert stored.resume_original_filename == "resume.pdf"
    assert stored.resume_path.endswith(".pdf")


def test_careers_application_valid_docx_is_stored(client, db):
    resp = _submit(
        client,
        email="docx@example.com",
        files={"resume": ("resume.docx", DOCX_BYTES, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert resp.status_code == 201, resp.text
    stored = db.query(CareerApplication).filter_by(email="docx@example.com").one()
    assert stored.resume_path.endswith(".docx")


def test_careers_application_wrong_extension_rejected(client):
    resp = _submit(client, files={"resume": ("resume.txt", b"plain text", "text/plain")})
    assert resp.status_code == 422


def test_careers_application_wrong_magic_bytes_rejected(client):
    # .pdf extension, but content doesn't start with %PDF.
    resp = _submit(client, files={"resume": ("resume.pdf", b"not a real pdf", "application/pdf")})
    assert resp.status_code == 422


def test_careers_application_too_large_rejected(client):
    oversized = PDF_BYTES + b"x" * (6 * 1024 * 1024)
    resp = _submit(client, files={"resume": ("resume.pdf", oversized, "application/pdf")})
    assert resp.status_code == 422


def test_careers_application_empty_file_rejected(client):
    resp = _submit(client, files={"resume": ("resume.pdf", b"", "application/pdf")})
    assert resp.status_code == 422


def test_careers_application_double_extension_rejected(client):
    # Looks like a PDF at a glance, but the real extension is .exe.
    resp = _submit(client, files={"resume": ("resume.pdf.exe", PDF_BYTES, "application/octet-stream")})
    assert resp.status_code == 422


def test_careers_application_path_traversal_in_filename_is_neutralized(client, db):
    resp = _submit(
        client,
        email="traversal@example.com",
        files={"resume": ("../../../etc/passwd.pdf", PDF_BYTES, "application/pdf")},
    )
    assert resp.status_code == 201, resp.text
    stored = db.query(CareerApplication).filter_by(email="traversal@example.com").one()
    assert "/" not in stored.resume_original_filename
    assert ".." not in stored.resume_original_filename
    assert ".." not in stored.resume_path


def test_careers_application_missing_consent_rejected(client):
    resp = _submit(client, consent="false")
    assert resp.status_code == 422


def test_careers_application_honeypot_filled_is_silently_dropped(client, db):
    resp = _submit(client, email="bot@example.com", website="http://spam.example")
    assert resp.status_code == 201
    assert db.query(CareerApplication).filter_by(email="bot@example.com").first() is None


def test_careers_application_rate_limited_after_threshold(client):
    for i in range(5):
        resp = _submit(client, email=f"rl{i}@example.com")
        assert resp.status_code == 201

    blocked = _submit(client, email="rl-blocked@example.com")
    assert blocked.status_code == 429


def test_careers_applications_require_owner_role(client):
    tokens = register_tenant(client)
    headers = auth_header(tokens)
    resp = client.get("/api/owner/careers/applications", headers=headers)
    assert resp.status_code in (401, 403)


def test_owner_can_list_view_download_and_update_status(client, db, platform_owner):
    owner, secret, password = platform_owner
    _submit(client, email="owner-flow@example.com")
    application_id = db.query(CareerApplication).filter_by(email="owner-flow@example.com").one().id

    headers = _owner_header(client, owner, secret, password)

    listing = client.get("/api/owner/careers/applications", headers=headers)
    assert listing.status_code == 200
    assert any(a["email"] == "owner-flow@example.com" for a in listing.json())

    detail = client.get(f"/api/owner/careers/applications/{application_id}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["resume_original_filename"] == "resume.pdf"

    download = client.get(f"/api/owner/careers/applications/{application_id}/resume", headers=headers)
    assert download.status_code == 200
    assert download.content.startswith(b"%PDF")

    update = client.patch(
        f"/api/owner/careers/applications/{application_id}/status", json={"status": "reviewed"}, headers=headers
    )
    assert update.status_code == 200
    assert update.json()["status"] == "reviewed"

    actions = {a.action for a in db.query(OwnerAuditLog).filter_by(owner_id=owner.id).all()}
    assert "owner_viewed_career_applications" in actions
    assert "owner_viewed_career_application" in actions
    assert "owner_downloaded_career_application_resume" in actions
    assert "owner_updated_career_application_status" in actions
