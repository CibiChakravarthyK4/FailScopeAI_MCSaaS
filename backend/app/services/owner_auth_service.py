import pyotp
from sqlalchemy.orm import Session

from app.auth.jwt import create_owner_access_token, hash_password, verify_password
from app.models.platform_owner import PlatformOwner


def authenticate(db: Session, email: str, password: str, totp_code: str) -> PlatformOwner | None:
    """Both factors are required in a single call - the Platform Owner enrolls
    their TOTP secret once (scripts/seed_platform_owner.py) and from then on
    every login needs the current code from their authenticator app, not just
    the password. There is no password-only intermediate session."""
    owner = db.query(PlatformOwner).filter(PlatformOwner.email == email).first()
    if not owner or not owner.is_active:
        return None
    if not verify_password(password, owner.hashed_password):
        return None
    if not pyotp.TOTP(owner.totp_secret).verify(totp_code, valid_window=1):
        return None
    return owner


def issue_token(owner: PlatformOwner) -> str:
    # No refresh token for owner sessions, unlike tenant users - a short-lived
    # access token that forces re-entering the TOTP code periodically is the
    # right trade-off for an account with cross-tenant billing visibility.
    return create_owner_access_token(owner.id)


def create_owner(db: Session, email: str, password: str) -> tuple[PlatformOwner, str]:
    """Used only by scripts/seed_platform_owner.py - no HTTP endpoint calls this."""
    secret = pyotp.random_base32()
    owner = PlatformOwner(email=email, hashed_password=hash_password(password), totp_secret=secret)
    db.add(owner)
    db.commit()
    return owner, secret
