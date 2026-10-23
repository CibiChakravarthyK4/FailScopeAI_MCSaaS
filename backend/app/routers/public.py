from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.rate_limit import rate_limit_by_ip
from app.schemas.public import (
    ContactRequest,
    ContactResponse,
    DemoRequestCreate,
    DemoRequestResponse,
    HelpArticleFeedbackCreate,
    HelpArticleFeedbackResponse,
)
from app.services import contact_service, demo_service, help_feedback_service

router = APIRouter(prefix="/api/public", tags=["public"])


@router.post(
    "/contact",
    response_model=ContactResponse,
    status_code=201,
    dependencies=[Depends(rate_limit_by_ip("public_contact", limit=5, window_seconds=3600))],
)
def contact(req: ContactRequest, request: Request, db: Session = Depends(get_db)):
    contact_service.submit_contact(
        db,
        req,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return ContactResponse()


@router.post(
    "/demo",
    response_model=DemoRequestResponse,
    status_code=201,
    dependencies=[Depends(rate_limit_by_ip("public_demo", limit=5, window_seconds=3600))],
)
def demo(req: DemoRequestCreate, request: Request, db: Session = Depends(get_db)):
    demo_service.submit_demo_request(
        db,
        req,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return DemoRequestResponse()


@router.post(
    "/help-feedback",
    response_model=HelpArticleFeedbackResponse,
    status_code=201,
    dependencies=[Depends(rate_limit_by_ip("public_help_feedback", limit=20, window_seconds=3600))],
)
def help_feedback(req: HelpArticleFeedbackCreate, db: Session = Depends(get_db)):
    help_feedback_service.submit_feedback(db, req.slug, req.helpful)
    return HelpArticleFeedbackResponse()
