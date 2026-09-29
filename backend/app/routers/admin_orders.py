import logging
from fastapi import APIRouter, Depends, Request, Query
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from app.schemas.orders import AdminOrdersListResponse, AdminOrderResponse, UpdateOrderStatusRequest
from app.services import orders_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/orders", tags=["Admin Orders"])

def _admin_key_func(request: Request) -> str:
    admin = getattr(request.state, 'admin', None)
    if admin and 'id' in admin:
        return f"admin:{admin['id']}"
    return f"ip:{get_remote_address(request)}"

admin_orders_limiter = Limiter(key_func=_admin_key_func)

def get_and_attach_admin(request: Request, admin: dict = Depends(get_current_admin)) -> dict:
    request.state.admin = admin
    return admin

@router.get("", response_model=AdminOrdersListResponse)
@admin_orders_limiter.limit("60/minute")
def list_admin_orders(
    request: Request,
    search: Optional[str] = Query(None, description="Search by order number, guest email, or guest phone"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """List all orders for admin, paginated and filterable."""
    return orders_service.get_admin_orders(db, search, status, page, page_size)

@router.get("/{order_id}", response_model=AdminOrderResponse)
@admin_orders_limiter.limit("60/minute")
def get_admin_order_detail(
    request: Request,
    order_id: str,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Get single order detail for admin."""
    return orders_service.get_admin_order_detail(db, order_id)

@router.patch("/{order_id}/status")
@admin_orders_limiter.limit("30/minute")
def update_order_status(
    request: Request,
    order_id: str,
    payload: UpdateOrderStatusRequest,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Update order status for admin."""
    return orders_service.update_admin_order_status(db, order_id, payload.status)
