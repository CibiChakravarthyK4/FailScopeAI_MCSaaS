from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    """Rejects requests whose declared Content-Length exceeds the configured limit,
    before the body is read into memory. This is a Content-Length check, not a
    streaming byte-counter, so it can be bypassed by a client that omits the header
    (e.g. chunked transfer encoding) - it stops the common case of oversized
    uploads, not a determined adversary with a custom client.
    """

    def __init__(self, app, max_bytes: int):
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_bytes:
            return JSONResponse(
                status_code=413,
                content={"code": "PAYLOAD_TOO_LARGE", "message": "Request body exceeds the maximum upload size"},
            )
        return await call_next(request)
