from fastapi import APIRouter, Depends, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.dependencies.auth import get_current_user
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartMergeRequest, CartResponse
from app.services import cart_service

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])

def get_and_attach_current_user(request: Request, user: dict = Depends(get_current_user)) -> dict:
    request.state.user = user
    return user

def get_user_id_for_rate_limit(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if user and "id" in user:
        return str(user["id"])
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_id_for_rate_limit, default_limits=["60/minute"])

@router.get("", response_model=CartResponse)
@limiter.limit("60/minute")
def get_cart(
    request: Request,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    return cart_service.get_cart(db, current_user['id'])

@router.post("/items", response_model=CartResponse)
@limiter.limit("30/minute")
def add_item_to_cart(
    request: Request,
    item: CartItemCreate,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    return cart_service.add_item_to_cart(db, current_user['id'], item.model_dump())

@router.patch("/items/{variant_id}", response_model=CartResponse)
@limiter.limit("30/minute")
def update_cart_item(
    request: Request,
    variant_id: str,
    item: CartItemUpdate,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    return cart_service.update_cart_item(db, current_user['id'], variant_id, item.model_dump())

@router.delete("/items/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_cart_item(
    request: Request,
    variant_id: str,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    cart_service.delete_cart_item(db, current_user['id'], variant_id)
    return None

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def clear_cart(
    request: Request,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    cart_service.clear_cart(db, current_user['id'])
    return None

@router.post("/merge", response_model=CartResponse)
@limiter.limit("5/minute")
def merge_cart(
    request: Request,
    payload: CartMergeRequest,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    return cart_service.merge_cart(db, current_user['id'], [item.model_dump() for item in payload.items])
