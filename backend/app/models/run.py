import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

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

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    external_run_id = Column(String(255), nullable=False)
    build_id = Column(String(255), nullable=True)
    environment = Column(String(100), nullable=True)
    source_type = Column(String(50), default="junit")
    status = Column(Enum(RunStatus), default=RunStatus.pending, nullable=False)
    imported_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    test_cases = relationship("TestCase", back_populates="run", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="run", cascade="all, delete-orphan")
