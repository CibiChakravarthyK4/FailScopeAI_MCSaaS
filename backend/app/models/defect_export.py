import enum

from sqlalchemy import JSON, Column, Enum, ForeignKey, Integer, String, Text

from app.database import Base
from app.models.base import TimestampMixin


class ExportStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class DefectExport(Base, TimestampMixin):
    __tablename__ = "defect_exports"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    failure_group_id = Column(Integer, ForeignKey("failure_groups.id"), nullable=True, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id"), nullable=True, index=True)
    title = Column(String(300), nullable=False)
    steps = Column(Text, nullable=False)
    expected_result = Column(Text, nullable=False)
    actual_result = Column(Text, nullable=False)
    evidence_refs = Column(JSON, nullable=False)
    jira_issue_key = Column(String(50), nullable=True)
    idempotency_key = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(Enum(ExportStatus), default=ExportStatus.draft, nullable=False)
