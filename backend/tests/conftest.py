import os
import tempfile
from unittest.mock import MagicMock

import psycopg2
import pytest
from fastapi.testclient import TestClient
from psycopg2 import errors as pg_errors
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg2://failscope:failscope@127.0.0.1:5433/failscope_test")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("STORAGE_ROOT", tempfile.mkdtemp(prefix="failscope-test-storage-"))
# Process env vars take priority over .env in pydantic-settings, so this
# isolates tests from whatever real key is in backend/.env for local dev -
# without it, "no API key configured" tests fail the moment a real key is
# added there, since they'd otherwise silently inherit it.
os.environ.setdefault("OPENAI_API_KEY", "")

# 127.0.0.1, not "localhost": Docker Desktop's port forwarding for this port is
# flaky over IPv6 (::1), which "localhost" sometimes resolves to first on this
# machine, causing intermittent "server closed the connection unexpectedly".
MAINT_DSN = dict(dbname="failscope", user="failscope", password="failscope", host="127.0.0.1", port=5433)


def _ensure_test_database() -> None:
    conn = psycopg2.connect(**MAINT_DSN)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            try:
                cur.execute("CREATE DATABASE failscope_test")
            except pg_errors.DuplicateDatabase:
                pass
    finally:
        conn.close()


_ensure_test_database()

from app import models  # noqa: E402,F401
from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

TEST_DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _create_schema():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Wrap each test in an outer transaction that is always rolled back, even
    though service code calls session.commit() internally. Each commit only ends
    the inner SAVEPOINT; the listener immediately opens a new one, so nothing
    escapes the outer transaction - the standard SQLAlchemy test-isolation pattern.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)
    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db):
    def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    """Rate-limit counters live in real Redis, not the per-test DB transaction, so
    they'd otherwise leak across tests (TestClient requests all share the same
    'testclient' identifier) and cause order-dependent 429s unrelated to what a
    test is actually checking."""
    from app.rate_limit import _redis as rl_redis

    keys = rl_redis.keys("ratelimit:*")
    if keys:
        rl_redis.delete(*keys)
    yield


@pytest.fixture(autouse=True)
def _mock_job_queue(monkeypatch, db):
    """No real RQ worker runs during tests, so simulate one: execute the enqueued
    task synchronously, against a session bound to this test's own connection.

    This matters because the real task module opens its own SessionLocal(), which
    would otherwise be a separate DB connection that can't see this test's
    not-yet-committed (and never-committed, since this fixture rolls back) rows.
    """
    import importlib

    def fake_enqueue(func_path: str, *args, **kwargs):
        module_path, func_name = func_path.rsplit(".", 1)
        module = importlib.import_module(module_path)
        func = getattr(module, func_name)
        original_session_local = module.SessionLocal
        monkeypatch.setattr(module, "SessionLocal", lambda: TestSessionLocal(bind=db.connection()))
        try:
            return func(*args)
        finally:
            monkeypatch.setattr(module, "SessionLocal", original_session_local)

    mock_queue = MagicMock()
    mock_queue.enqueue.side_effect = fake_enqueue
    monkeypatch.setattr("app.services.run_service.import_queue", mock_queue)
    return mock_queue


def register_tenant(client, email="qa@example.com", tenant_name="Acme QA", password="password123"):
    resp = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "QA Lead",
            "tenant_name": tenant_name,
            "accepted_terms": True,
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def auth_header(tokens: dict) -> dict:
    return {"Authorization": f"Bearer {tokens['access_token']}"}


@pytest.fixture()
def tenant_a(client):
    tokens = register_tenant(client, email="a@example.com", tenant_name="Tenant A")
    return tokens, auth_header(tokens)


@pytest.fixture()
def tenant_b(client):
    tokens = register_tenant(client, email="b@example.com", tenant_name="Tenant B")
    return tokens, auth_header(tokens)


@pytest.fixture()
def platform_owner(db):
    """A Platform Owner row created the same way scripts/seed_platform_owner.py
    does - there's no HTTP path that creates one, by design."""
    from app.services import owner_auth_service

    password = "owner-password-123"
    owner, secret = owner_auth_service.create_owner(db, "owner@example.com", password)
    return owner, secret, password
