class AppException(Exception):
    def __init__(self, message: str, code: str, status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", "NOT_FOUND", 404)


class ConflictError(AppException):
    def __init__(self, message: str):
        super().__init__(message, "CONFLICT", 409)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Not authorized for this action"):
        super().__init__(message, "FORBIDDEN", 403)


class ValidationFailedError(AppException):
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_FAILED", 422)
