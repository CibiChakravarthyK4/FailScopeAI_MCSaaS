from datetime import date

from sqlalchemy import Date, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="pilot")

    # Billing (CLAUDE.md Section 16) - manual/placeholder data pre-release, no
    # payment provider integrated yet. Kept as plain strings/dates rather than
    # enums since these are hand-maintained by the Platform Owner for now.
    billing_price_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    billing_purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    billing_renewal_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    billing_status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    billing_payment_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    billing_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
