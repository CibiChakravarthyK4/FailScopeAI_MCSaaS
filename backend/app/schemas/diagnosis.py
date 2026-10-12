from datetime import datetime

from pydantic import BaseModel


class DiagnosisResponse(BaseModel):
    id: int
    test_case_id: int
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
