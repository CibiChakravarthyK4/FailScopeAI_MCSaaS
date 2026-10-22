from sqlalchemy.orm import Session

from app.config import settings
from app.models.legal_acceptance import LegalAcceptance, LegalDocument
from app.models.user import User

CURRENT_VERSIONS: dict[LegalDocument, str] = {
    LegalDocument.privacy: settings.PRIVACY_POLICY_VERSION,
    LegalDocument.terms: settings.TERMS_VERSION,
}


def record_acceptance(db: Session, user: User, document: LegalDocument) -> None:
    db.add(LegalAcceptance(user_id=user.id, document=document, version=CURRENT_VERSIONS[document]))


def record_acceptance_of_both(db: Session, user: User) -> None:
    record_acceptance(db, user, LegalDocument.privacy)
    record_acceptance(db, user, LegalDocument.terms)


def has_accepted_current(db: Session, user: User, document: LegalDocument) -> bool:
    # Order by id, not created_at: Postgres' now() is the transaction's start
    # time, not per-statement time, so two rows inserted in the same
    # transaction (e.g. register() then accept-legal() in one test, or any
    # code path that reuses a session) can tie on created_at. id is the only
    # tiebreaker that's actually monotonic.
    latest = (
        db.query(LegalAcceptance)
        .filter(LegalAcceptance.user_id == user.id, LegalAcceptance.document == document)
        .order_by(LegalAcceptance.id.desc())
        .first()
    )
    return latest is not None and latest.version == CURRENT_VERSIONS[document]


def needs_acceptance(db: Session, user: User) -> bool:
    return not (
        has_accepted_current(db, user, LegalDocument.privacy) and has_accepted_current(db, user, LegalDocument.terms)
    )
