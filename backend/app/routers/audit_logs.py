from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.audit_log import AuditLog
from app.models.user import UserRole


class AuditLogResponse(BaseModel):
    id: int
    actor_id: int | None
    action: str
    entity_type: str
    entity_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True


router = APIRouter(prefix="/api/audit-logs", tags=["audit-logs"])


@router.get("", response_model=list[AuditLogResponse])
def list_audit_logs(db: Session = Depends(get_db), user=Depends(require_role(UserRole.admin))):
    return (
        db.query(AuditLog)
        .filter(AuditLog.tenant_id == user.tenant_id)
        .order_by(AuditLog.created_at.desc())
        .limit(200)
        .all()
    )
