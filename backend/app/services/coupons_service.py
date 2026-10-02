from fastapi import HTTPException
from supabase import Client
from datetime import datetime, timezone

def validate_coupon_for_cart(db: Client, code: str, subtotal_paise: int, user_id: str | None = None) -> tuple[int, dict]:
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
        
    # 6. Calculate discount
    discount_paise = 0
    dtype = coupon['discount_type']
    val = coupon['discount_value']
    
    if dtype == 'percent':
        discount_paise = int(subtotal_paise * (val / 100.0))
        cap = coupon.get('max_discount_cap_paise')
        if cap and discount_paise > cap:
            discount_paise = cap
    elif dtype == 'flat':
        discount_paise = val
    elif dtype == 'free_shipping':
        # Handled in checkout_service's compute_delivery_fee by passing free_shipping=True
        pass
        
    # Ensure discount doesn't exceed subtotal
    discount_paise = min(discount_paise, subtotal_paise)
    
    return discount_paise, coupon

def get_coupons(db: Client) -> list:
    res = db.table('coupons').select('*').order('created_at', desc=True).execute()
    return res.data

def create_coupon(db: Client, data: dict) -> dict:
    try:
        res = db.table('coupons').insert(data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not create coupon. Code might already exist.")

def update_coupon(db: Client, coupon_id: str, data: dict) -> dict:
    res = db.table('coupons').update(data).eq('id', coupon_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Coupon not found.")
    return res.data[0]

def delete_coupon(db: Client, coupon_id: str) -> None:
    res = db.table('coupons').delete().eq('id', coupon_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Coupon not found.")
