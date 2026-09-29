from fastapi import APIRouter, Depends, Request
from typing import List, Dict, Any
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from app.schemas.admin_customers import CustomerListItem, CustomerDetail
from app.services import admin_customers_service

router = APIRouter(prefix="/api/v1/admin/customers", tags=["Admin Customers"])

def _admin_key_func(request: Request) -> str:
    admin = getattr(request.state, 'admin', None)
    if admin and 'id' in admin:
        return f"admin:{admin['id']}"
    return f"ip:{get_remote_address(request)}"

admin_customers_limiter = Limiter(key_func=_admin_key_func)

def get_and_attach_admin(request: Request, admin: dict = Depends(get_current_admin)) -> dict:
    request.state.admin = admin
    return admin

@router.get("", response_model=Dict[str, List[CustomerListItem]])
@admin_customers_limiter.limit("60/minute")
def list_admin_customers(
    request: Request,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """List all customers and their aggregate lifetime value metrics."""
    return admin_customers_service.list_customers(db)

@router.get("/{customer_id}", response_model=CustomerDetail)
@admin_customers_limiter.limit("60/minute")
def get_admin_customer_detail(
    request: Request,
    customer_id: str,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Get single customer details, including saved addresses."""
    return admin_customers_service.get_customer_detail(db, customer_id)
