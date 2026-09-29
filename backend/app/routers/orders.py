import logging
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.dependencies.auth import get_current_user
from app.schemas.orders import OrdersListResponse, OrderResponse
from app.services import orders_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

def _user_key_func(request: Request) -> str:
    user = getattr(request.state, 'user', None)
    if user and 'id' in user:
        return f"user:{user['id']}"
    return f"ip:{get_remote_address(request)}"

user_orders_limiter = Limiter(key_func=_user_key_func)

def get_and_attach_user(request: Request, user: dict = Depends(get_current_user)) -> dict:
    request.state.user = user
    return user

@router.get("", response_model=OrdersListResponse)
@user_orders_limiter.limit("30/minute")
def list_user_orders(
    request: Request,
    current_user: dict = Depends(get_and_attach_user),
    db: Client = Depends(get_db_client)
):
    """List current user's order history, paginated, most recent first."""
    return orders_service.get_user_orders(db, current_user['id'])

@router.get("/{order_id}", response_model=OrderResponse)
@user_orders_limiter.limit("30/minute")
def get_user_order_detail(
    request: Request,
    order_id: str,
    current_user: dict = Depends(get_and_attach_user),
    db: Client = Depends(get_db_client)
):
    """Get single order detail for the current user."""
    return orders_service.get_user_order_detail(db, current_user['id'], order_id)
