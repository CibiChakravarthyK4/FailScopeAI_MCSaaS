import enum

from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    reviewer = "reviewer"
    viewer = "viewer"


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),)

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(150), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.viewer, nullable=False)
    google_sub = Column(String(255), unique=True, nullable=True, index=True)
    is_active = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
