from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class FailureGroup(Base, TimestampMixin):
    __tablename__ = "failure_groups"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    signature_hash = Column(String(64), nullable=False, index=True)
    title = Column(String(300), nullable=False)

    members = relationship("FailureGroupMember", back_populates="group", cascade="all, delete-orphan")


class FailureGroupMember(Base):
    __tablename__ = "failure_group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("failure_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    added_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    removed_at = Column(DateTime(timezone=True), nullable=True)

    group = relationship("FailureGroup", back_populates="members")
    test_case = relationship("TestCase", back_populates="group_memberships")
