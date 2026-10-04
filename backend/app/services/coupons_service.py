from fastapi import HTTPException
from supabase import Client
from datetime import datetime, timezone

def validate_coupon_for_cart(db: Client, code: str, subtotal_paise: int, user_id: str | None = None, validated_items: list | None = None) -> tuple[int, dict]:
    """
    Validates a coupon code against cart requirements and returns (discount_paise, coupon_row).
    """
    # 1. Fetch coupon
    res = db.table('coupons').select('*').eq('code', code).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Invalid coupon code.")
        
    coupon = res.data[0]
    
    # 2. Check active and dates
    if not coupon.get('is_active'):
        raise HTTPException(status_code=400, detail="This coupon is no longer active.")
        
    now = datetime.now(timezone.utc)
    # Parse dates (supabase returns ISO 8601 strings)
    try:
        valid_from = datetime.fromisoformat(coupon['valid_from'].replace('Z', '+00:00'))
        valid_until = datetime.fromisoformat(coupon['valid_until'].replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid coupon date format in DB.")
        
    if now < valid_from:
        raise HTTPException(status_code=400, detail="This coupon is not active yet.")
    if now > valid_until:
        raise HTTPException(status_code=400, detail="This coupon has expired.")
        
    # 3. Check min cart value
    min_val = coupon.get('min_cart_value_paise')
    if min_val and subtotal_paise < min_val:
        raise HTTPException(status_code=400, detail=f"Minimum cart value of ₹{min_val//100} required.")
        
    # 4. Check total usage limit
    if coupon.get('total_usage_limit') is not None and coupon['usage_count'] >= coupon['total_usage_limit']:
        raise HTTPException(status_code=400, detail="This coupon has reached its usage limit.")
        
    # 5. Check per-user limit
    per_user = coupon.get('per_user_limit')
    if per_user and user_id:
        usage_res = db.table('coupon_redemptions').select('id', count='exact').eq('coupon_id', coupon['id']).eq('user_id', user_id).execute()
        count = usage_res.count or 0
        if count >= per_user:
            raise HTTPException(status_code=400, detail="You have reached the usage limit for this coupon.")
    elif per_user and not user_id:
        # Require login for per-user limit coupons
        raise HTTPException(status_code=400, detail="You must be logged in to use this coupon.")
        
    # 6. Check scope and calculate applicable subtotal
    scope = coupon.get('scope', 'store_wide')
    applicable_subtotal = 0
    has_applicable_items = False

    if scope == 'store_wide':
        applicable_subtotal = subtotal_paise
        has_applicable_items = True
    elif validated_items:
        for item in validated_items:
            # Check if the product gender matches the scope (e.g., 'Kids', 'Women')
            if item.get('product_gender') == scope:
                applicable_subtotal += item.get('price_paise', 0) * item.get('quantity', 1)
                has_applicable_items = True

    if scope != 'store_wide' and not has_applicable_items:
        raise HTTPException(status_code=400, detail="Not applicable for the items in your cart.")

    # 7. Calculate discount
    discount_paise = 0
    dtype = coupon['discount_type']
    val = coupon['discount_value']
    
    if dtype == 'percent':
        discount_paise = int(applicable_subtotal * (val / 100.0))
        cap = coupon.get('max_discount_cap_paise')
        if cap and discount_paise > cap:
            discount_paise = cap
    elif dtype == 'flat':
        # Flat discounts could theoretically apply proportionally, but for now we just 
        # ensure there is at least one applicable item.
        discount_paise = val
    elif dtype == 'free_shipping':
        # Handled in checkout_service's compute_delivery_fee by passing free_shipping=True
        pass
        
    # Ensure discount doesn't exceed applicable subtotal
    discount_paise = min(discount_paise, applicable_subtotal)
    
    return discount_paise, coupon

def get_coupons(db: Client) -> list:
    res = db.table('coupons').select('*').order('created_at', desc=True).execute()
    return res.data

def create_coupon(db: Client, data: dict) -> dict:
    try:
        res = db.table('coupons').insert(data).execute()
        return res.data[0]
    except Exception as e:
        code = getattr(e, 'code', None)
        if code == '23505': # unique_violation
            raise HTTPException(status_code=409, detail=f"Coupon code '{data.get('code')}' already exists.")
        
        # If it's a dict containing code, handle Supabase errors
        if code is None and e.args and isinstance(e.args[0], dict):
            code = e.args[0].get('code')
            if code == '23505':
                raise HTTPException(status_code=409, detail=f"Coupon code '{data.get('code')}' already exists.")

        import logging
        logging.getLogger(__name__).error(f"Failed to create coupon: {e}")
        raise HTTPException(status_code=500, detail="Failed to create coupon due to an internal error.")

def update_coupon(db: Client, coupon_id: str, data: dict) -> dict:
    res = db.table('coupons').update(data).eq('id', coupon_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Coupon not found.")
    return res.data[0]

def delete_coupon(db: Client, coupon_id: str) -> None:
    res = db.table('coupons').delete().eq('id', coupon_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Coupon not found.")
