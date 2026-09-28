from pydantic import BaseModel, ConfigDict, Field, field_validator
import re
from typing import Optional
from datetime import datetime
import uuid

class AddressBase(BaseModel):
    name: str = Field(..., min_length=1)
    address1: str = Field(..., min_length=1)
    address2: Optional[str] = None
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    pincode: str = Field(..., min_length=1)
    is_default: Optional[bool] = False

    @field_validator('pincode')
    @classmethod
    def validate_pincode(cls, v: str) -> str:
        if not re.fullmatch(r'[0-9]{6}', v):
            raise ValueError('Pincode must be exactly 6 digits')
        return v
        
    @field_validator('name', 'address1', 'city', 'state', mode='after')
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Field cannot be empty whitespace')
        return v.strip()

class AddressCreate(AddressBase):
    pass

class AddressUpdate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
