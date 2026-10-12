import enum

from sqlalchemy import (
    BigInteger,
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


class ArtifactType(str, enum.Enum):
    log = "log"
    screenshot = "screenshot"
    trace = "trace"


class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"
    __table_args__ = (UniqueConstraint("run_id", "checksum_sha256", name="uq_artifact_run_checksum"),)

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id = Column(Integer, ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(Enum(ArtifactType), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    checksum_sha256 = Column(String(64), nullable=False)
    size_bytes = Column(BigInteger, nullable=False, default=0)
    redacted = Column(Boolean, default=False)

    run = relationship("Run", back_populates="artifacts")
    test_case = relationship("TestCase", back_populates="artifacts")
