from sqlalchemy import BigInteger, Column, Float, ForeignKey, Integer, String

from app.database import Base
from app.models.base import TimestampMixin


class UsageRecord(Base, TimestampMixin):
    __tablename__ = "usage_records"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    period = Column(String(20), nullable=False)
    jobs_count = Column(Integer, default=0)
    storage_bytes = Column(BigInteger, default=0)
    model_tokens_in = Column(BigInteger, default=0)
    model_tokens_out = Column(BigInteger, default=0)
    cost_estimate_usd = Column(Float, default=0.0)
