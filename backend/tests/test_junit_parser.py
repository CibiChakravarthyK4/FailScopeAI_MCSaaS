import pytest
from app.exceptions import ValidationFailedError
from app.services.junit_parser import parse_junit_xml

VALID_XML = b"""<?xml version="1.0"?>
<testsuite name="Suite">
  <testcase name="test_pass" classname="C" time="0.1"></testcase>
  <testcase name="test_fail" classname="C" time="0.2" timestamp="2026-01-01T00:00:00">
    <failure message="boom">AssertionError: boom</failure>
  </testcase>
  <testcase name="test_error" classname="C" time="0.3">
    <error message="oops">RuntimeError: oops</error>
  </testcase>
  <testcase name="test_skip" classname="C" time="0.05">
    <skipped message="not ready" />
  </testcase>
</testsuite>
"""


def test_parses_failed_error_and_skipped_excludes_passed():
    results = parse_junit_xml(VALID_XML)
    names = {r.name for r in results}
    assert names == {"test_fail", "test_error", "test_skip"}


def test_duration_converted_to_milliseconds():
    results = parse_junit_xml(VALID_XML)
    failed = next(r for r in results if r.name == "test_fail")
    assert failed.duration_ms == 200


def test_timestamp_parsed_when_present():
    results = parse_junit_xml(VALID_XML)
    failed = next(r for r in results if r.name == "test_fail")
    assert failed.started_at is not None


def test_rejects_non_xml_content():
    with pytest.raises(ValidationFailedError):
        parse_junit_xml(b"this is not xml at all <<<")


def test_rejects_wrong_root_element():
    with pytest.raises(ValidationFailedError):
        parse_junit_xml(b"<notatestsuite></notatestsuite>")


def test_rejects_empty_testsuite():
    with pytest.raises(ValidationFailedError):
        parse_junit_xml(b"<testsuite></testsuite>")


def test_rejects_all_passed_suite():
    xml = b'<testsuite><testcase name="t" classname="C"></testcase></testsuite>'
    with pytest.raises(ValidationFailedError):
        parse_junit_xml(xml)


def test_rejects_testcase_missing_name():
    xml = b"""<testsuite>
      <testcase classname="C"><failure>x</failure></testcase>
    </testsuite>"""
    with pytest.raises(ValidationFailedError):
        parse_junit_xml(xml)
