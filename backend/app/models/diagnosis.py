import enum

from sqlalchemy import JSON, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

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

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id: Mapped[int] = mapped_column(
        ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[FailureCategory] = mapped_column(Enum(FailureCategory), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    evidence: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    model_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[DiagnosisStatus] = mapped_column(
        Enum(DiagnosisStatus), default=DiagnosisStatus.pending, nullable=False
    )

    test_case = relationship("TestCase", back_populates="diagnoses")
    reviews = relationship("Review", back_populates="diagnosis", cascade="all, delete-orphan")
