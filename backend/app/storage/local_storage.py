import hashlib
import uuid
from pathlib import Path

from app.config import settings


def checksum(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def save_artifact(tenant_id: int, run_id: int, filename: str, content: bytes) -> tuple[str, str]:
    digest = checksum(content)
    tenant_dir = Path(settings.STORAGE_ROOT) / str(tenant_id) / str(run_id)
    tenant_dir.mkdir(parents=True, exist_ok=True)

    safe_name = Path(filename).name
    target_path = tenant_dir / f"{digest}_{safe_name}"
    target_path.write_bytes(content)
    return str(target_path), digest


def read_artifact(storage_path: str) -> bytes:
    return Path(storage_path).read_bytes()


def save_public_upload(category: str, extension: str, content: bytes) -> str:
    """For uploads from anonymous public forms (career applications) rather
    than tenant-scoped artifacts: stored under PUBLIC_UPLOAD_ROOT, outside any
    tenant's storage path, named with a random id rather than the original
    filename or a content checksum - nothing about the stored path should be
    guessable or reveal the original filename."""
    target_dir = Path(settings.PUBLIC_UPLOAD_ROOT) / category
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / f"{uuid.uuid4().hex}{extension}"
    target_path.write_bytes(content)
    return str(target_path)


def read_public_upload(storage_path: str) -> bytes:
    return Path(storage_path).read_bytes()
