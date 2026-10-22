import enum

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class ContactTopic(str, enum.Enum):
    product_question = "product_question"
    sales = "sales"
    support = "support"
    security_or_privacy = "security_or_privacy"
    partnership = "partnership"
    other = "other"


class ContactMessageStatus(str, enum.Enum):
    new = "new"
    handled = "handled"


class ContactMessage(Base, TimestampMixin):
    """Submitted by anonymous site visitors before any account or tenant
    exists - deliberately NOT tenant-scoped, unlike every table under
    app/models that belongs to a signed-in tenant's data (C01 does not apply
    here: there is no tenant to isolate from)."""

    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    topic: Mapped[ContactTopic] = mapped_column(Enum(ContactTopic), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # Hashed, not raw - "never log message contents or full IPs" (spec).
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[ContactMessageStatus] = mapped_column(
        Enum(ContactMessageStatus), default=ContactMessageStatus.new, nullable=False
    )
