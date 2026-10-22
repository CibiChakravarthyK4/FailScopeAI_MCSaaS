import enum

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class TeamSize(str, enum.Enum):
    size_1_5 = "1-5"
    size_6_20 = "6-20"
    size_21_50 = "21-50"
    size_50_plus = "50+"


class DemoRequestStatus(str, enum.Enum):
    new = "new"
    handled = "handled"


class DemoRequest(Base, TimestampMixin):
    """Submitted by anonymous site visitors before any account or tenant
    exists - deliberately NOT tenant-scoped, same as ContactMessage."""

    __tablename__ = "demo_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    team_size: Mapped[TeamSize] = mapped_column(Enum(TeamSize), nullable=False)
    want_to_see: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(200), nullable=True)
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[DemoRequestStatus] = mapped_column(
        Enum(DemoRequestStatus), default=DemoRequestStatus.new, nullable=False
    )
