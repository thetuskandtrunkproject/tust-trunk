from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from typing import List
from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/admin/reviews", tags=["Admin Reviews"])

class ReviewStatusUpdate(BaseModel):
    status: str

@router.get("")
def get_all_reviews(
    status: str = Query(None),
    admin_user: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    q = db.table('product_reviews').select('*, products(name, images)').order('created_at', desc=True)
    if status:
        q = q.eq('status', status)
    res = q.execute()
    return res.data

@router.patch("/{review_id}/status")
def update_review_status(
    review_id: str,
    payload: ReviewStatusUpdate,
    admin_user: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    if payload.status not in ['approved', 'rejected', 'pending']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    res = db.table('product_reviews').update({'status': payload.status}).eq('id', review_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return res.data[0]

@router.delete("/{review_id}")
def delete_review(
    review_id: str,
    admin_user: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    res = db.table('product_reviews').delete().eq('id', review_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}
