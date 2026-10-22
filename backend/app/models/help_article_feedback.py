from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class HelpArticleFeedback(Base, TimestampMixin):
    """Anonymous by design: no user, tenant, or IP is recorded here - just a
    slug and a thumbs up/down, matching the spec's "stored anonymously"."""

    __tablename__ = "help_article_feedback"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    helpful: Mapped[bool] = mapped_column(Boolean, nullable=False)
