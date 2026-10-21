import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TestCaseStatus(str, enum.Enum):
    failed = "failed"
    error = "error"
    skipped = "skipped"


class TestCase(Base):
    __tablename__ = "test_cases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    classname: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[TestCaseStatus] = mapped_column(Enum(TestCaseStatus), nullable=False)
    duration_ms: Mapped[int | None] = mapped_column(nullable=True)
    stack_trace: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    run = relationship("Run", back_populates="test_cases")
    artifacts = relationship("Artifact", back_populates="test_case")
    diagnoses = relationship("Diagnosis", back_populates="test_case", cascade="all, delete-orphan")
    group_memberships = relationship("FailureGroupMember", back_populates="test_case")
