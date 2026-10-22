from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.rate_limit import rate_limit_by_ip
from app.schemas.public import ContactRequest, ContactResponse
from app.services import contact_service

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
