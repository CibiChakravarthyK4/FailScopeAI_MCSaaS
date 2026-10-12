from dataclasses import dataclass
from datetime import UTC, datetime

from lxml import etree

from app.exceptions import ValidationFailedError


@dataclass
class ParsedTestCase:
    name: str
    classname: str | None
    status: str
    duration_ms: int | None
    stack_trace: str | None
    started_at: datetime | None


def parse_junit_xml(content: bytes) -> list[ParsedTestCase]:
    try:
        root = etree.fromstring(content)
    except etree.XMLSyntaxError as exc:
        raise ValidationFailedError(f"Invalid JUnit XML: {exc}") from exc

    if root.tag not in ("testsuite", "testsuites"):
        raise ValidationFailedError("Root element must be <testsuite> or <testsuites>")

    testcases = root.findall(".//testcase")
    if not testcases:
        raise ValidationFailedError("No <testcase> elements found in JUnit XML")

    results: list[ParsedTestCase] = []
    for tc in testcases:
        name = tc.get("name")
        if not name:
            raise ValidationFailedError("A <testcase> element is missing the required 'name' attribute")

        classname = tc.get("classname")
        duration_ms = None
        if tc.get("time") is not None:
            try:
                duration_ms = int(float(tc.get("time")) * 1000)
            except ValueError:
                duration_ms = None

        failure = tc.find("failure")
        error = tc.find("error")
        skipped = tc.find("skipped")

        if failure is not None:
            status = "failed"
            stack_trace = failure.text or failure.get("message")
        elif error is not None:
            status = "error"
            stack_trace = error.text or error.get("message")
        elif skipped is not None:
            status = "skipped"
            stack_trace = skipped.get("message")
        else:
            continue  # passed test cases are not failures; FailScope only tracks failures

        started_at = None
        timestamp = tc.get("timestamp")
        if timestamp:
            try:
                started_at = datetime.fromisoformat(timestamp)
                if started_at.tzinfo is None:
                    started_at = started_at.replace(tzinfo=UTC)
            except ValueError:
                started_at = None

        results.append(
            ParsedTestCase(
                name=name,
                classname=classname,
                status=status,
                duration_ms=duration_ms,
                stack_trace=stack_trace,
                started_at=started_at,
            )
        )

    if not results:
        raise ValidationFailedError("No failed, errored, or skipped test cases found in JUnit XML")

    return results
