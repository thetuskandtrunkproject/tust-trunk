from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CouponBase(BaseModel):
    code: str
    discount_type: str
    discount_value: int
    min_cart_value_paise: Optional[int] = None
    max_discount_cap_paise: Optional[int] = None
    total_usage_limit: Optional[int] = None
    per_user_limit: Optional[int] = None
    scope: str = "store_wide"
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[int] = None
    min_cart_value_paise: Optional[int] = None
    max_discount_cap_paise: Optional[int] = None
    total_usage_limit: Optional[int] = None
    per_user_limit: Optional[int] = None
    scope: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None

class CouponResponse(CouponBase):
    id: str
    usage_count: int
    created_at: datetime
