from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class OwnerAuditLog(Base):
    """Audit trail for Platform Owner access to client/billing data (CLAUDE.md
    15, C05). Kept separate from the tenant-scoped `audit_logs` table rather
    than reusing it: `actor_id` there is FK'd to `users.id`, a different id
    space than `platform_owners.id`, and owner actions aren't always scoped to
    a single tenant (e.g. listing all clients)."""

    __tablename__ = "owner_audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("platform_owners.id", ondelete="CASCADE"), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
