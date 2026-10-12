import enum

from sqlalchemy import JSON, Column, Enum, ForeignKey, Integer, String

from app.database import Base
from app.models.base import TimestampMixin


class JobType(str, enum.Enum):
    import_run = "import"
    investigate = "investigate"
    export = "export"


class JobStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    partial = "partial"


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(Enum(JobType), nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.queued, nullable=False, index=True)
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    idempotency_key = Column(String(255), unique=True, nullable=False, index=True)
    payload = Column(JSON, nullable=True)
    error = Column(JSON, nullable=True)
