import importlib


def test_health_reports_environment(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "healthy"
    assert body["environment"] == "development"


def test_docs_url_toggles_with_app_env(monkeypatch):
    import app.main as main_module

    monkeypatch.setattr("app.config.settings.APP_ENV", "production")
    importlib.reload(main_module)
    try:
        assert main_module.app.docs_url is None
        assert main_module.app.redoc_url is None
        assert main_module.app.openapi_url is None
    finally:
        # Reload is scoped to this module's own `app.main.app` attribute, not the
        # object other tests' `client` fixture already imported from conftest -
        # still worth restoring explicitly so later tests importing this module
        # fresh see the normal (non-production) FastAPI app.
        monkeypatch.undo()
        importlib.reload(main_module)
        assert main_module.app.docs_url == "/docs"
