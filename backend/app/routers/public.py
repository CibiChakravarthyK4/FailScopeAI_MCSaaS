from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import AppException
from app.rate_limit import rate_limit_by_ip
from app.schemas.public import (
    CareerApplicationResponse,
    CareerRoleResponse,
    ContactRequest,
    ContactResponse,
    DemoRequestCreate,
    DemoRequestResponse,
    HelpArticleFeedbackCreate,
    HelpArticleFeedbackResponse,
)
from app.services import careers_service, contact_service, demo_service, help_feedback_service

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


@router.get("/careers/roles", response_model=list[CareerRoleResponse])
def careers_roles():
    return careers_service.list_open_roles()


@router.post(
    "/careers/applications",
    response_model=CareerApplicationResponse,
    status_code=201,
    dependencies=[Depends(rate_limit_by_ip("public_careers_application", limit=5, window_seconds=3600))],
)
async def careers_applications(
    request: Request,
    role: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str | None = Form(None),
    links: str | None = Form(None),
    note: str | None = Form(None),
    consent: bool = Form(...),
    website: str = Form(""),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    resume_content = await resume.read()
    try:
        careers_service.submit_application(
            db,
            role=role,
            name=name,
            email=email,
            phone=phone,
            links=links,
            note=note,
            consent=consent,
            resume_filename=resume.filename or "resume",
            resume_content=resume_content,
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            website=website,
        )
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return CareerApplicationResponse()
