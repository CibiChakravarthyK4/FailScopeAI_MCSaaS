from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.search import SearchResponse
from app.services import search_service

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(q: str = "", db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if len(q.strip()) < 2:
        return SearchResponse(runs=[], test_cases=[], failure_groups=[])
    return search_service.search(db, user.tenant_id, q.strip())
