"""add legal acceptances table

Revision ID: 6214ad95aedc
Revises: 6d5cd4ce0046
Create Date: 2026-10-22 19:50:10.556809

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '6214ad95aedc'
down_revision: Union[str, Sequence[str], None] = '6d5cd4ce0046'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Autogenerate also picked up ~25 unrelated pre-existing NOT NULL drifts
    # (artifact of an earlier SQLAlchemy 2.0 model migration) - stripped by
    # hand, leaving only the intentional change.
    op.create_table(
        'legal_acceptances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('document', sa.Enum('privacy', 'terms', name='legaldocument'), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_legal_acceptances_user_id_users'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_legal_acceptances')),
    )
    op.create_index(op.f('ix_legal_acceptances_id'), 'legal_acceptances', ['id'], unique=False)
    op.create_index(op.f('ix_legal_acceptances_user_id'), 'legal_acceptances', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_legal_acceptances_user_id'), table_name='legal_acceptances')
    op.drop_index(op.f('ix_legal_acceptances_id'), table_name='legal_acceptances')
    op.drop_table('legal_acceptances')
    # Postgres ENUM types created via sa.Enum() inside create_table are NOT
    # dropped by drop_table - they'd linger and make the next upgrade fail
    # with "type already exists" (DuplicateObject).
    sa.Enum(name='legaldocument').drop(op.get_bind(), checkfirst=True)
