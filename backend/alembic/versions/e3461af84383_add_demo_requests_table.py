"""add demo requests table

Revision ID: e3461af84383
Revises: 6214ad95aedc
Create Date: 2026-10-22 20:11:28.077297

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e3461af84383'
down_revision: Union[str, Sequence[str], None] = '6214ad95aedc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Autogenerate also picked up ~25 unrelated pre-existing NOT NULL drifts
    # (artifact of an earlier SQLAlchemy 2.0 model migration) - stripped by
    # hand, leaving only the intentional change.
    op.create_table(
        'demo_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('company', sa.String(length=200), nullable=False),
        sa.Column('role', sa.String(length=200), nullable=False),
        sa.Column(
            'team_size',
            sa.Enum('size_1_5', 'size_6_20', 'size_21_50', 'size_50_plus', name='teamsize'),
            nullable=False,
        ),
        sa.Column('want_to_see', sa.Text(), nullable=True),
        sa.Column('preferred_time', sa.String(length=200), nullable=True),
        sa.Column('consent', sa.Boolean(), nullable=False),
        sa.Column('ip_hash', sa.String(length=64), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('status', sa.Enum('new', 'handled', name='demorequeststatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_demo_requests')),
    )
    op.create_index(op.f('ix_demo_requests_email'), 'demo_requests', ['email'], unique=False)
    op.create_index(op.f('ix_demo_requests_id'), 'demo_requests', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_demo_requests_id'), table_name='demo_requests')
    op.drop_index(op.f('ix_demo_requests_email'), table_name='demo_requests')
    op.drop_table('demo_requests')
    # Postgres ENUM types created via sa.Enum() inside create_table are NOT
    # dropped by drop_table - they'd linger and make the next upgrade fail
    # with "type already exists" (DuplicateObject).
    sa.Enum(name='teamsize').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='demorequeststatus').drop(op.get_bind(), checkfirst=True)
