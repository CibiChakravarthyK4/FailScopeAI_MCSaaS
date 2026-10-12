from datetime import datetime

from pydantic import BaseModel


class ReviewRequest(BaseModel):
    action: str  # accept | reject | correct
    corrected_category: str | None = None
    reason: str | None = None


class ReviewResponse(BaseModel):
    id: int
    diagnosis_id: int
    reviewer_id: int
    action: str
    corrected_category: str | None
    reason: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CreateExportRequest(BaseModel):
    test_case_id: int | None = None
    failure_group_id: int | None = None
    title: str
    steps: str
    expected_result: str
    actual_result: str


class ExportResponse(BaseModel):
    id: int
    title: str
    steps: str
    expected_result: str
    actual_result: str
    evidence_refs: dict
    jira_issue_key: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
