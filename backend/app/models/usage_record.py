from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class UsageRecord(Base, TimestampMixin):
    __tablename__ = "usage_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    period: Mapped[str] = mapped_column(String(20), nullable=False)
    jobs_count: Mapped[int] = mapped_column(default=0)
    model_tokens_in: Mapped[int] = mapped_column(BigInteger, default=0)
    model_tokens_out: Mapped[int] = mapped_column(BigInteger, default=0)
    cost_estimate_usd: Mapped[float] = mapped_column(default=0.0)
