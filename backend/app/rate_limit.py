import redis as redis_lib
from fastapi import HTTPException, Request

from app.config import settings

_redis = redis_lib.Redis.from_url(settings.REDIS_URL)


def check_rate_limit(key: str, limit: int, window_seconds: int) -> None:
    """Fixed-window counter backed by Redis. Not perfectly smooth at window
    boundaries, but simple, cheap, and enough to stop brute-force/runaway abuse."""
    current = _redis.incr(key)
    if current == 1:
        _redis.expire(key, window_seconds)
    if current > limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")


def rate_limit_by_ip(key_prefix: str, limit: int, window_seconds: int):
    def dependency(request: Request) -> None:
        identifier = request.client.host if request.client else "unknown"
        check_rate_limit(f"ratelimit:{key_prefix}:{identifier}", limit, window_seconds)

    return dependency
