import hmac
import hashlib
import logging
import uuid
import requests as http_requests

from fastapi import HTTPException
from supabase import Client

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# DELIVERY FEE BUSINESS RULE (flagged for review before launch):
# Free delivery for orders with subtotal >= ₹3000 (300000 paise).
# Otherwise flat ₹60 (6000 paise).
# This matches the frontend's current hardcoded logic in step-review.tsx.
FREE_DELIVERY_THRESHOLD_PAISE = 300_000
DELIVERY_FEE_PAISE = 6_000

RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"

# ---------------------------------------------------------------------------
# SQLSTATE codes raised by commit_order() plpgsql RPC (migration 010).
# Must stay in sync with USING ERRCODE values in the SQL function.
# ---------------------------------------------------------------------------
_COMMIT_ERRCODE_TO_HTTP = {
    'C1001': (404, "Checkout session not found. Please start a new order."),
    'C1002': (400, "Your checkout session has expired. Please start a new order."),
    'C1003': (400, "Checkout session was already processed."),
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _raise_from_commit_rpc_error(e: Exception) -> None:
    """
    Map a commit_order() RPC exception to an HTTPException using the
    structured SQLSTATE code — no substring matching.
    """
    code = None
    if hasattr(e, 'code'):
        code = e.code
    if code is None and e.args:
        arg = e.args[0]
        if isinstance(arg, dict):
            code = arg.get('code')

    http_status, detail = _COMMIT_ERRCODE_TO_HTTP.get(code, (500, "Order commit failed."))
    raise HTTPException(status_code=http_status, detail=detail)


def _verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verify Razorpay's embedded checkout payment signature.

    Razorpay's documented HMAC-SHA256 scheme for embedded checkout:
      message = razorpay_order_id + "|" + razorpay_payment_id
      expected_signature = HMAC_SHA256(key_secret, message)

    Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/
            standard/build-integration/#15-verify-the-razorpay-signature

    IMPORTANT: This uses RAZORPAY_KEY_SECRET — NOT the webhook secret.
    The two secrets are stored in separate env vars and serve different
    HMAC operations. Never swap them.

    The razorpay_signature value is NEVER logged, even on failure.
    """
    key_secret = settings.RAZORPAY_KEY_SECRET
    if not key_secret:
        logger.error("RAZORPAY_KEY_SECRET is not configured.")
        return False

    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(
        key_secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, razorpay_signature)


def _verify_webhook_signature(raw_body: bytes, signature_header: str) -> bool:
    """
    Verify Razorpay's webhook payload signature.

    Razorpay's webhook signature scheme:
      expected = HMAC_SHA256(webhook_secret, raw_request_body_bytes)

    Source: https://razorpay.com/docs/webhooks/validate-test/#validate-webhooks

    IMPORTANT: This uses RAZORPAY_WEBHOOK_SECRET — NOT the key secret.
    The raw body bytes must be used BEFORE any JSON parsing. FastAPI's
    Request.body() is called for this reason before Pydantic parsing.

    The received signature value is NEVER logged.
    """
    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not webhook_secret:
        logger.error("RAZORPAY_WEBHOOK_SECRET is not configured.")
        return False

    expected = hmac.new(
        webhook_secret.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def _compute_delivery_fee(subtotal_paise: int) -> int:
    """
    Compute delivery fee in paise.
    Business rule: free above ₹3000 subtotal, else ₹60 flat.
    Flagged: revisit this value before launch if the actual business rule differs.
    """
    if subtotal_paise >= FREE_DELIVERY_THRESHOLD_PAISE:
        return 0
    return DELIVERY_FEE_PAISE


# ---------------------------------------------------------------------------
# create_order
# ---------------------------------------------------------------------------

def create_order(db: Client, user_id: str | None, payload: dict) -> dict:
    """
    Step 1 of the checkout flow.

    1. DEDUPLICATE items by variant_id (sum quantities) — before any DB access.
       This closes a bug where duplicate variant_ids in the request would each
       be validated against the same unreduced stock value, allowing combined-
       insufficient quantities to pass, then driving stock negative in commit_order
       and surfacing as a 500 rather than a clean requires_review outcome.
       After this step, each variant_id appears exactly once in merged_items,
       which is the assumption commit_order()'s per-item deduction loop relies on.

    2. SINGLE QUERY for all variants (no N+1).
       All needed variant rows are fetched in one .in_() call and matched in
       Python, rather than one .single().execute() per item.

    3. Validate stock, compute server-side totals (all in paise — never rupees).

    4. Capture product/sku/size snapshots for commit_order() to use later.

    5. Create Razorpay order, persist checkout_session, return tokens for Checkout.js.

    The client's stated prices are NEVER used. Only DB-fetched prices are used.
    """
    items = payload['items']
    contact = payload['contact']
    shipping = payload['shipping']

    # -------------------------------------------------------------------------
    # Step 1: Deduplicate items by variant_id, summing quantities.
    #
    # Input may contain the same variant_id more than once due to a frontend
    # bug, a double-submit, or a tampered request. We reduce to one entry per
    # unique variant_id BEFORE validating against stock, so the combined
    # quantity is checked against a single stock value in one comparison.
    # This also guarantees validated_items has one row per variant_id, which
    # is the structural assumption commit_order()'s deduction loop depends on.
    # -------------------------------------------------------------------------
    merged: dict[str, int] = {}
    for item in items:
        vid = str(item['variant_id'])
        merged[vid] = merged.get(vid, 0) + item['quantity']

    # Cap combined quantity at 10 per variant (mirrors the cart cap).
    # This is a defence-in-depth check; the schema-level Field(le=10) on
    # individual entries in the request is already enforced by Pydantic,
    # but a user could send two entries of 8 + 8 for the same variant_id.
    for vid, qty in merged.items():
        if qty > 10:
            raise HTTPException(
                status_code=400,
                detail=f"Quantity for variant {vid} exceeds maximum of 10 per item."
            )

    unique_variant_ids = list(merged.keys())

    # -------------------------------------------------------------------------
    # Step 2: Fetch ALL variants in ONE query (no N+1).
    #
    # We join product_variants with products inline so we get name, status,
    # and active flag in the same round trip. The result is indexed by
    # variant id for O(1) lookup in the validation loop below.
    # -------------------------------------------------------------------------
    variants_res = (
        db.table('product_variants')
        .select('id, sku, size, price, stock, is_active, products(id, name, status)')
        .in_('id', unique_variant_ids)
        .execute()
    )

    # Index fetched rows by variant id for O(1) lookup
    variants_by_id: dict[str, dict] = {v['id']: v for v in (variants_res.data or [])}

    # -------------------------------------------------------------------------
    # Step 3: Validate every deduplicated item and build validated_items.
    #
    # All checks run against the DB-fetched data. Client-supplied prices are
    # never referenced. The stock check uses the merged (summed) quantity so
    # a user splitting a 15-unit request into multiple entries can't bypass it.
    # -------------------------------------------------------------------------
    validated_items = []
    subtotal_paise = 0

    for variant_id, requested_qty in merged.items():
        variant = variants_by_id.get(variant_id)
        if not variant:
            raise HTTPException(status_code=404, detail=f"Variant {variant_id} not found.")

        product = variant.get('products') or {}

        if not variant.get('is_active') or product.get('status') != 'Active':
            raise HTTPException(
                status_code=400,
                detail=f"Item '{product.get('name', variant_id)}' is no longer available."
            )

        if variant['stock'] < requested_qty:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product.get('name', variant_id)}'"
                    f" (size {variant['size']}). "
                    f"Only {variant['stock']} unit(s) available."
                )
            )

        line_total = variant['price'] * requested_qty
        subtotal_paise += line_total

        validated_items.append({
            "variant_id": variant_id,
            "quantity": requested_qty,
            "price_paise": variant['price'],           # paise — from DB, never client
            "product_name_snapshot": product['name'],
            "sku_snapshot": variant['sku'],
            "size_snapshot": variant['size'],
        })

    delivery_fee_paise = _compute_delivery_fee(subtotal_paise)
    total_paise = subtotal_paise + delivery_fee_paise

    # -------------------------------------------------------------------------
    # Step 4: Create Razorpay order via their REST API.
    # Auth: HTTP Basic with key_id (username) and key_secret (password).
    # Amount must be in paise (integer). Currency is INR.
    # receipt: our own idempotency label (not shown to the user).
    # Source: https://razorpay.com/docs/api/orders/create/
    # -------------------------------------------------------------------------
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        logger.error("Razorpay credentials not configured.")
        raise HTTPException(status_code=500, detail="Payment gateway not configured.")

    receipt_id = f"rcpt_{uuid.uuid4().hex[:16]}"
    try:
        rz_response = http_requests.post(
            RAZORPAY_ORDERS_URL,
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
            json={
                "amount": total_paise,
                "currency": "INR",
                "receipt": receipt_id,
            },
            timeout=10,
        )
        rz_response.raise_for_status()
        rz_order = rz_response.json()
    except http_requests.HTTPError as e:
        logger.error("Razorpay order creation failed: status=%s", e.response.status_code)
        raise HTTPException(status_code=502, detail="Could not create payment order. Please try again.")
    except http_requests.RequestException as e:
        logger.error("Razorpay API unreachable: %s", type(e).__name__)
        raise HTTPException(status_code=502, detail="Payment gateway unreachable. Please try again.")

    razorpay_order_id = rz_order['id']

    # -------------------------------------------------------------------------
    # Step 5: Persist validated state into checkout_sessions.
    # This is the server-side ledger that commit_order() uses exclusively.
    # The client CANNOT alter items/prices/shipping at verify-payment time.
    # validated_items is now guaranteed to have one entry per unique variant_id.
    # -------------------------------------------------------------------------
    db.table('checkout_sessions').insert({
        'razorpay_order_id': razorpay_order_id,
        'user_id': user_id,
        'validated_items': validated_items,
        'contact': {
            'email': contact['email'],
            'phone': contact['phone'],
        },
        'shipping': {
            'name': shipping['name'],
            'address1': shipping['address1'],
            'address2': shipping.get('address2'),
            'city': shipping['city'],
            'state': shipping['state'],
            'pincode': shipping['pincode'],
        },
        'subtotal_paise': subtotal_paise,
        'delivery_fee_paise': delivery_fee_paise,
        'total_paise': total_paise,
    }).execute()

    return {
        'razorpay_order_id': razorpay_order_id,
        'amount_paise': total_paise,
        'currency': 'INR',
        'key_id': settings.RAZORPAY_KEY_ID,  # public — safe to expose
        'order_summary': {
            'subtotal_paise': subtotal_paise,
            'delivery_fee_paise': delivery_fee_paise,
            'total_paise': total_paise,
            'line_items': [
                {
                    'variant_id': i['variant_id'],
                    'product_name': i['product_name_snapshot'],
                    'size': i['size_snapshot'],
                    'sku': i['sku_snapshot'],
                    'quantity': i['quantity'],
                    'price_paise': i['price_paise'],
                }
                for i in validated_items
            ],
        },
    }



# ---------------------------------------------------------------------------
# _run_commit_rpc — shared by verify_payment AND process_webhook
# ---------------------------------------------------------------------------

def _run_commit_rpc(db: Client, razorpay_order_id: str, razorpay_payment_id: str, triggered_by: str) -> dict:
    """
    Calls the commit_order() plpgsql RPC and returns the result dict.
    This is the SINGLE commit implementation shared by both the client-driven
    verify-payment path and the server-to-server webhook path.

    triggered_by: 'client' or 'webhook' — stored in the RPC for audit.
    """
    try:
        rpc_res = db.rpc('commit_order', {
            'p_razorpay_order_id': razorpay_order_id,
            'p_razorpay_payment_id': razorpay_payment_id,
            'p_triggered_by': triggered_by,
        }).execute()
        return rpc_res.data
    except Exception as e:
        _raise_from_commit_rpc_error(e)


# ---------------------------------------------------------------------------
# verify_payment (client-driven path)
# ---------------------------------------------------------------------------

def verify_payment(db: Client, user_id: str | None, payload: dict) -> dict:
    """
    Steps 3 + 4 of the checkout flow (client-driven path).

    1. Verify Razorpay's HMAC-SHA256 signature using KEY_SECRET.
       Signature formula: HMAC_SHA256(key_secret, order_id + "|" + payment_id)
       The razorpay_signature value is NEVER logged.
    2. Call commit_order() RPC — the single atomic commit implementation.
    3. Return order summary.
    """
    razorpay_payment_id = payload['razorpay_payment_id']
    razorpay_order_id = payload['razorpay_order_id']
    razorpay_signature = payload['razorpay_signature']

    if not _verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        # Log IDs only — never the signature value itself.
        logger.warning(
            "Signature verification FAILED | order_id=%s payment_id=%s",
            razorpay_order_id, razorpay_payment_id
        )
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    logger.info(
        "Signature verified | order_id=%s payment_id=%s",
        razorpay_order_id, razorpay_payment_id
    )

    return _run_commit_rpc(db, razorpay_order_id, razorpay_payment_id, 'client')


# ---------------------------------------------------------------------------
# process_webhook (server-to-server reconciliation path)
# ---------------------------------------------------------------------------

def process_webhook(raw_body: bytes, signature_header: str, db: Client) -> dict:
    """
    Reconciliation path for Razorpay's server-to-server payment.captured webhook.

    This is the safety net for the gap in the client-driven flow: if the user's
    browser closes after Razorpay captures the payment but before verify-payment
    completes, this webhook fires and commits the order anyway.

    Signature verification uses RAZORPAY_WEBHOOK_SECRET (NOT key_secret).
    Verification: HMAC_SHA256(webhook_secret, raw_request_body_bytes)
    Source: https://razorpay.com/docs/webhooks/validate-test/#validate-webhooks

    The raw body bytes must be used BEFORE any JSON parsing — hence the caller
    passes raw_body directly from Request.body(), not a parsed dict.

    IMPORTANT: The webhook payload shape below is based on Razorpay's documented
    webhook event format for payment.captured events:
      {
        "event": "payment.captured",
        "payload": {
          "payment": {
            "entity": {
              "id": "<razorpay_payment_id>",
              "order_id": "<razorpay_order_id>",
              ...
            }
          }
        }
      }
    Verify this shape against current Razorpay webhook docs before enabling
    webhooks in production: https://razorpay.com/docs/webhooks/payloads/payments/
    """
    import json

    if not _verify_webhook_signature(raw_body, signature_header):
        # Never log the signature value itself.
        logger.warning("Webhook signature verification FAILED.")
        raise HTTPException(status_code=400, detail="Webhook signature verification failed.")

    try:
        body = json.loads(raw_body)
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid webhook payload.")

    event = body.get('event')
    if event != 'payment.captured':
        # Acknowledge non-capture events with 200 without acting on them.
        # Razorpay requires a 200 response to stop retrying.
        logger.info("Webhook: ignoring event type '%s'", event)
        return {"acknowledged": True}

    try:
        payment_entity = body['payload']['payment']['entity']
        razorpay_payment_id = payment_entity['id']
        razorpay_order_id = payment_entity['order_id']
    except (KeyError, TypeError):
        logger.error("Webhook: could not parse payment.captured payload structure.")
        raise HTTPException(status_code=400, detail="Malformed webhook payload.")

    logger.info(
        "Webhook: payment.captured | order_id=%s payment_id=%s",
        razorpay_order_id, razorpay_payment_id
    )

    result = _run_commit_rpc(db, razorpay_order_id, razorpay_payment_id, 'webhook')
    return {"acknowledged": True, "order_number": result.get('order_number')}


# ---------------------------------------------------------------------------
# get_guest_order
# ---------------------------------------------------------------------------

def get_guest_order(db: Client, order_number: str, email: str) -> dict:
    """
    Guest order lookup by order_number + email pair.
    Case-insensitive email comparison (both sides lowercased).
    Used by the order confirmation page for guests who have no account.
    """
    # Fetch order
    res = (
        db.table('orders')
        .select('*')
        .eq('order_number', order_number)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found.")

    order = res.data[0]

    # Case-insensitive email match
    stored_email = (order.get('guest_email') or '').lower().strip()
    provided_email = email.lower().strip()

    if stored_email != provided_email:
        # Intentionally vague: don't reveal whether the order_number exists
        raise HTTPException(status_code=404, detail="Order not found.")

    # Fetch order items
    items_res = (
        db.table('order_items')
        .select('sku_snapshot, product_name_snapshot, size_snapshot, quantity, price_at_purchase')
        .eq('order_id', order['id'])
        .execute()
    )

    return {
        'order_number': order['order_number'],
        'status': order['status'],
        'total_paise': order['total_paise'],
        'subtotal_paise': order['subtotal_paise'],
        'delivery_fee_paise': order['delivery_fee_paise'],
        'shipping_address': order['shipping_address'],
        'items': items_res.data,
        'created_at': order['created_at'],
    }
