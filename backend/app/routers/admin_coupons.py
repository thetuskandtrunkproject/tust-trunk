from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List
from app.core.database import get_db_client
from app.dependencies.auth import get_current_admin
from app.schemas.coupons import CouponCreate, CouponUpdate, CouponResponse
from app.services import coupons_service

router = APIRouter(prefix="/api/v1/admin/coupons", tags=["Admin Coupons"])

@router.get("", response_model=List[CouponResponse])
def get_coupons(
    admin_user: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    return coupons_service.get_coupons(db)

@router.post("", response_model=CouponResponse)
def create_coupon(
    payload: CouponCreate,
    admin_user: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    data = payload.model_dump(mode='json')
    data['code'] = data['code'].upper()
    return coupons_service.create_coupon(db, data)

@router.patch("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: str,
    payload: CouponUpdate,
    admin_user: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    data = payload.model_dump(exclude_unset=True, mode='json')
    if 'code' in data:
        data['code'] = data['code'].upper()
    return coupons_service.update_coupon(db, coupon_id, data)

@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: str,
    admin_user: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    coupons_service.delete_coupon(db, coupon_id)
    return {"message": "Coupon deleted"}
