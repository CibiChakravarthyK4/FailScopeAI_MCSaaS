import enum

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class LegalDocument(str, enum.Enum):
    privacy = "privacy"
    terms = "terms"


class LegalAcceptance(Base, TimestampMixin):
    """One row per (user, document, version) accepted. History is kept -
    never updated in place - so "when did this user accept which version"
    stays answerable (C05). created_at doubles as accepted_at."""

    __tablename__ = "legal_acceptances"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document: Mapped[LegalDocument] = mapped_column(Enum(LegalDocument), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
