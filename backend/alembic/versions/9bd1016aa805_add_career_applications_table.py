"""add career applications table

Revision ID: 9bd1016aa805
Revises: 58724e78b084
Create Date: 2026-10-22 20:36:05.301488

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9bd1016aa805'
down_revision: Union[str, Sequence[str], None] = '58724e78b084'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Autogenerate also picked up ~25 unrelated pre-existing NOT NULL drifts
    # (artifact of an earlier SQLAlchemy 2.0 model migration) - stripped by
    # hand, leaving only the intentional change.
    op.create_table(
        'career_applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=200), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('links', sa.String(length=500), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('resume_path', sa.String(length=1000), nullable=False),
        sa.Column('resume_original_filename', sa.String(length=255), nullable=False),
        sa.Column('consent', sa.Boolean(), nullable=False),
        sa.Column('ip_hash', sa.String(length=64), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('status', sa.Enum('new', 'reviewed', name='careerapplicationstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_career_applications')),
    )
    op.create_index(op.f('ix_career_applications_email'), 'career_applications', ['email'], unique=False)
    op.create_index(op.f('ix_career_applications_id'), 'career_applications', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_career_applications_id'), table_name='career_applications')
    op.drop_index(op.f('ix_career_applications_email'), table_name='career_applications')
    op.drop_table('career_applications')
    # Postgres ENUM types created via sa.Enum() inside create_table are NOT
    # dropped by drop_table - they'd linger and make the next upgrade fail
    # with "type already exists" (DuplicateObject).
    sa.Enum(name='careerapplicationstatus').drop(op.get_bind(), checkfirst=True)
