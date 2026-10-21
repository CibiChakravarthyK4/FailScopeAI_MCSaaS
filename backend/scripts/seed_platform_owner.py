"""Creates the Platform Owner account (CLAUDE.md Section 15).

Deliberately a standalone script, not an HTTP endpoint - there is no API path
that can create a Platform Owner, by design (never through public signup,
never by a tenant Admin). Run once per environment from backend/, with the
venv active and DATABASE_URL pointed at that environment's database:

    python scripts/seed_platform_owner.py owner@example.com

Prompts for a password, then prints the TOTP secret and an otpauth:// URI to
enroll in an authenticator app (Google Authenticator, Authy, 1Password, ...).
That secret is shown exactly once - it is not recoverable from the database.
"""

import getpass
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pyotp  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.models.platform_owner import PlatformOwner  # noqa: E402
from app.services import owner_auth_service  # noqa: E402


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python scripts/seed_platform_owner.py <email>")
        sys.exit(1)
    email = sys.argv[1].strip().lower()

    db = SessionLocal()
    try:
        if db.query(PlatformOwner).filter(PlatformOwner.email == email).first():
            print(f"A Platform Owner already exists for {email}.")
            sys.exit(1)

        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords did not match.")
            sys.exit(1)
        if len(password) < 12:
            print("Use a password of at least 12 characters for this account.")
            sys.exit(1)

        owner, secret = owner_auth_service.create_owner(db, email, password)
        uri = pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name="RootTrace Ivory")

        print(f"\nPlatform Owner created (id={owner.id}, email={owner.email}).")
        print(f"\nTOTP secret (enter manually if you can't scan a QR code): {secret}")
        print(f"\nAuthenticator enrollment URI:\n{uri}")
        print("\nStore the secret securely - it will not be shown again.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
