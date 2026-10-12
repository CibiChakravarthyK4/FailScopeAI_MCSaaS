import enum

from sqlalchemy import JSON, Column, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class FailureCategory(str, enum.Enum):
    application_bug = "application_bug"
    script_issue = "script_issue"
    data_issue = "data_issue"
    environment = "environment"
    integration = "integration"
    unknown = "unknown"


class DiagnosisStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"


class Diagnosis(Base, TimestampMixin):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(Enum(FailureCategory), nullable=False)
    confidence_score = Column(Float, nullable=False)
    evidence = Column(JSON, nullable=False)
    model_provider = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    prompt_version = Column(String(50), nullable=False)
    status = Column(Enum(DiagnosisStatus), default=DiagnosisStatus.pending, nullable=False)

    test_case = relationship("TestCase", back_populates="diagnoses")
    reviews = relationship("Review", back_populates="diagnosis", cascade="all, delete-orphan")
