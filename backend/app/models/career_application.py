import enum

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class CareerApplicationStatus(str, enum.Enum):
    new = "new"
    reviewed = "reviewed"


class CareerApplication(Base, TimestampMixin):
    """Submitted by anonymous site visitors - deliberately NOT tenant-scoped.
    Never exposed publicly: only the Platform Owner can list, view or
    download these (C01 exception is account/billing data only elsewhere,
    but applications have no tenant to begin with, so they're owner-only by
    construction, not by an exception to tenant isolation)."""

    __tablename__ = "career_applications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    links: Mapped[str | None] = mapped_column(String(500), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    resume_original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[CareerApplicationStatus] = mapped_column(
        Enum(CareerApplicationStatus), default=CareerApplicationStatus.new, nullable=False
    )
