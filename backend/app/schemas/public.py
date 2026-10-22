from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.contact_message import ContactTopic
from app.models.demo_request import TeamSize


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    company: str | None = Field(default=None, max_length=200)
    topic: ContactTopic
    message: str = Field(min_length=20, max_length=2000)
    consent: bool
    # Honeypot: real visitors never see or fill this field (hidden via CSS).
    # A non-empty value means a bot filled every field - drop the
    # submission but still return 201, so the bot has no signal to retry.
    website: str = Field(default="", max_length=200)

    @field_validator("consent")
    @classmethod
    def consent_required(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Consent is required")
        return v


class ContactResponse(BaseModel):
    status: str = "received"


class DemoRequestCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    company: str = Field(min_length=1, max_length=200)
    role: str = Field(min_length=1, max_length=200)
    team_size: TeamSize
    want_to_see: str | None = Field(default=None, max_length=1000)
    preferred_time: str | None = Field(default=None, max_length=200)
    consent: bool
    website: str = Field(default="", max_length=200)

    @field_validator('consent')
    @classmethod
    def consent_required(cls, v: bool) -> bool:
        if not v:
            raise ValueError('Consent is required')
        return v


class DemoRequestResponse(BaseModel):
    status: str = "received"


class HelpArticleFeedbackCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=200)
    helpful: bool


class HelpArticleFeedbackResponse(BaseModel):
    status: str = "received"


class CareerRoleResponse(BaseModel):
    title: str
    team: str
    location: str
    type: str
    description: str
    requirements: list[str]


class CareerApplicationResponse(BaseModel):
    status: str = "received"
