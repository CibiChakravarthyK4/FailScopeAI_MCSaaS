from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.exceptions import AppException
from app.models.failure_group import FailureGroup, FailureGroupMember
from app.models.user import User, UserRole
from app.schemas.diagnosis import (
    FailureGroupResponse,
    MergeGroupsRequest,
    SplitGroupRequest,
)
from app.services import grouping_service

router = APIRouter(prefix="/api/failure-groups", tags=["failure-groups"])


def _to_response(db: Session, group: FailureGroup) -> FailureGroupResponse:
    count = (
        db.query(FailureGroupMember)
        .filter(FailureGroupMember.group_id == group.id, FailureGroupMember.removed_at.is_(None))
        .count()
    )
    return FailureGroupResponse(
        id=group.id,
        title=group.title,
        signature_hash=group.signature_hash,
        created_at=group.created_at,
        member_count=count,
    )


@router.get("", response_model=list[FailureGroupResponse])
def list_groups(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    groups = db.query(FailureGroup).filter(FailureGroup.tenant_id == user.tenant_id).all()
    return [_to_response(db, group) for group in groups]


@router.post("/{group_id}/merge", response_model=FailureGroupResponse)
def merge(
    group_id: int,
    req: MergeGroupsRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.admin, UserRole.reviewer)),
):
    try:
        target = grouping_service.merge_groups(db, user.tenant_id, group_id, req.target_group_id, user.id)
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return _to_response(db, target)


@router.post("/{group_id}/split", response_model=FailureGroupResponse)
def split(
    group_id: int,
    req: SplitGroupRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.admin, UserRole.reviewer)),
):
    try:
        new_group = grouping_service.split_group(
            db, user.tenant_id, group_id, req.test_case_ids, req.new_title, user.id
        )
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return _to_response(db, new_group)
