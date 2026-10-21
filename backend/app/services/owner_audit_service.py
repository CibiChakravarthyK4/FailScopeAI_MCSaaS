from sqlalchemy.orm import Session

from app.models.owner_audit_log import OwnerAuditLog


def record(
    db: Session,
    owner_id: int,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    metadata: dict | None = None,
) -> OwnerAuditLog:
    entry = OwnerAuditLog(
        owner_id=owner_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        event_metadata=metadata,
    )
    db.add(entry)
    db.commit()
    return entry
