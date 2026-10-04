from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    reviewer_name: str = Field(..., max_length=100)
    guest_email: Optional[EmailStr] = None
    body_text: str = Field(..., min_length=5, max_length=1000)

class ReviewResponse(BaseModel):
    id: str
    reviewer_name: str
    rating: int
    body_text: str
    is_verified_purchase: bool
    created_at: datetime
    # Note: guest_email and status are intentionally omitted from public response

class ReviewStatusUpdate(BaseModel):
    status: Literal['approved', 'pending', 'rejected']
