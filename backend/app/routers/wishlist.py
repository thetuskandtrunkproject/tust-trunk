from fastapi import APIRouter, Depends, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.dependencies.auth import get_current_user
from app.schemas.wishlist import WishlistMergeRequest, WishlistResponse
from app.services import wishlist_service

router = APIRouter(prefix="/api/v1/wishlist", tags=["Wishlist"])

def get_and_attach_current_user(request: Request, user: dict = Depends(get_current_user)) -> dict:
    request.state.user = user
    return user

def get_user_id_for_rate_limit(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if user and "id" in user:
        return str(user["id"])
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_id_for_rate_limit, default_limits=["60/minute"])

@router.get("", response_model=WishlistResponse)
@limiter.limit("60/minute")
def get_wishlist(
    request: Request,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    return wishlist_service.get_wishlist(db, current_user['id'])

@router.post("/{product_id}", response_model=WishlistResponse)
@limiter.limit("30/minute")
def add_to_wishlist(
    request: Request,
    product_id: str,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    return wishlist_service.add_to_wishlist(db, current_user['id'], product_id)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def remove_from_wishlist(
    request: Request,
    product_id: str,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    wishlist_service.remove_from_wishlist(db, current_user['id'], product_id)
    return None

@router.post("/merge", response_model=WishlistResponse)
@limiter.limit("5/minute")
def merge_wishlist(
    request: Request,
    payload: WishlistMergeRequest,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    return wishlist_service.merge_wishlist(db, current_user['id'], [str(pid) for pid in payload.product_ids])
