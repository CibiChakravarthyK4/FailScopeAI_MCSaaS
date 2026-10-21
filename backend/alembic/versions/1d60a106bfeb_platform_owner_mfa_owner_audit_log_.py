"""platform owner mfa, owner audit log, tenant billing fields

Revision ID: 1d60a106bfeb
Revises: c0843f11c740
Create Date: 2026-10-21 18:43:57.351397

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '1d60a106bfeb'
down_revision: Union[str, Sequence[str], None] = 'c0843f11c740'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# NOTE: autogenerate also proposed ~25 unrelated `ALTER COLUMN ... NOT NULL`
# statements across most existing tables (created_at/updated_at and a few
# other columns). That's pre-existing drift from migrating the ORM models to
# SQLAlchemy 2.0's Mapped[]/mapped_column() style - every `Mapped[X]` (non-
# Optional) field is now understood as NOT NULL at the ORM level, but the
# original migrations never enforced that at the database level. It's latent,
# not a live bug (the app always supplies these values), and unrelated to this
# feature - left alone here rather than bundled into this migration.


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'platform_owners',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('totp_secret', sa.String(length=64), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_platform_owners')),
    )
    op.create_index(op.f('ix_platform_owners_email'), 'platform_owners', ['email'], unique=True)
    op.create_index(op.f('ix_platform_owners_id'), 'platform_owners', ['id'], unique=False)

    op.create_table(
        'owner_audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(
            ['owner_id'], ['platform_owners.id'],
            name=op.f('fk_owner_audit_logs_owner_id_platform_owners'), ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_owner_audit_logs')),
    )
    op.create_index(op.f('ix_owner_audit_logs_id'), 'owner_audit_logs', ['id'], unique=False)

    op.add_column('tenants', sa.Column('billing_price_usd', sa.Float(), nullable=True))
    op.add_column('tenants', sa.Column('billing_purchase_date', sa.Date(), nullable=True))
    op.add_column('tenants', sa.Column('billing_renewal_date', sa.Date(), nullable=True))
    op.add_column(
        'tenants',
        sa.Column('billing_status', sa.String(length=50), server_default='active', nullable=False),
    )
    op.add_column('tenants', sa.Column('billing_payment_reference', sa.String(length=255), nullable=True))
    op.add_column('tenants', sa.Column('billing_notes', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('tenants', 'billing_notes')
    op.drop_column('tenants', 'billing_payment_reference')
    op.drop_column('tenants', 'billing_status')
    op.drop_column('tenants', 'billing_renewal_date')
    op.drop_column('tenants', 'billing_purchase_date')
    op.drop_column('tenants', 'billing_price_usd')

    op.drop_index(op.f('ix_owner_audit_logs_id'), table_name='owner_audit_logs')
    op.drop_table('owner_audit_logs')
    op.drop_index(op.f('ix_platform_owners_id'), table_name='platform_owners')
    op.drop_index(op.f('ix_platform_owners_email'), table_name='platform_owners')
    op.drop_table('platform_owners')
