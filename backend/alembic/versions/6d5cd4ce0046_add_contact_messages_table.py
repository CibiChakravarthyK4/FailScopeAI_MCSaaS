"""add contact messages table

Revision ID: 6d5cd4ce0046
Revises: 5ebcb0f6a40e
Create Date: 2026-10-22 19:31:38.884128

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '6d5cd4ce0046'
down_revision: Union[str, Sequence[str], None] = '5ebcb0f6a40e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Autogenerate also picked up ~25 unrelated pre-existing NOT NULL drifts
    # (artifact of an earlier SQLAlchemy 2.0 model migration) - stripped by
    # hand, leaving only the intentional change.
    op.create_table(
        'contact_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('company', sa.String(length=200), nullable=True),
        sa.Column(
            'topic',
            sa.Enum('product_question', 'sales', 'support', 'security_or_privacy', 'partnership', 'other', name='contacttopic'),
            nullable=False,
        ),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('consent', sa.Boolean(), nullable=False),
        sa.Column('ip_hash', sa.String(length=64), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('status', sa.Enum('new', 'handled', name='contactmessagestatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_contact_messages')),
    )
    op.create_index(op.f('ix_contact_messages_email'), 'contact_messages', ['email'], unique=False)
    op.create_index(op.f('ix_contact_messages_id'), 'contact_messages', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_contact_messages_id'), table_name='contact_messages')
    op.drop_index(op.f('ix_contact_messages_email'), table_name='contact_messages')
    op.drop_table('contact_messages')
    # Postgres ENUM types created via sa.Enum() inside create_table are NOT
    # dropped by drop_table - they'd linger and make the next upgrade fail
    # with "type already exists" (DuplicateObject).
    sa.Enum(name='contacttopic').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='contactmessagestatus').drop(op.get_bind(), checkfirst=True)
