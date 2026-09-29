from pydantic import BaseModel, Field
from typing import List, Optional, Any, Literal
from uuid import UUID

# ---------------------------------------------------------------------------
# GET /orders
# ---------------------------------------------------------------------------

class OrderItemResponse(BaseModel):
    product_name_snapshot: str
    size_snapshot: str
    quantity: int
    price_at_purchase: int
    image_url: Optional[str] = None

class OrderResponse(BaseModel):
    id: UUID
    order_number: str
    created_at: str
    status: str
    total_paise: int
    subtotal_paise: int
    delivery_fee_paise: int
    item_count: int
    shipping_address: Any
    items: List[OrderItemResponse]

class OrdersListResponse(BaseModel):
    orders: List[OrderResponse]

# ---------------------------------------------------------------------------
# Admin Orders
# ---------------------------------------------------------------------------

class AdminOrderItemResponse(OrderItemResponse):
    variant_id: Optional[UUID] = None

class AdminOrderResponse(BaseModel):
    id: UUID
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    date: str
    status: str
    payment_status: str
    payment_method: str
    shipping_address: Any
    items: List[AdminOrderItemResponse]
    subtotal_paise: int
    delivery_fee_paise: int
    total_paise: int

class AdminOrdersListResponse(BaseModel):
    orders: List[AdminOrderResponse]
    total_count: int
    page: int
    page_size: int

class UpdateOrderStatusRequest(BaseModel):
    status: Literal['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'requires_review'] = Field(
        ..., description="New status for the order"
    )

