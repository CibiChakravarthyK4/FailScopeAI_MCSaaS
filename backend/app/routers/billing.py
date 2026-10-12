import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.billing.stripe_client import construct_webhook_event, create_checkout_session
from app.database import get_db
from app.dependencies import require_role
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.schemas.billing import BillingStatusResponse, CheckoutResponse
from app.services import billing_service
from app.services.audit_service import record as record_audit

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("/status", response_model=BillingStatusResponse)
def billing_status(db: Session = Depends(get_db), user: User = Depends(require_role(UserRole.admin))):
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    return BillingStatusResponse(configured=billing_service.billing_is_configured(), plan=tenant.plan)


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(db: Session = Depends(get_db), user: User = Depends(require_role(UserRole.admin))):
    if not billing_service.billing_is_configured():
        raise HTTPException(status_code=503, detail="Billing is not configured for this deployment yet")
    url = create_checkout_session(user.tenant_id, user.email)
    return CheckoutResponse(checkout_url=url)


@router.post("/webhook", status_code=204)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if not billing_service.billing_is_configured():
        raise HTTPException(status_code=503, detail="Billing is not configured for this deployment yet")

    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    try:
        event = construct_webhook_event(payload, signature)
    except (stripe.SignatureVerificationError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        tenant_id = int(session["client_reference_id"])
        billing_service.set_tenant_plan(db, tenant_id, "pro")
        record_audit(db, tenant_id, None, "billing_upgraded_to_pro", "tenant", tenant_id)
        db.commit()
    elif event["type"] == "customer.subscription.deleted":
        # Subscription objects don't carry our client_reference_id, so the
        # customer's email (set at checkout) is how we map back to a tenant.
        subscription = event["data"]["object"]
        customer = stripe.Customer.retrieve(subscription["customer"])
        tenant = (
            db.query(Tenant)
            .join(User, User.tenant_id == Tenant.id)
            .filter(User.email == customer["email"])
            .first()
        )
        if tenant:
            billing_service.set_tenant_plan(db, tenant.id, "pilot")
            record_audit(db, tenant.id, None, "billing_downgraded_to_pilot", "tenant", tenant.id)
            db.commit()
