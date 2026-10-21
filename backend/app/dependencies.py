from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt import decode_token
from app.database import get_db
from app.models.platform_owner import PlatformOwner
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


def get_current_owner(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> PlatformOwner:
    """Platform Owner sessions are a wholly separate identity from tenant users
    (app/models/platform_owner.py) - a tenant user token, however it was
    obtained, can never satisfy this dependency, because the token's own
    "scope" claim (set only by create_owner_access_token) is checked first."""
    payload = decode_token(token)
    if not payload or payload.get("type") != "access" or payload.get("scope") != "platform_owner":
        raise HTTPException(status_code=403, detail="Platform owner access required")

    owner = db.query(PlatformOwner).filter(PlatformOwner.id == int(payload["sub"])).first()
    if not owner or not owner.is_active:
        raise HTTPException(status_code=403, detail="Platform owner access required")
    return owner
