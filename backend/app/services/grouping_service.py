import hashlib
import re
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.exceptions import ForbiddenError, NotFoundError
from app.models.diagnosis import Diagnosis
from app.models.failure_group import FailureGroup, FailureGroupMember
from app.models.test_case import TestCase

_NORMALIZE_DIGITS = re.compile(r"\d+")
_NORMALIZE_PATHS = re.compile(r"(/[\w.\-]+)+|([A-Za-z]:\\[\w.\-\\]+)")


def compute_signature(classname: str | None, category: str, stack_trace: str | None) -> str:
    first_line = (stack_trace or "").strip().splitlines()[0] if stack_trace else ""
    normalized = _NORMALIZE_PATHS.sub("<path>", first_line)
    normalized = _NORMALIZE_DIGITS.sub("<n>", normalized).lower()
    raw = f"{classname or ''}|{category}|{normalized}"
    return hashlib.sha256(raw.encode()).hexdigest()


def assign_to_group(
    db: Session, tenant_id: int, test_case: TestCase, diagnosis: Diagnosis, actor_id: int
) -> FailureGroup:
    signature = compute_signature(test_case.classname, diagnosis.category.value, test_case.stack_trace)

    group = (
        db.query(FailureGroup)
        .filter(FailureGroup.tenant_id == tenant_id, FailureGroup.signature_hash == signature)
        .first()
    )
    if not group:
        group = FailureGroup(
            tenant_id=tenant_id,
            signature_hash=signature,
            title=f"{diagnosis.category.value.replace('_', ' ').title()}: {test_case.name}",
        )
        db.add(group)
        db.flush()

    already_member = (
        db.query(FailureGroupMember)
        .filter(
            FailureGroupMember.group_id == group.id,
            FailureGroupMember.test_case_id == test_case.id,
            FailureGroupMember.removed_at.is_(None),
        )
        .first()
    )
    if not already_member:
        db.add(FailureGroupMember(group_id=group.id, test_case_id=test_case.id, added_by=actor_id))
        db.flush()

    return group


def merge_groups(
    db: Session, tenant_id: int, source_group_id: int, target_group_id: int, actor_id: int
) -> FailureGroup:
    source = (
        db.query(FailureGroup)
        .filter(FailureGroup.tenant_id == tenant_id, FailureGroup.id == source_group_id)
        .first()
    )
    target = (
        db.query(FailureGroup)
        .filter(FailureGroup.tenant_id == tenant_id, FailureGroup.id == target_group_id)
        .first()
    )
    if not source or not target:
        raise NotFoundError("Failure group")
    if source.id == target.id:
        raise ForbiddenError("Cannot merge a group into itself")

    active_members = (
        db.query(FailureGroupMember)
        .filter(FailureGroupMember.group_id == source.id, FailureGroupMember.removed_at.is_(None))
        .all()
    )
    now = datetime.now(UTC)
    for member in active_members:
        member.removed_at = now
        db.add(
            FailureGroupMember(group_id=target.id, test_case_id=member.test_case_id, added_by=actor_id)
        )
    db.commit()
    return target


def split_group(
    db: Session, tenant_id: int, group_id: int, test_case_ids: list[int], new_title: str, actor_id: int
) -> FailureGroup:
    source = db.query(FailureGroup).filter(FailureGroup.tenant_id == tenant_id, FailureGroup.id == group_id).first()
    if not source:
        raise NotFoundError("Failure group")

    split_signature = hashlib.sha256(f"split:{source.signature_hash}:{group_id}:{new_title}".encode()).hexdigest()
    new_group = FailureGroup(tenant_id=tenant_id, signature_hash=split_signature, title=new_title)
    db.add(new_group)
    db.flush()

    now = datetime.now(UTC)
    moved = 0
    for test_case_id in test_case_ids:
        member = (
            db.query(FailureGroupMember)
            .filter(
                FailureGroupMember.group_id == source.id,
                FailureGroupMember.test_case_id == test_case_id,
                FailureGroupMember.removed_at.is_(None),
            )
            .first()
        )
        if member:
            member.removed_at = now
            db.add(FailureGroupMember(group_id=new_group.id, test_case_id=test_case_id, added_by=actor_id))
            moved += 1

    if moved == 0:
        raise ForbiddenError("None of the given test cases are active members of this group")

    db.commit()
    return new_group
