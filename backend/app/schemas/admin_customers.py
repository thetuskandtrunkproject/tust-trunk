from pydantic import BaseModel
from typing import List, Optional
import uuid

class AddressItem(BaseModel):
    id: uuid.UUID
    name: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    pincode: str
    phone: str
    is_default: bool

class CustomerListItem(BaseModel):
    id: str  # database UUID (users.id)
    name: str
    email: str
    phone: Optional[str] = None
    joined_date: str
    total_spent_paise: int
    total_orders: int
    last_order_date: Optional[str] = None

class CustomerDetail(CustomerListItem):
    addresses: List[AddressItem]
