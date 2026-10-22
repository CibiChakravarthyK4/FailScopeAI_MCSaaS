from sqlalchemy.orm import Session

from app.config import settings
from app.models.demo_request import DemoRequest, DemoRequestStatus
from app.schemas.public import DemoRequestCreate
from app.services import mail_service, public_submission_service


def submit_demo_request(db: Session, req: DemoRequestCreate, ip: str | None, user_agent: str | None) -> None:
    if public_submission_service.is_honeypot_triggered(req.website):
        return

    entry = DemoRequest(
        name=req.name,
        email=req.email,
        company=req.company,
        role=req.role,
        team_size=req.team_size,
        want_to_see=req.want_to_see,
        preferred_time=req.preferred_time,
        consent=req.consent,
        ip_hash=public_submission_service.hash_ip(ip),
        user_agent=(user_agent or "")[:500] or None,
        status=DemoRequestStatus.new,
    )
    db.add(entry)
    db.commit()

    mail_service.send_notification(
        to=settings.SALES_EMAIL,
        subject=f"New demo request: {req.company}",
        body=(
            f"From: {req.name} <{req.email}>\nCompany: {req.company}\nRole: {req.role}\n"
            f"Team size: {req.team_size.value}\nPreferred time: {req.preferred_time or '-'}\n\n"
            f"{req.want_to_see or '(no notes)'}"
        ),
    )
