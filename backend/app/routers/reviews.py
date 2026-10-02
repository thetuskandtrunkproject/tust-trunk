from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db_client
from app.dependencies.auth import get_optional_user

router = APIRouter(prefix="/api/v1/products", tags=["Reviews"])

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    reviewer_name: str
    guest_email: Optional[str] = None
    body_text: str

class ReviewResponse(BaseModel):
    id: str
    reviewer_name: str
    rating: int
    body_text: str
    is_verified_purchase: bool
    created_at: datetime

@router.get("/{product_id}/reviews", response_model=List[ReviewResponse])
def get_product_reviews(product_id: str, db: Client = Depends(get_db_client)):
    res = db.table('product_reviews') \
        .select('*') \
        .eq('product_id', product_id) \
        .eq('status', 'approved') \
        .order('created_at', desc=True) \
        .execute()
    return res.data

@router.post("/{product_id}/reviews", response_model=ReviewResponse)
def create_product_review(
    product_id: str,
    payload: ReviewCreate,
    current_user: Optional[dict] = Depends(get_optional_user),
    db: Client = Depends(get_db_client)
):
    user_id = current_user['id'] if current_user else None
    email = current_user['email'] if current_user else payload.guest_email

    if not user_id and not payload.guest_email:
        raise HTTPException(status_code=400, detail="Guest users must provide an email address.")

    # Check if they have a verified purchase
    # We check if there's any Delivered order containing this product for this user_id or guest_email
    is_verified = False
    if email:
        # Actually we need to check order_items via orders
        # Find orders for this email/user_id with status Delivered
        # and then check if product_id is in order_items.
        # But order_items only has variant_id. We need to join with product_variants to get product_id.
        # Since Supabase Python client doesn't support complex joins easily, we can do:
        orders_query = db.table('orders').select('id').eq('status', 'Delivered')
        if user_id:
            orders_query = orders_query.eq('user_id', user_id)
        else:
            orders_query = orders_query.eq('guest_email', email)
        
        orders_res = orders_query.execute()
        order_ids = [o['id'] for o in (orders_res.data or [])]
        
        if order_ids:
            # check order_items
            variants_res = db.table('product_variants').select('id').eq('product_id', product_id).execute()
            variant_ids = [v['id'] for v in (variants_res.data or [])]
            
            if variant_ids:
                items_res = db.table('order_items').select('id').in_('order_id', order_ids).in_('variant_id', variant_ids).execute()
                if items_res.data:
                    is_verified = True

    data = {
        'product_id': product_id,
        'user_id': user_id,
        'guest_email': payload.guest_email if not user_id else None,
        'reviewer_name': payload.reviewer_name,
        'rating': payload.rating,
        'body_text': payload.body_text,
        'is_verified_purchase': is_verified,
        'status': 'pending'  # Needs admin approval
    }
    
    try:
        res = db.table('product_reviews').insert(data).execute()
        return res.data[0]
    except Exception as e:
        # E.g. unique constraint violation (already reviewed)
        raise HTTPException(status_code=400, detail="You have already reviewed this product or an error occurred.")
