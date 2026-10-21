import enum

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin
from app.models.diagnosis import FailureCategory


class ReviewAction(str, enum.Enum):
    accept = "accept"
    reject = "reject"
    correct = "correct"


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    diagnosis_id: Mapped[int] = mapped_column(
        ForeignKey("diagnoses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[ReviewAction] = mapped_column(Enum(ReviewAction), nullable=False)
    corrected_category: Mapped[FailureCategory | None] = mapped_column(Enum(FailureCategory), nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    diagnosis = relationship("Diagnosis", back_populates="reviews")
