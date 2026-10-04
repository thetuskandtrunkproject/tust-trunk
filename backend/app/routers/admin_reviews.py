from fastapi import APIRouter, Depends, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client
from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from app.schemas.reviews import ReviewStatusUpdate
from app.services import reviews_service

router = APIRouter(prefix="/api/v1/admin/reviews", tags=["Admin Reviews"])

def _admin_key_func(request: Request) -> str:
    admin = getattr(request.state, 'admin', None)
    if admin and 'id' in admin:
        return f"admin:{admin['id']}"
    return f"ip:{get_remote_address(request)}"

limiter = Limiter(key_func=_admin_key_func)

def get_and_attach_admin(request: Request, admin: dict = Depends(get_current_admin)) -> dict:
    request.state.admin = admin
    return admin

@router.get("")
@limiter.limit("60/minute")
def get_all_reviews(
    request: Request,
    status: str = Query(None),
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    return reviews_service.get_admin_reviews(db, status)

@router.patch("/{review_id}/status")
@limiter.limit("30/minute")
def update_review_status(
    request: Request,
    review_id: str,
    payload: ReviewStatusUpdate,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    return reviews_service.update_review_status(db, review_id, payload.status)

@router.delete("/{review_id}")
@limiter.limit("30/minute")
def delete_review(
    request: Request,
    review_id: str,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    reviews_service.delete_review(db, review_id)
    return {"message": "Review deleted"}
