from app.services.redaction_service import redact


def test_redacts_aws_access_key():
    text, count = redact("key is AKIAABCDEFGHIJKLMNOP end")
    assert "AKIAABCDEFGHIJKLMNOP" not in text
    assert count == 1


def test_redacts_bearer_token():
    text, count = redact("Authorization: Bearer abc123.def456.ghi789")
    assert "abc123.def456.ghi789" not in text
    assert count >= 1


def test_redacts_connection_string_credentials():
    text, count = redact("postgres://admin:SuperSecret123@db.internal:5432/app")
    assert "SuperSecret123" not in text
    assert "db.internal" in text  # host is not a secret, only the credentials
    assert count == 1


def test_redacts_assigned_api_key():
    text, count = redact('api_key="sk-THISISFAKEKEYFORTEST1234"')
    assert "THISISFAKEKEYFORTEST1234" not in text
    assert count == 1


def test_redacts_private_key_block():
    pem = "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAK\n-----END RSA PRIVATE KEY-----"
    text, count = redact(pem)
    assert "MIIBOgIBAAJBAK" not in text
    assert count == 1


def test_leaves_normal_text_untouched():
    text, count = redact("AssertionError: expected 200 but got 401")
    assert text == "AssertionError: expected 200 but got 401"
    assert count == 0


def test_handles_none_and_empty():
    assert redact(None) == ("", 0)
    assert redact("") == ("", 0)
