import enum

from sqlalchemy import BigInteger, Boolean, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class ArtifactType(str, enum.Enum):
    log = "log"
    screenshot = "screenshot"
    trace = "trace"


class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"
    __table_args__ = (UniqueConstraint("run_id", "checksum_sha256", name="uq_artifact_run_checksum"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id: Mapped[int | None] = mapped_column(
        ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=True, index=True
    )
    type: Mapped[ArtifactType] = mapped_column(Enum(ArtifactType), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    redacted: Mapped[bool] = mapped_column(Boolean, default=False)

    run = relationship("Run", back_populates="artifacts")
    test_case = relationship("TestCase", back_populates="artifacts")
