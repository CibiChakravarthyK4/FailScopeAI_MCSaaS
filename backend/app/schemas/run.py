from datetime import datetime

from pydantic import BaseModel

from app.schemas.diagnosis import DiagnosisResponse


class TestCaseResponse(BaseModel):
    id: int
    name: str
    classname: str | None
    status: str
    duration_ms: int | None
    stack_trace: str | None

    class Config:
        from_attributes = True


class RunResponse(BaseModel):
    id: int
    external_run_id: str
    build_id: str | None
    environment: str | None
    source_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RunDetailResponse(RunResponse):
    test_cases: list[TestCaseResponse]


class ArtifactResponse(BaseModel):
    id: int
    type: str
    storage_path: str
    checksum_sha256: str
    redacted: bool

    class Config:
        from_attributes = True


class EvidenceResponse(BaseModel):
    test_case: TestCaseResponse
    artifacts: list[ArtifactResponse]
    diagnoses: list[DiagnosisResponse]


class JobResponse(BaseModel):
    id: int
    type: str
    status: str
    attempts: int
    error: dict | None

    class Config:
        from_attributes = True
