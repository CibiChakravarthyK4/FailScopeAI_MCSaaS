import enum
from typing import Any

from sqlalchemy import JSON, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class ExportStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class DefectExport(Base, TimestampMixin):
    __tablename__ = "defect_exports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    failure_group_id: Mapped[int | None] = mapped_column(ForeignKey("failure_groups.id"), nullable=True, index=True)
    test_case_id: Mapped[int | None] = mapped_column(ForeignKey("test_cases.id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    steps: Mapped[str] = mapped_column(Text, nullable=False)
    expected_result: Mapped[str] = mapped_column(Text, nullable=False)
    actual_result: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_refs: Mapped[list[Any]] = mapped_column(JSON, nullable=False)
    jira_issue_key: Mapped[str | None] = mapped_column(String(50), nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    status: Mapped[ExportStatus] = mapped_column(Enum(ExportStatus), default=ExportStatus.draft, nullable=False)
