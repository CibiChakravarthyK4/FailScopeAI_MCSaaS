from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    plan = Column(String(50), default="pilot")

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
