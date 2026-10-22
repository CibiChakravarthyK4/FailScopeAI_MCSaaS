"""add branch to runs

Revision ID: 5ebcb0f6a40e
Revises: 1d60a106bfeb
Create Date: 2026-10-22 14:23:41.242214

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5ebcb0f6a40e'
down_revision: Union[str, Sequence[str], None] = '1d60a106bfeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# NOTE: autogenerate also proposed the same ~25 unrelated NOT NULL statements
# as 1d60a106bfeb (pre-existing drift from the SQLAlchemy 2.0 Mapped[] model
# migration) - left out here for the same reason: latent, not a live bug,
# unrelated to this change.


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('runs', sa.Column('branch', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('runs', 'branch')
