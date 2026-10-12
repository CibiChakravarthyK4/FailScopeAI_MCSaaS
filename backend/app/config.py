from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "FailScope AI"
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
    OPENAI_MODEL: str = "gpt-4o-mini"
    MODEL_COST_CEILING_USD: float = 5.0

    STORAGE_ROOT: str = "./storage"
    MAX_UPLOAD_SIZE_MB: int = 25
    MAX_STORAGE_MB_PER_TENANT: int = 500

    class Config:
        env_file = ".env"


settings = Settings()
