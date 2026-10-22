from datetime import datetime, timezone
from pathlib import Path

from app.config import settings


def send_notification(to: str, subject: str, body: str) -> None:
    """Dev-mode only: no real SMTP/provider is wired up yet (CLAUDE.md Section
    16 - no third-party services are integrated pre-release). "console" prints
    the notification; "file" appends it to a local .eml-ish file under
    MAIL_FILE_DIR so it can be inspected without a mail server."""
    if not to:
        return
    if settings.MAIL_BACKEND == "file":
        _write_to_file(to, subject, body)
    else:
        print(f"[mail] to={to} subject={subject!r}\n{body}")


def _write_to_file(to: str, subject: str, body: str) -> None:
    out_dir = Path(settings.MAIL_FILE_DIR)
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
    path = out_dir / f"{timestamp}.eml"
    path.write_text(f"To: {to}\nSubject: {subject}\n\n{body}\n", encoding="utf-8")
