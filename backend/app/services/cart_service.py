from supabase import Client
from fastapi import HTTPException
from typing import List

# ---------------------------------------------------------------------------
# SQLSTATE codes raised by the upsert_cart_item plpgsql RPC.
# These must stay in sync with the USING ERRCODE values in migration 009.
# Supabase surfaces these via the PostgrestAPIError's `code` field.
#
#   C0001 — variant not found
#   C0002 — variant or parent product is inactive/archived
#   C0003 — stock is 0, cannot add
# ---------------------------------------------------------------------------
_CART_ERRCODE_TO_HTTP = {
    'C0001': (404, "Variant not found"),
    'C0002': (400, "Product is not active"),
    'C0003': (400, "Insufficient stock"),
}

def _raise_from_rpc_error(e: Exception) -> None:
    """
    Map a Supabase/PostgREST exception to a FastAPI HTTPException
    using the structured SQLSTATE code, not substring matching.

    Supabase wraps plpgsql RAISE EXCEPTION errors as a dict accessible
    via e.code (PostgrestAPIError) or embedded in e.args[0] when the
    client re-raises as a plain Exception. We extract the code from
    whichever structure is present.
    """
    code = None

    # Case 1: supabase-py raises PostgrestAPIError with a .code attribute
    if hasattr(e, 'code'):
        code = e.code

    # Case 2: supabase-py wraps the error as a plain Exception whose
    # first arg is a dict with a 'code' key (seen in some library versions)
    if code is None and e.args:
        arg = e.args[0]
        if isinstance(arg, dict):
            code = arg.get('code')

    http_status, detail = _CART_ERRCODE_TO_HTTP.get(
        code, (400, "Database error occurred")
    )
    raise HTTPException(status_code=http_status, detail=detail)


def get_cart(db: Client, user_id: str) -> dict:
    res = db.table('cart_items').select('*, product_variants(*, products(*))').eq('user_id', user_id).execute()
    items = res.data

    formatted_items = []
    subtotal = 0

    for item in items:
        variant = item.get('product_variants')
        if not variant:
            continue

        product = variant.get('products')
        if not product:
            continue

        is_available = (
            variant.get('is_active') is True
            and variant.get('stock', 0) > 0
            and product.get('status') == 'Active'
        )

        # Subtotal counts only items the user can actually buy right now
        if is_available:
            subtotal += variant.get('price', 0) * item.get('quantity', 0)

        formatted_items.append({
            "id": item["id"],
            "user_id": item["user_id"],
            "quantity": item["quantity"],
            "created_at": item["created_at"],
            "updated_at": item["updated_at"],
            "variant": variant,
            "product": product,
            "is_available": is_available
        })

    return {
        "items": formatted_items,
        "subtotal": subtotal
    }


def add_item_to_cart(db: Client, user_id: str, payload: dict) -> dict:
    variant_id = str(payload['variant_id'])
    requested_qty = payload['quantity']

    try:
        rpc_res = db.rpc('upsert_cart_item', {
            'p_user_id': user_id,
            'p_variant_id': variant_id,
            'p_requested_qty': requested_qty,
            'p_is_update': False
        }).execute()
    except Exception as e:
        _raise_from_rpc_error(e)

    cart = get_cart(db, user_id)
    cart['cap_info'] = [rpc_res.data]
    return cart


def update_cart_item(db: Client, user_id: str, variant_id: str, payload: dict) -> dict:
    requested_qty = payload['quantity']

    # Ownership check: 404 if this user has no row for this variant
    existing_res = db.table('cart_items').select('id').eq('user_id', user_id).eq('variant_id', variant_id).execute()
    if not existing_res.data:
        raise HTTPException(status_code=404, detail="Cart item not found")

    try:
        rpc_res = db.rpc('upsert_cart_item', {
            'p_user_id': user_id,
            'p_variant_id': variant_id,
            'p_requested_qty': requested_qty,
            'p_is_update': True
        }).execute()
    except Exception as e:
        _raise_from_rpc_error(e)

    cart = get_cart(db, user_id)
    cart['cap_info'] = [rpc_res.data]
    return cart


def delete_cart_item(db: Client, user_id: str, variant_id: str) -> None:
    res = db.table('cart_items').delete().eq('user_id', user_id).eq('variant_id', variant_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Cart item not found")


def clear_cart(db: Client, user_id: str) -> None:
    db.table('cart_items').delete().eq('user_id', user_id).execute()


def merge_cart(db: Client, user_id: str, items: List[dict]) -> dict:
    cap_infos = []

    for item in items:
        variant_id = str(item['variant_id'])
        qty = item['quantity']

        try:
            rpc_res = db.rpc('upsert_cart_item', {
                'p_user_id': user_id,
                'p_variant_id': variant_id,
                'p_requested_qty': qty,
                'p_is_update': False
            }).execute()
            cap_infos.append(rpc_res.data)
        except Exception:
            # Skip invalid/inactive/out-of-stock variants — a bad item in
            # the merge batch must never block valid items from syncing.
            continue

    cart = get_cart(db, user_id)
    cart['cap_info'] = cap_infos
    return cart

