from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client
from typing import List
from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from app.schemas.combo_offers import (
    ComboOfferCreate,
    ComboOfferUpdate,
    ComboOfferResponse
)
from app.services import combo_offers_service

router = APIRouter(prefix="/api/v1/admin/combo-offers", tags=["Admin Combo Offers"])

def _admin_key_func(request: Request) -> str:
    admin = getattr(request.state, 'admin', None)
    if admin and 'id' in admin:
        return f"admin:{admin['id']}"
    return f"ip:{get_remote_address(request)}"

limiter = Limiter(key_func=_admin_key_func)

def get_and_attach_admin(request: Request, admin: dict = Depends(get_current_admin)) -> dict:
    request.state.admin = admin
    return admin

@router.get("", response_model=List[ComboOfferResponse])
@limiter.limit("60/minute")
def get_combo_offers(
    request: Request,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """List all combo offers (both active and inactive)."""
    return combo_offers_service.list_combo_offers(db)

@router.get("/{offer_id}", response_model=ComboOfferResponse)
@limiter.limit("60/minute")
def get_combo_offer(
    request: Request,
    offer_id: str,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Fetch a single combo offer by ID."""
    return combo_offers_service.get_combo_offer(db, offer_id)

@router.post("", response_model=ComboOfferResponse, status_code=201)
@limiter.limit("30/minute")
def create_combo_offer(
    request: Request,
    payload: ComboOfferCreate,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Create a new combo offer."""
    data = payload.model_dump(mode='json')
    return combo_offers_service.create_combo_offer(db, data)

@router.patch("/{offer_id}", response_model=ComboOfferResponse)
@limiter.limit("30/minute")
def update_combo_offer(
    request: Request,
    offer_id: str,
    payload: ComboOfferUpdate,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Update a combo offer (or toggle its active status)."""
    data = payload.model_dump(exclude_unset=True, mode='json')
    return combo_offers_service.update_combo_offer(db, offer_id, data)

@router.delete("/{offer_id}")
@limiter.limit("30/minute")
def delete_combo_offer(
    request: Request,
    offer_id: str,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    """Delete a combo offer."""
    combo_offers_service.delete_combo_offer(db, offer_id)
    return {"message": "Combo offer deleted successfully"}
