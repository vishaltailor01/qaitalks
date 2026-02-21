"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-02-20 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=512), nullable=False),
        sa.Column('source_url', sa.String(length=2048), nullable=True),
    )

    # pgvector column type: use postgresql.ARRAY if Vector unavailable; migrations may require manual adjustment
    op.create_table(
        'chunks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id', ondelete='CASCADE')),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('length', sa.Integer(), nullable=False),
        sa.Column('embedding', postgresql.JSON(), nullable=True),
    )


def downgrade():
    op.drop_table('chunks')
    op.drop_table('documents')
