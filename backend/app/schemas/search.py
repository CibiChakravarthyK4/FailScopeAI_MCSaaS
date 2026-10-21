from pydantic import BaseModel


class SearchRunHit(BaseModel):
    id: int
    external_run_id: str
    status: str


class SearchTestCaseHit(BaseModel):
    id: int
    run_id: int
    name: str
    status: str


class SearchFailureGroupHit(BaseModel):
    id: int
    title: str
    signature_hash: str


class SearchResponse(BaseModel):
    runs: list[SearchRunHit]
    test_cases: list[SearchTestCaseHit]
    failure_groups: list[SearchFailureGroupHit]
