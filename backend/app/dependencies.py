from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt import decode_token
from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = (
        db.query(User)
        .filter(User.id == int(payload["sub"]), User.tenant_id == int(payload["tenant_id"]))
        .first()
    )
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


def require_role(*roles: UserRole):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Not authorized for this action")
        return user

    return dependency


def require_platform_owner(user: User = Depends(get_current_user)) -> User:
    """Platform-owner access (the SaaS operator, across all tenants) is driven by
    a config allowlist rather than a DB flag - there's no bootstrapping chicken-
    and-egg problem (no existing superuser needed to grant the first one), and it
    can't be escalated to by mutating application data."""
    owner_emails = {e.strip().lower() for e in settings.PLATFORM_OWNER_EMAILS.split(",") if e.strip()}
    if user.email.lower() not in owner_emails:
        raise HTTPException(status_code=403, detail="Platform owner access required")
    return user
