from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.exceptions import AppException
from app.middleware import MaxBodySizeMiddleware
from app.routers import (
    audit_logs,
    auth,
    billing,
    dashboard,
    diagnoses,
    exports,
    failure_groups,
    jobs,
    owner,
    public,
    runs,
    search,
)

_is_production = settings.APP_ENV == "production"
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
)

app.add_middleware(MaxBodySizeMiddleware, max_bytes=settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"code": exc.code, "message": exc.message})


app.include_router(auth.router)
app.include_router(runs.router)
app.include_router(jobs.router)
app.include_router(diagnoses.router)
app.include_router(failure_groups.router)
app.include_router(exports.router)
app.include_router(audit_logs.router)
app.include_router(dashboard.router)
app.include_router(dashboard.usage_router)
app.include_router(billing.router)
app.include_router(owner.router)
app.include_router(search.router)
app.include_router(public.router)


@app.get("/health")
async def health():
    return {"status": "healthy", "environment": settings.APP_ENV}
