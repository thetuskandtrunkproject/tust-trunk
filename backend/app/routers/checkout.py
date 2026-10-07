import logging
from fastapi import APIRouter, Depends, Request, status, Header
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client
import os

from app.core.database import get_db_client
from app.dependencies.auth import get_optional_user
from app.schemas.checkout import (
    CreateOrderRequest,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    GuestOrderResponse,
)
from pydantic import BaseModel
from typing import List

class ApplyCouponRequestItem(BaseModel):
    variant_id: str
    quantity: int

class ApplyCouponRequest(BaseModel):
    code: str
    items: List[ApplyCouponRequestItem]
from app.services import checkout_service

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Two routers
# ---------------------------------------------------------------------------
checkout_router = APIRouter(prefix="/api/v1/checkout", tags=["Checkout"])
orders_router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


# ---------------------------------------------------------------------------
# Rate limiters
#
# _checkout_key_func: for authenticated calls we key by user_id so a single
# user can't spam from multiple IPs; for guests we fall back to IP.
# This mirrors the pattern from Modules 4/5 but adapted for optional auth.
# ---------------------------------------------------------------------------

def _checkout_key_func(request: Request) -> str:
    user = getattr(request.state, 'user', None)
    if user and 'id' in user:
        return f"user:{user['id']}"
    return f"ip:{get_remote_address(request)}"


create_order_limiter = Limiter(key_func=_checkout_key_func, storage_uri=os.getenv("REDIS_URL", "memory://"))
verify_limiter = Limiter(key_func=_checkout_key_func, storage_uri=os.getenv("REDIS_URL", "memory://"))

# Webhook: IP-based only (Razorpay's servers — not user-keyed)
webhook_limiter = Limiter(key_func=get_remote_address, storage_uri=os.getenv("REDIS_URL", "memory://"))

# Guest order lookup: IP-based, tight — brute-force resistance on order_number+email
guest_lookup_limiter = Limiter(key_func=get_remote_address, storage_uri=os.getenv("REDIS_URL", "memory://"))

# check-payment: Step 5 fallback — tight because it makes an outbound Razorpay API call
check_payment_limiter = Limiter(key_func=_checkout_key_func, storage_uri=os.getenv("REDIS_URL", "memory://"))


# ---------------------------------------------------------------------------
# Auth attachment helper
# Module 1 already provides get_optional_user which returns None for guests
# and raises 401 for invalid tokens. We add request.state attachment so the
# rate-limiter's key_func can read it from state.
# ---------------------------------------------------------------------------

def get_and_attach_optional_user(
    request: Request,
    user: Optional[dict] = Depends(get_optional_user),
) -> Optional[dict]:
    """
    Wraps Module 1's get_optional_user to also attach the user to
    request.state, making it available to the rate-limiter key_func
    without re-parsing the JWT.
    """
    request.state.user = user
    return user


# ---------------------------------------------------------------------------
# POST /api/v1/checkout/apply-coupon
# ---------------------------------------------------------------------------

@checkout_router.post("/apply-coupon")
@create_order_limiter.limit("10/minute")
def apply_coupon_endpoint(
    request: Request,
    payload: ApplyCouponRequest,
    current_user: Optional[dict] = Depends(get_and_attach_optional_user),
    db: Client = Depends(get_db_client),
):
    from app.services.coupons_service import validate_coupon_for_cart
    
    # 1. Securely compute subtotal server-side based on actual DB prices
    items_list = [item.model_dump() for item in payload.items]
    subtotal_paise, validated_items = checkout_service._validate_cart_items(db, items_list)
    
    user_id = current_user['id'] if current_user else None
    discount_paise, coupon = validate_coupon_for_cart(
        db=db,
        code=payload.code,
        subtotal_paise=subtotal_paise,
        user_id=user_id,
        validated_items=validated_items
    )
    return {
        "code": coupon['code'],
        "discount_paise": discount_paise,
        "discount_type": coupon['discount_type']
    }

# ---------------------------------------------------------------------------
# POST /api/v1/checkout/create-order
# ---------------------------------------------------------------------------

@checkout_router.post("/create-order")
@create_order_limiter.limit("10/minute")
def create_order_endpoint(
    request: Request,
    payload: CreateOrderRequest,
    current_user: Optional[dict] = Depends(get_and_attach_optional_user),
    db: Client = Depends(get_db_client),
):
    """
    Step 1: Re-fetch prices/stock from DB, compute server-side total,
    create Razorpay order, persist checkout_session.
    Returns razorpay_order_id, amount_paise, key_id for frontend Checkout.js.

    Auth rules (non-negotiable, confirmed at project start):
      - Guest (no token): ALLOWED.
      - Logged-in, email_verified = True: ALLOWED.
      - Logged-in, email_verified = False: BLOCKED (403).
    """
    if current_user is not None and not current_user.get('email_verified', False):
        from fastapi import HTTPException
        raise HTTPException(
            status_code=403,
            detail="Please verify your email address before placing an order."
        )

    user_id = current_user['id'] if current_user else None

    try:
        return checkout_service.create_order(
            db=db,
            user_id=user_id,
            payload=payload.model_dump(),
        )
    except Exception as e:
        logger.error(f"Failed to create order (Razorpay/DB error): {e}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=502,
            detail="Failed to initialize payment gateway. Please try again."
        )


# ---------------------------------------------------------------------------
# POST /api/v1/checkout/verify-payment
# ---------------------------------------------------------------------------

@checkout_router.post("/verify-payment", response_model=VerifyPaymentResponse)
@verify_limiter.limit("5/minute")
def verify_payment_endpoint(
    request: Request,
    payload: VerifyPaymentRequest,
    current_user: Optional[dict] = Depends(get_and_attach_optional_user),
    db: Client = Depends(get_db_client),
):
    """
    Steps 3+4 (client-driven path): Verify Razorpay HMAC-SHA256 signature
    using KEY_SECRET, then call the shared commit_order() RPC.

    The client body contains ONLY the three Razorpay token fields.
    Order is built exclusively from the server-side checkout_session.
    items/contact/shipping are NOT accepted here — zero tampering surface.

    Auth rules: same as create-order.
    """
    if current_user is not None and not current_user.get('email_verified', False):
        from fastapi import HTTPException
        raise HTTPException(
            status_code=403,
            detail="Please verify your email address before placing an order."
        )

    return checkout_service.verify_payment(
        db=db,
        user_id=current_user['id'] if current_user else None,
        payload=payload.model_dump(),
    )


# ---------------------------------------------------------------------------
# POST /api/v1/checkout/webhook
# ---------------------------------------------------------------------------

@checkout_router.post("/webhook", status_code=status.HTTP_200_OK)
@webhook_limiter.limit("60/minute")
async def webhook_endpoint(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
    db: Client = Depends(get_db_client),
):
    """
    Razorpay server-to-server payment.captured webhook receiver.

    This is the reconciliation path for the gap in the client-driven flow:
    if the user's browser closes after payment capture but before
    verify-payment completes, this webhook fires and commits the order.

    BOTH this endpoint and verify_payment_endpoint call
    checkout_service._run_commit_rpc() → commit_order() RPC.
    There is exactly one commit implementation — they cannot drift.

    Signature: HMAC_SHA256(RAZORPAY_WEBHOOK_SECRET, raw_body_bytes).
    WEBHOOK_SECRET != KEY_SECRET. Separate env vars, separate HMAC operations.
    Raw bytes are read BEFORE JSON parsing (signature is over the wire bytes).
    """
    if not x_razorpay_signature:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Missing X-Razorpay-Signature header.")

    # CRITICAL: read raw body BEFORE any parsing
    raw_body = await request.body()

    return checkout_service.process_webhook(
        raw_body=raw_body,
        signature_header=x_razorpay_signature,
        db=db,
    )


# ---------------------------------------------------------------------------
# GET /api/v1/checkout/check-payment/{razorpay_order_id}
# ---------------------------------------------------------------------------

@checkout_router.get("/check-payment/{razorpay_order_id}")
@check_payment_limiter.limit("5/minute")
def check_payment_endpoint(
    request: Request,
    razorpay_order_id: str,
    current_user: Optional[dict] = Depends(get_and_attach_optional_user),
    db: Client = Depends(get_db_client),
):
    """
    Step 5 fallback: Direct Razorpay API reconciliation check.

    Called by the frontend after the Razorpay SDK fires 'payment.failed' to
    verify whether the payment was actually captured before navigating to
    the failure page. Necessary for UPI/netbanking flows where the SDK event
    and the actual bank settlement can race.

    No payment IDs are accepted from the client — this endpoint fetches
    payment data directly from Razorpay's API using the razorpay_order_id,
    so there is no client injection surface.

    If a captured payment is found, calls commit_order() RPC (idempotent —
    safe even if webhook already committed). Returns committed=True/False.
    """
    return checkout_service.check_payment_status(
        db=db,
        razorpay_order_id=razorpay_order_id,
    )


# ---------------------------------------------------------------------------
# GET /api/v1/orders/guest/{order_number}?email=...
# ---------------------------------------------------------------------------

@orders_router.get("/guest/{order_number}", response_model=GuestOrderResponse)
@guest_lookup_limiter.limit("10/minute")
def get_guest_order_endpoint(
    request: Request,
    order_number: str,
    email: str,
    db: Client = Depends(get_db_client),
):
    """
    Guest order confirmation lookup by order_number + email pair.

    Security properties:
    - Case-insensitive email comparison (normalized on both sides).
    - Deliberately vague 404 on mismatch — does not confirm whether the
      order_number exists without the correct email.
    - Rate-limited to 10/min by IP (tight — brute-force resistance).
    - XXX random suffix in order numbers adds 4096-combination entropy
      on top of the sequential component.
    """
    return checkout_service.get_guest_order(
        db=db,
        order_number=order_number,
        email=email,
    )
