import json
from pathlib import Path
from typing import TypedDict

from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import ValidationFailedError
from app.models.career_application import CareerApplication, CareerApplicationStatus
from app.services import mail_service, public_submission_service
from app.storage import local_storage

ROLES_FILE = Path(__file__).resolve().parent.parent / "content" / "careers_roles.json"

# Allowed resume types and their magic bytes. Extension-only checks are easy to
# spoof (rename a .exe to .pdf), so both must agree before a file is accepted.
ALLOWED_RESUME_EXTENSIONS = {".pdf", ".docx"}
MAGIC_BYTES: dict[str, bytes] = {
    ".pdf": b"%PDF",
    # .docx is a zip container (OOXML); the zip local-file-header signature.
    ".docx": b"PK\x03\x04",
}


class RoleData(TypedDict):
    title: str
    team: str
    location: str
    type: str
    description: str
    requirements: list[str]
    status: str


def list_open_roles() -> list[RoleData]:
    roles: list[RoleData] = json.loads(ROLES_FILE.read_text(encoding="utf-8"))
    return [r for r in roles if r.get("status") == "open"]


def scan_for_viruses(content: bytes) -> bool:
    """No virus-scanning provider is integrated yet. Always reports clean;
    this is the hook to wire a real scanner into before accepting uploads
    from the public internet at scale."""
    return True


def _validate_resume(filename: str, content: bytes) -> str:
    safe_name = Path(filename).name  # strip any directory components - no path traversal via the filename
    extension = Path(safe_name).suffix.lower()

    if extension not in ALLOWED_RESUME_EXTENSIONS:
        raise ValidationFailedError("Resume must be a .pdf or .docx file")
    if len(content) > settings.MAX_RESUME_SIZE_MB * 1024 * 1024:
        raise ValidationFailedError(f"Resume must be under {settings.MAX_RESUME_SIZE_MB} MB")
    if len(content) == 0:
        raise ValidationFailedError("Resume file is empty")
    if not content.startswith(MAGIC_BYTES[extension]):
        raise ValidationFailedError("Resume file content does not match its extension")
    if not scan_for_viruses(content):
        raise ValidationFailedError("Resume failed a security scan")

    return extension


def submit_application(
    db: Session,
    *,
    role: str,
    name: str,
    email: str,
    phone: str | None,
    links: str | None,
    note: str | None,
    consent: bool,
    resume_filename: str,
    resume_content: bytes,
    ip: str | None,
    user_agent: str | None,
    website: str,
) -> None:
    if public_submission_service.is_honeypot_triggered(website):
        return
    if not consent:
        raise ValidationFailedError("Consent is required")

    extension = _validate_resume(resume_filename, resume_content)
    resume_path = local_storage.save_public_upload("careers", extension, resume_content)

    entry = CareerApplication(
        role=role,
        name=name,
        email=email,
        phone=phone,
        links=links,
        note=note,
        resume_path=resume_path,
        resume_original_filename=Path(resume_filename).name,
        consent=consent,
        ip_hash=public_submission_service.hash_ip(ip),
        user_agent=(user_agent or "")[:500] or None,
        status=CareerApplicationStatus.new,
    )
    db.add(entry)
    db.commit()

    mail_service.send_notification(
        to=settings.HIRING_EMAIL,
        subject=f"New application: {role}",
        body=f"From: {name} <{email}>\nPhone: {phone or '-'}\nLinks: {links or '-'}\n\n{note or '(no note)'}",
    )
