from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str | None = None
    tenant_name: str
    accepted_terms: bool

    @field_validator('accepted_terms')
    @classmethod
    def accepted_terms_required(cls, v: bool) -> bool:
        if not v:
            raise ValueError('You must accept the Terms and Conditions and Privacy Policy')
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    tenant_id: int
    email: EmailStr
    full_name: str | None
    role: str
    is_active: bool
    tenant_name: str
    needs_legal_acceptance: bool

    class Config:
        from_attributes = True
