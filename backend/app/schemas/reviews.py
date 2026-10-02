from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    reviewer_name: str
    body_text: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    product_id: str
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    is_verified_purchase: bool
    status: str
    created_at: datetime

class ReviewStatusUpdate(BaseModel):
    status: str # 'approved', 'pending', 'rejected'
