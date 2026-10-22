from sqlalchemy.orm import Session

from app.config import settings
from app.models.contact_message import ContactMessage, ContactMessageStatus
from app.schemas.public import ContactRequest
from app.services import mail_service, public_submission_service


def submit_contact(db: Session, req: ContactRequest, ip: str | None, user_agent: str | None) -> None:
    if public_submission_service.is_honeypot_triggered(req.website):
        return

    entry = ContactMessage(
        name=req.name,
        email=req.email,
        company=req.company,
        topic=req.topic,
        message=req.message,
        consent=req.consent,
        ip_hash=public_submission_service.hash_ip(ip),
        user_agent=(user_agent or "")[:500] or None,
        status=ContactMessageStatus.new,
    )
    db.add(entry)
    db.commit()

    mail_service.send_notification(
        to=settings.SUPPORT_EMAIL,
        subject=f"New contact message: {req.topic.value}",
        body=f"From: {req.name} <{req.email}>\nCompany: {req.company or '-'}\nTopic: {req.topic.value}\n\n{req.message}",
    )
