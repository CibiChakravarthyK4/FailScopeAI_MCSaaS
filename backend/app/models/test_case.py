import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class TestCaseStatus(str, enum.Enum):
    failed = "failed"
    error = "error"
    skipped = "skipped"


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id = Column(Integer, ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(500), nullable=False)
    classname = Column(String(500), nullable=True)
    status = Column(Enum(TestCaseStatus), nullable=False)
    duration_ms = Column(Integer, nullable=True)
    stack_trace = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)

    run = relationship("Run", back_populates="test_cases")
    artifacts = relationship("Artifact", back_populates="test_case")
    diagnoses = relationship("Diagnosis", back_populates="test_case", cascade="all, delete-orphan")
    group_memberships = relationship("FailureGroupMember", back_populates="test_case")
