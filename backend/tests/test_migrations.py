"""Verifies Alembic migrations apply cleanly both up and down (CLAUDE.md 10.1),
against a dedicated throwaway database - never the shared test database, which
conftest.py already provisions via Base.metadata.create_all/drop_all rather
than real migrations, and has no alembic_version table to track against.
"""

from pathlib import Path

import psycopg2
from alembic.config import Config

from alembic import command

MIGRATION_TEST_DB = "failscope_migration_test"
# 127.0.0.1, not "localhost" - see the comment next to conftest.py's MAINT_DSN.
MAINT_DSN = {
    "dbname": "failscope",
    "user": "failscope",
    "password": "failscope",
    "host": "127.0.0.1",
    "port": 5433,
}
BACKEND_DIR = Path(__file__).resolve().parents[1]


def _recreate_database(name: str) -> None:
    conn = psycopg2.connect(**MAINT_DSN)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute(f"DROP DATABASE IF EXISTS {name}")
            cur.execute(f"CREATE DATABASE {name}")
    finally:
        conn.close()


def test_migrations_upgrade_and_downgrade_cleanly(monkeypatch):
    _recreate_database(MIGRATION_TEST_DB)
    migration_url = f"postgresql+psycopg2://failscope:failscope@127.0.0.1:5433/{MIGRATION_TEST_DB}"
    monkeypatch.setattr("app.config.settings.DATABASE_URL", migration_url)

    alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))

    command.upgrade(alembic_cfg, "head")

    conn = psycopg2.connect(
        dbname=MIGRATION_TEST_DB, user="failscope", password="failscope", host="127.0.0.1", port=5433
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            )
            tables_after_upgrade = {row[0] for row in cur.fetchall()}
    finally:
        conn.close()
    assert "tenants" in tables_after_upgrade
    assert "artifacts" in tables_after_upgrade

    command.downgrade(alembic_cfg, "base")

    conn = psycopg2.connect(
        dbname=MIGRATION_TEST_DB, user="failscope", password="failscope", host="127.0.0.1", port=5433
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name != 'alembic_version'"
            )
            tables_after_downgrade = {row[0] for row in cur.fetchall()}
    finally:
        conn.close()
    assert tables_after_downgrade == set()

    # Must be able to come back up again after a full downgrade, not just once.
    command.upgrade(alembic_cfg, "head")
