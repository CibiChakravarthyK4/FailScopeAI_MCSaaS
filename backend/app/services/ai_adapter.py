import json
from dataclasses import dataclass

from openai import OpenAI

from app.config import settings
from app.exceptions import AppException

PROMPT_VERSION = "diagnosis-v1"
MODEL_PROVIDER = "openai"

# Public per-token pricing estimates (USD per 1K tokens) for cost-ceiling bookkeeping.
# These are approximations for budgeting, not a billing source of truth.
_PRICE_PER_1K_INPUT = 0.00015
_PRICE_PER_1K_OUTPUT = 0.0006

_CATEGORIES = [
    "application_bug",
    "script_issue",
    "data_issue",
    "environment",
    "integration",
    "unknown",
]

_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "category": {"type": "string", "enum": _CATEGORIES},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "evidence": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["category", "confidence", "evidence"],
    "additionalProperties": False,
}

_SYSTEM_PROMPT = (
    "You are a QA test-failure investigator. Given a failing test case and its evidence "
    "(stack trace, log excerpts), classify the root cause into exactly one of: "
    f"{', '.join(_CATEGORIES)}. "
    "Cite concrete evidence for your classification in the 'evidence' list - each item should "
    "quote or reference something specific in the input, not a generic statement. "
    "If the evidence is insufficient to confidently classify the failure, respond with "
    "category 'unknown' and a low confidence score rather than guessing."
)


@dataclass
class DiagnosisResult:
    category: str
    confidence: float
    evidence: list[str]
    model_provider: str
    model_name: str
    prompt_version: str
    tokens_in: int
    tokens_out: int
    cost_usd: float


def _client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise AppException("AI provider is not configured (missing OPENAI_API_KEY)", "NOT_CONFIGURED", 503)
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def investigate(
    test_name: str,
    classname: str | None,
    stack_trace_redacted: str,
    log_excerpts_redacted: list[str],
) -> DiagnosisResult:
    client = _client()

    user_content = (
        f"Test: {test_name}\n"
        f"Class: {classname or 'unknown'}\n"
        f"Stack trace:\n{stack_trace_redacted or '(none captured)'}\n\n"
        f"Log excerpts:\n" + ("\n---\n".join(log_excerpts_redacted) if log_excerpts_redacted else "(none)")
    )

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "diagnosis", "schema": _RESPONSE_SCHEMA, "strict": True},
        },
    )

    parsed = json.loads(response.choices[0].message.content)
    usage = response.usage
    tokens_in = usage.prompt_tokens if usage else 0
    tokens_out = usage.completion_tokens if usage else 0
    cost_usd = (tokens_in / 1000) * _PRICE_PER_1K_INPUT + (tokens_out / 1000) * _PRICE_PER_1K_OUTPUT

    return DiagnosisResult(
        category=parsed["category"],
        confidence=float(parsed["confidence"]),
        evidence=parsed["evidence"],
        model_provider=MODEL_PROVIDER,
        model_name=settings.OPENAI_MODEL,
        prompt_version=PROMPT_VERSION,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        cost_usd=cost_usd,
    )
