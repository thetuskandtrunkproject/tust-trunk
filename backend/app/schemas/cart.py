from pydantic import BaseModel, Field, UUID4
from typing import List, Optional
from datetime import datetime

class CartItemCreate(BaseModel):
    variant_id: UUID4
    quantity: int = Field(..., gt=0, le=10, description="Quantity must be between 1 and 10")

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0, le=10, description="Quantity must be between 1 and 10")

class CartMergeRequest(BaseModel):
    items: List[CartItemCreate]

class CartProductInfo(BaseModel):
    id: UUID4
    name: str
    slug: str
    images: List[str]
    category_id: Optional[UUID4] = None
    category_name: Optional[str] = None

class CartVariantInfo(BaseModel):
    id: UUID4
    sku: str
    size: str
    price: int
    stock: int
    is_active: bool

class CartItemResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    quantity: int
    created_at: datetime
    updated_at: datetime
    
    # Joined data
    variant: CartVariantInfo
    product: CartProductInfo
    
    # UX flag (True if variant is_active and parent product is Active and stock > 0)
    is_available: bool

class CartCapInfo(BaseModel):
    variant_id: UUID4
    requested_quantity: int
    actual_quantity: int
    capped_reason: Optional[str] = None

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: int  # Computed server-side for available items only
    combo_discount: int = 0
    final_subtotal: int = 0
    applied_offers: Optional[List[dict]] = None
    potential_offers: Optional[List[dict]] = None
    cap_info: Optional[List[CartCapInfo]] = None
