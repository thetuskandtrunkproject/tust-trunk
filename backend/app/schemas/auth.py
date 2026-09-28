from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, Literal
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: uuid.UUID
    firebase_uid: str
    role: Literal['customer', 'admin']
    email_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None 
    
    @field_validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        # Strip spaces and plus signs to check digits
        digits = ''.join(filter(str.isdigit, v))
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError('Phone number must contain between 7 and 15 digits')
        return v

