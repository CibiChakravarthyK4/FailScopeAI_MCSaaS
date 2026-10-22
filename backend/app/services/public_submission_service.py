import hashlib

from app.config import settings


def hash_ip(ip: str | None) -> str | None:
    """Never store a raw IP for anonymous public submissions - a one-way hash
    is enough to rate-limit/dedupe abuse without keeping PII we don't need."""
    if not ip:
        return None
    return hashlib.sha256(ip.encode()).hexdigest()


def is_honeypot_triggered(value: str) -> bool:
    return bool(value)


def verify_captcha(token: str | None) -> bool:
    """No real CAPTCHA provider is wired up yet. While CAPTCHA_ENABLED is
    False (the default), this always passes; if it's turned on before a real
    provider replaces this, it fails closed rather than silently passing."""
    if not settings.CAPTCHA_ENABLED:
        return True
    return False
