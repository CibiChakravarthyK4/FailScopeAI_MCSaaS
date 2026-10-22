"""add help article feedback table

Revision ID: 58724e78b084
Revises: e3461af84383
Create Date: 2026-10-22 20:23:54.761770

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '58724e78b084'
down_revision: Union[str, Sequence[str], None] = 'e3461af84383'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Autogenerate also picked up ~25 unrelated pre-existing NOT NULL drifts
    # (artifact of an earlier SQLAlchemy 2.0 model migration) - stripped by
    # hand, leaving only the intentional change.
    op.create_table(
        'help_article_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('slug', sa.String(length=200), nullable=False),
        sa.Column('helpful', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_help_article_feedback')),
    )
    op.create_index(op.f('ix_help_article_feedback_id'), 'help_article_feedback', ['id'], unique=False)
    op.create_index(op.f('ix_help_article_feedback_slug'), 'help_article_feedback', ['slug'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_help_article_feedback_slug'), table_name='help_article_feedback')
    op.drop_index(op.f('ix_help_article_feedback_id'), table_name='help_article_feedback')
    op.drop_table('help_article_feedback')
