---
title: Supported JUnit formats
slug: supported-junit-formats
summary: What a JUnit XML file needs to contain so RootTrace Ivory can parse it correctly.
updated: 2026-10-01
---

## The basic shape

RootTrace Ivory expects the standard JUnit XML structure used by most test runners:

```xml
<testsuite name="my_suite" tests="2" failures="1">
  <testcase name="test_checkout_flow" classname="tests.checkout.CheckoutTest" time="1.23">
    <failure message="AssertionError">AssertionError: expected 200 but got 500</failure>
  </testcase>
  <testcase name="test_login" classname="tests.auth.LoginTest" time="0.5" />
</testsuite>
```

## What we read from each test case

- **name** and **classname** - used to identify the test
- **time** - duration, shown alongside the result
- **failure** or **error** elements - the failure message and stack trace become the primary evidence for diagnosis
- Tests with neither a `failure` nor an `error` element are treated as passed and are not investigated

## Common issues

- **Empty file or no `<testsuite>` root** - the import is rejected with a clear error rather than silently accepted
- **Non-UTF-8 encoding** - re-export your report as UTF-8 if parsing fails
- **Very large files** - the upload limit is 25 MB; if your report is larger, consider splitting it by suite

If your test runner doesn't produce JUnit XML natively, most have a plugin or reporter that does (for example `pytest --junitxml`, or JUnit reporters for Jest and Mocha).
