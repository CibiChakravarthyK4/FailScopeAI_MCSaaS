import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin
from app.models.diagnosis import FailureCategory


class ReviewAction(str, enum.Enum):
    accept = "accept"
    reject = "reject"
    correct = "correct"


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(Enum(ReviewAction), nullable=False)
    corrected_category = Column(Enum(FailureCategory), nullable=True)
    reason = Column(Text, nullable=True)

    diagnosis = relationship("Diagnosis", back_populates="reviews")
