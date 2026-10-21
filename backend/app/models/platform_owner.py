from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class PlatformOwner(Base, TimestampMixin):
    """The product owner's own account (CLAUDE.md Section 15) - deliberately a
    separate table from the tenant-scoped `users`, not a role value on User, so
    it structurally belongs to no tenant and has no code path reachable from
    public signup or a tenant Admin. Created only by scripts/seed_platform_owner.py.
    """

    __tablename__ = "platform_owners"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    totp_secret: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
