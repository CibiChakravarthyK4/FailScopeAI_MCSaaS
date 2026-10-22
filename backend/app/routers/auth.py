from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.auth.google_oauth import (
    build_google_auth_url,
    exchange_code_for_tokens,
    fetch_google_userinfo,
)
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import AppException
from app.rate_limit import rate_limit_by_ip
from app.schemas.auth import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201,
    dependencies=[Depends(rate_limit_by_ip("register", limit=5, window_seconds=3600))],
)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.register(db, req.email, req.password, req.full_name, req.tenant_name)
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    access, refresh = auth_service.issue_tokens(db, user)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit_by_ip("login", limit=10, window_seconds=300))],
)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access, refresh = auth_service.issue_tokens(db, user)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post(
    "/refresh",
    dependencies=[Depends(rate_limit_by_ip("refresh", limit=20, window_seconds=300))],
)
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    try:
        access = auth_service.refresh_access_token(db, req.refresh_token)
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return {"access_token": access, "token_type": "bearer"}


@router.post("/logout", status_code=204)
def logout(req: LogoutRequest, db: Session = Depends(get_db)):
    auth_service.revoke_refresh_token(db, req.refresh_token)


@router.get("/me", response_model=UserResponse)
def me(user=Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        tenant_id=user.tenant_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        tenant_name=user.tenant.name,
    )


@router.get("/google/login")
def google_login():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_oauth_not_configured")
    return RedirectResponse(build_google_auth_url())


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    tokens = await exchange_code_for_tokens(code)
    userinfo = await fetch_google_userinfo(tokens["access_token"])
    user = auth_service.login_or_create_via_google(
        db, google_sub=userinfo["id"], email=userinfo["email"], full_name=userinfo.get("name")
    )
    access, refresh = auth_service.issue_tokens(db, user)
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access}&refresh_token={refresh}"
    return RedirectResponse(redirect_url)
