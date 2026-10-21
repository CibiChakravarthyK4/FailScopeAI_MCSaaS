from datetime import datetime

from pydantic import BaseModel


class DiagnosisResponse(BaseModel):
    id: int
    test_case_id: int
    run_id: int
    category: str
    confidence_score: float
    evidence: dict
    model_provider: str
    model_name: str
    prompt_version: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryEntryResponse(BaseModel):
    action: str
    actor_email: str | None
    entity_type: str
    entity_id: int | None
    metadata: dict | None
    created_at: datetime


class DiagnosisListItem(DiagnosisResponse):
    test_case_name: str


class FailureGroupResponse(BaseModel):
    id: int
    title: str
    signature_hash: str
    created_at: datetime
    member_count: int

    class Config:
        from_attributes = True


class MergeGroupsRequest(BaseModel):
    target_group_id: int


class SplitGroupRequest(BaseModel):
    test_case_ids: list[int]
    new_title: str
