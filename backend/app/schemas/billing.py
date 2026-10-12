from pydantic import BaseModel


class BillingStatusResponse(BaseModel):
    configured: bool
    plan: str


class CheckoutResponse(BaseModel):
    checkout_url: str
