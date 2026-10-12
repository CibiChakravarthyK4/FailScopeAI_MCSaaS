import stripe

from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(tenant_id: int, tenant_email: str) -> str:
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": settings.STRIPE_PRICE_ID_PRO, "quantity": 1}],
        customer_email=tenant_email,
        client_reference_id=str(tenant_id),
        success_url=f"{settings.FRONTEND_URL}/settings?billing=success",
        cancel_url=f"{settings.FRONTEND_URL}/settings?billing=cancelled",
    )
    return session.url


def construct_webhook_event(payload: bytes, signature: str) -> stripe.Event:
    return stripe.Webhook.construct_event(payload, signature, settings.STRIPE_WEBHOOK_SECRET)
