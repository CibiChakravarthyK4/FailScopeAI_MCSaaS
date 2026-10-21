from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class FailureGroup(Base, TimestampMixin):
    __tablename__ = "failure_groups"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    signature_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)

    members = relationship("FailureGroupMember", back_populates="group", cascade="all, delete-orphan")


class FailureGroupMember(Base):
    __tablename__ = "failure_group_members"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    group_id: Mapped[int] = mapped_column(
        ForeignKey("failure_groups.id", ondelete="CASCADE"), nullable=False, index=True
    )
    test_case_id: Mapped[int] = mapped_column(
        ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    added_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    removed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    group = relationship("FailureGroup", back_populates="members")
    test_case = relationship("TestCase", back_populates="group_memberships")
