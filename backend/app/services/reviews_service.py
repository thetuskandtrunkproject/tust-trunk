from fastapi import HTTPException
from supabase import Client
import logging

logger = logging.getLogger(__name__)

def get_product_reviews(db: Client, product_id: str) -> list:
    res = db.table('product_reviews') \
        .select('*') \
        .eq('product_id', product_id) \
        .eq('status', 'approved') \
        .order('created_at', desc=True) \
        .execute()
    return res.data

def create_product_review(db: Client, product_id: str, payload: dict, user: dict | None) -> dict:
    user_id = user['id'] if user else None
    email = user['email'] if user else payload.get('guest_email')

    if not user_id and not email:
        raise HTTPException(status_code=400, detail="Guest users must provide an email address.")

    is_verified = False
    if email:
        orders_query = db.table('orders').select('id').eq('status', 'Delivered')
        if user_id:
            orders_query = orders_query.eq('user_id', user_id)
        else:
            orders_query = orders_query.eq('guest_email', email)
        
        orders_res = orders_query.execute()
        order_ids = [o['id'] for o in (orders_res.data or [])]
        
        if order_ids:
            variants_res = db.table('product_variants').select('id').eq('product_id', product_id).execute()
            variant_ids = [v['id'] for v in (variants_res.data or [])]
            
            if variant_ids:
                items_res = db.table('order_items').select('id').in_('order_id', order_ids).in_('variant_id', variant_ids).execute()
                if items_res.data:
                    is_verified = True

    data = {
        'product_id': product_id,
        'user_id': user_id,
        'guest_email': payload.get('guest_email') if not user_id else None,
        'reviewer_name': payload['reviewer_name'].strip(),
        'rating': payload['rating'],
        'body_text': payload['body_text'].strip(),
        'is_verified_purchase': is_verified,
        # status defaults to 'pending' via schema constraint (migration 017)
    }
    
    try:
        res = db.table('product_reviews').insert(data).execute()
        return res.data[0]
    except Exception as e:
        code = getattr(e, 'code', None)
        if code is None and e.args and isinstance(e.args[0], dict):
            code = e.args[0].get('code')
            
        if code == '23505': # unique_violation
            raise HTTPException(status_code=409, detail="You have already reviewed this product.")
            
        logger.error(f"Failed to create review: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit review due to an internal error.")

def get_admin_reviews(db: Client, status: str | None = None) -> list:
    q = db.table('product_reviews').select('*, products(name, images)').order('created_at', desc=True)
    if status:
        q = q.eq('status', status)
    res = q.execute()
    return res.data

def update_review_status(db: Client, review_id: str, status: str) -> dict:
    res = db.table('product_reviews').update({'status': status}).eq('id', review_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return res.data[0]

def delete_review(db: Client, review_id: str) -> None:
    res = db.table('product_reviews').delete().eq('id', review_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Review not found")
