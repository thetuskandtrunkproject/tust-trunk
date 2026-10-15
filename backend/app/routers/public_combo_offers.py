from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client
from typing import List

from app.core.database import get_db_client
from app.schemas.combo_offers import (
    ComboOfferResponse,
    ComboCalculationRequest,
    ComboCalculationResponse,
    ComboOfferApplied,
    ComboOfferPotential
)
from app.services import combo_offers_service

router = APIRouter(prefix="/public/combo-offers", tags=["Public Combo Offers"])
limiter = Limiter(key_func=get_remote_address)

@router.get("", response_model=List[ComboOfferResponse])
@limiter.limit("120/minute")
def get_active_combo_offers(
    request: Request,
    db: Client = Depends(get_db_client)
):
    """Fetch active combo offers for storefront customers."""
    return combo_offers_service.get_active_combo_offers(db)

@router.post("/calculate", response_model=ComboCalculationResponse)
@limiter.limit("60/minute")
def calculate_cart_combo_offers(
    request: Request,
    payload: ComboCalculationRequest,
    db: Client = Depends(get_db_client)
):
    """
    Calculate automatic combo offers for given cart items (guest or preview).
    Fetches actual variant prices, stock, and category relationships server-side.
    """
    from app.services.checkout_service import _validate_cart_items
    
    items_list = [item.model_dump() for item in payload.items]
    if not items_list:
        return {
            "subtotal_paise": 0,
            "combo_discount_paise": 0,
            "final_subtotal_paise": 0,
            "applied_offers": [],
            "potential_offers": []
        }

    subtotal_paise, validated_items = _validate_cart_items(db, items_list)
    discount_paise, applied_offers, potential_offers = combo_offers_service.calculate_combo_discount_for_cart(
        db, validated_items
    )

    final_subtotal = max(0, subtotal_paise - discount_paise)
    return {
        "subtotal_paise": subtotal_paise,
        "combo_discount_paise": discount_paise,
        "final_subtotal_paise": final_subtotal,
        "applied_offers": applied_offers,
        "potential_offers": potential_offers
    }
