from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record(
    db: Session,
    tenant_id: int,
    actor_id: int | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    metadata: dict | None = None,
) -> AuditLog:
    entry = AuditLog(
        tenant_id=tenant_id,
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        event_metadata=metadata,
    )
    db.add(entry)
    return entry
