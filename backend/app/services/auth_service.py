import hashlib
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.config import settings
from app.exceptions import ConflictError, ValidationFailedError
from app.models.refresh_token import RefreshToken
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.services import audit_service, legal_acceptance_service


def _slugify(name: str) -> str:
    slug = "-".join(name.lower().split())[:90]
    return slug or "tenant"


def _unique_slug(db: Session, name: str) -> str:
    slug_base = _slugify(name)
    slug = slug_base
    suffix = 1
    while db.query(Tenant).filter(Tenant.slug == slug).first():
        suffix += 1
        slug = f"{slug_base}-{suffix}"
    return slug


def register(
    db: Session, email: str, password: str, full_name: str | None, tenant_name: str, accepted_terms: bool
) -> User:
    if not accepted_terms:
        raise ValidationFailedError("You must accept the Terms and Conditions and Privacy Policy")

    tenant = Tenant(name=tenant_name, slug=_unique_slug(db, tenant_name), plan="pilot")
    db.add(tenant)
    db.flush()

    if db.query(User).filter(User.tenant_id == tenant.id, User.email == email).first():
        raise ConflictError("Email already registered for this tenant")

    user = User(
        tenant_id=tenant.id,
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=UserRole.admin,
    )
    db.add(user)
    db.flush()
    legal_acceptance_service.record_acceptance_of_both(db, user)
    audit_service.record(db, tenant.id, user.id, "register", "user", user.id)
    audit_service.record(db, tenant.id, user.id, "legal_accepted", "user", user.id)
    db.commit()
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
        return None
    return user


def issue_tokens(db: Session, user: User) -> tuple[str, str]:
    access = create_access_token(user.id, user.tenant_id, user.role.value)
    refresh = create_refresh_token(user.id, user.tenant_id)
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hashlib.sha256(refresh.encode()).hexdigest(),
            expires_at=datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()
    return access, refresh


def refresh_access_token(db: Session, refresh_token: str) -> str:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise ValidationFailedError("Invalid refresh token")

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
        .first()
    )
    if not stored:
        raise ValidationFailedError("Refresh token not recognized")

    user = (
        db.query(User)
        .filter(User.id == int(payload["sub"]), User.tenant_id == int(payload["tenant_id"]))
        .first()
    )
    if not user or not user.is_active:
        raise ValidationFailedError("User not found or inactive")

    return create_access_token(user.id, user.tenant_id, user.role.value)


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if stored:
        stored.revoked = True
        db.commit()


def login_or_create_via_google(db: Session, google_sub: str, email: str, full_name: str | None) -> User:
    user = db.query(User).filter(User.google_sub == google_sub).first()
    if user:
        return user

    tenant_name = full_name or email.split("@")[0]
    tenant = Tenant(name=tenant_name, slug=_unique_slug(db, tenant_name), plan="pilot")
    db.add(tenant)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        email=email,
        full_name=full_name,
        role=UserRole.admin,
        google_sub=google_sub,
    )
    db.add(user)
    db.flush()
    audit_service.record(db, tenant.id, user.id, "google_signup", "user", user.id)
    db.commit()
    return user
