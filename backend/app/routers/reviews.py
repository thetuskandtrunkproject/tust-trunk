from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client
from typing import List, Optional
from app.core.database import get_db_client
from app.dependencies.auth import get_optional_user
from app.schemas.reviews import ReviewCreate, ReviewResponse
from app.services import reviews_service

router = APIRouter(prefix="/api/v1/products", tags=["Reviews"])

def _review_key_func(request: Request) -> str:
    user = getattr(request.state, 'user', None)
    if user and 'id' in user:
        return f"user:{user['id']}"
    return f"ip:{get_remote_address(request)}"

limiter = Limiter(key_func=_review_key_func)

def get_and_attach_optional_user(
    request: Request,
    user: Optional[dict] = Depends(get_optional_user),
) -> Optional[dict]:
    request.state.user = user
    return user

@router.get("/{product_id}/reviews", response_model=List[ReviewResponse])
@limiter.limit("60/minute")
def get_product_reviews(
    request: Request,
    product_id: str,
    db: Client = Depends(get_db_client)
):
    return reviews_service.get_product_reviews(db, product_id)

@router.post("/{product_id}/reviews", response_model=ReviewResponse)
@limiter.limit("5/minute")
def create_product_review(
    request: Request,
    product_id: str,
    payload: ReviewCreate,
    current_user: Optional[dict] = Depends(get_and_attach_optional_user),
    db: Client = Depends(get_db_client)
):
    return reviews_service.create_product_review(db, product_id, payload.model_dump(), current_user)
