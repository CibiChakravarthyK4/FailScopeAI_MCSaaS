import re

_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("aws_access_key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("private_key_block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----")),
    ("jwt", re.compile(r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+")),
    ("bearer_token", re.compile(r"(?i)bearer\s+[A-Za-z0-9\-_.]+")),
    ("connection_string_credentials", re.compile(r"(?i)(postgres|postgresql|mysql|mongodb(?:\+srv)?)://[^:/\s]+:[^@/\s]+@")),
    (
        "assigned_secret",
        re.compile(
            r"(?i)(api[_-]?key|secret|token|password|passwd|pwd|access[_-]?key)\s*[=:]\s*['\"]?[\w\-./+]{6,}"
        ),
    ),
]

REPLACEMENT = "[REDACTED]"


def redact(text: str | None) -> tuple[str, int]:
    """Scrub common credential/secret patterns before text is sent to a model.

    Returns the redacted text and the count of matches removed, for audit logging.
    Does not touch stored artifacts on disk - only the outbound copy used in prompts.
    """
    if not text:
        return "", 0

    redacted = text
    count = 0
    for _name, pattern in _PATTERNS:
        redacted, n = pattern.subn(REPLACEMENT, redacted)
        count += n
    return redacted, count
