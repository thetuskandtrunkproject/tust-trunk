from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client
from typing import List
from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from app.schemas.coupons import CouponCreate, CouponUpdate, CouponResponse
from app.services import coupons_service

router = APIRouter(prefix="/api/v1/admin/coupons", tags=["Admin Coupons"])

def _admin_key_func(request: Request) -> str:
    admin = getattr(request.state, 'admin', None)
    if admin and 'id' in admin:
        return f"admin:{admin['id']}"
    return f"ip:{get_remote_address(request)}"

limiter = Limiter(key_func=_admin_key_func)

def get_and_attach_admin(request: Request, admin: dict = Depends(get_current_admin)) -> dict:
    request.state.admin = admin
    return admin

@router.get("", response_model=List[CouponResponse])
@limiter.limit("60/minute")
def get_coupons(
    request: Request,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    return coupons_service.get_coupons(db)

@router.post("", response_model=CouponResponse)
@limiter.limit("30/minute")
def create_coupon(
    request: Request,
    payload: CouponCreate,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    data = payload.model_dump(mode='json')
    data['code'] = data['code'].upper()
    if data.get('discount_type') == 'percent' and data.get('discount_value', 0) > 100:
        raise HTTPException(status_code=400, detail="Percentage discount cannot exceed 100%")
    return coupons_service.create_coupon(db, data)

@router.patch("/{coupon_id}", response_model=CouponResponse)
@limiter.limit("30/minute")
def update_coupon(
    request: Request,
    coupon_id: str,
    payload: CouponUpdate,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    data = payload.model_dump(exclude_unset=True, mode='json')
    if 'code' in data:
        data['code'] = data['code'].upper()
    if data.get('discount_type') == 'percent' and data.get('discount_value', 0) > 100:
        raise HTTPException(status_code=400, detail="Percentage discount cannot exceed 100%")
    return coupons_service.update_coupon(db, coupon_id, data)

@router.delete("/{coupon_id}")
@limiter.limit("30/minute")
def delete_coupon(
    request: Request,
    coupon_id: str,
    current_admin: dict = Depends(get_and_attach_admin),
    db: Client = Depends(get_db_client)
):
    coupons_service.delete_coupon(db, coupon_id)
    return {"message": "Coupon deleted"}
