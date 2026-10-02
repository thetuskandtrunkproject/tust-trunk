from pydantic import BaseModel, UUID4
from typing import List
from datetime import datetime
from app.schemas.cart import CartProductInfo

class WishlistItemCreate(BaseModel):
    product_id: UUID4

class WishlistMergeRequest(BaseModel):
    product_ids: List[UUID4]

class WishlistItemResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    product_id: UUID4
    created_at: datetime
    
    # Joined data
    product: CartProductInfo
    
    # Check if the product is active
    is_available: bool

class WishlistResponse(BaseModel):
    items: List[WishlistItemResponse]
