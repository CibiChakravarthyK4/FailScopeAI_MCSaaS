import hashlib
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
