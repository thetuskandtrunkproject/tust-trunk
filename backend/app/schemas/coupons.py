from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class CouponBase(BaseModel):
    code: str = Field(..., max_length=50, pattern=r'^[A-Z0-9_-]+$')
    discount_type: Literal['percent', 'flat', 'free_shipping']
    discount_value: int = Field(..., ge=0)
    min_cart_value_paise: Optional[int] = Field(None, ge=0)
    max_discount_cap_paise: Optional[int] = Field(None, ge=0)
    total_usage_limit: Optional[int] = Field(None, gt=0)
    per_user_limit: Optional[int] = Field(None, gt=0)
    scope: str = "store_wide"
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=50, pattern=r'^[A-Z0-9_-]+$')
    discount_type: Optional[Literal['percent', 'flat', 'free_shipping']] = None
    discount_value: Optional[int] = Field(None, ge=0)
    min_cart_value_paise: Optional[int] = Field(None, ge=0)
    max_discount_cap_paise: Optional[int] = Field(None, ge=0)
    total_usage_limit: Optional[int] = Field(None, gt=0)
    per_user_limit: Optional[int] = Field(None, gt=0)
    scope: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None

class CouponResponse(CouponBase):
    id: str
    usage_count: int
    created_at: datetime
