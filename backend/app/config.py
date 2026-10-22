from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "RootTrace Ivory"
    APP_ENV: Literal["development", "staging", "production", "demo"] = "development"
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    MODEL_COST_CEILING_USD: float = 5.0

    STORAGE_ROOT: str = "./storage"
    MAX_UPLOAD_SIZE_MB: int = 25
    MAX_STORAGE_MB_PER_TENANT: int = 500

    STRIPE_SECRET_KEY: str = ""
    STRIPE_PRICE_ID_PRO: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Public site (Section 17): notification recipients and form protections.
    # These are backend-only settings - frontend/src/config/company.ts is the
    # single source for company facts *shown on pages*, but the backend can't
    # import a frontend TS file, so the mailboxes that receive form
    # submissions are configured here instead.
    SUPPORT_EMAIL: str = ""
    SALES_EMAIL: str = ""
    HIRING_EMAIL: str = ""
    MAIL_BACKEND: Literal["console", "file"] = "console"
    MAIL_FILE_DIR: str = "./storage/dev-mail"
    CAPTCHA_ENABLED: bool = False
    PUBLIC_UPLOAD_ROOT: str = "./storage/public"
    MAX_RESUME_SIZE_MB: int = 5

    # Legal document versioning (C05): the backend is the single source of
    # truth for "which version is current" - frontend/src/config/company.ts
    # mirrors these same strings for display only (the page text/effective
    # date), and must be kept in sync by hand when either changes.
    PRIVACY_POLICY_VERSION: str = "0.1-draft"
    TERMS_VERSION: str = "0.1-draft"

    class Config:
        env_file = ".env"


settings = Settings()
