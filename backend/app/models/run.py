import enum

from sqlalchemy import Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class RunStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    partial = "partial"


class Run(Base, TimestampMixin):
    __tablename__ = "runs"
    __table_args__ = (UniqueConstraint("tenant_id", "external_run_id", name="uq_run_tenant_external_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    external_run_id: Mapped[str] = mapped_column(String(255), nullable=False)
    build_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    environment: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_type: Mapped[str] = mapped_column(String(50), default="junit")
    status: Mapped[RunStatus] = mapped_column(Enum(RunStatus), default=RunStatus.pending, nullable=False)
    imported_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    test_cases = relationship("TestCase", back_populates="run", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="run", cascade="all, delete-orphan")
