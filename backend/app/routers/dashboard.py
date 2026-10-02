import logging
from fastapi import APIRouter, Depends, Request, Query
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from app.schemas.dashboard import DashboardResponse, UpdateStockRequest
from app.services import dashboard_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Dashboard & Inventory"])

def _admin_key_func(request: Request) -> str:
    admin = getattr(request.state, 'admin', None)
    if admin and 'id' in admin:
        return f"admin:{admin['id']}"
    return f"ip:{get_remote_address(request)}"

admin_dashboard_limiter = Limiter(key_func=_admin_key_func)

def get_and_attach_admin(request: Request, admin: dict = Depends(get_current_admin)) -> dict:
    request.state.admin = admin
    return admin

@router.get("/dashboard", response_model=DashboardResponse)
@admin_dashboard_limiter.limit("60/minute")
def get_dashboard(
    request: Request,
    time_range: str = Query('30d', description="Time range (e.g. 7d, 30d, 1y)"),
    start_date: Optional[str] = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Custom end date (YYYY-MM-DD)"),
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Get all dashboard metrics, charts, and feeds in a single call."""
    return dashboard_service.get_dashboard_metrics(db, time_range, start_date, end_date)


@router.patch("/variants/{variant_id}/stock")
@admin_dashboard_limiter.limit("120/minute")
def update_variant_stock(
    request: Request,
    variant_id: str,
    payload: UpdateStockRequest,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """
    Update stock for a specific variant. 
    Rate limit is intentionally high (120/min) because the frontend fires an API call immediately on input blur during bulk inline editing.
    """
    return dashboard_service.update_variant_stock(db, variant_id, payload.stock)
