from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import UUID


# ---------------------------------------------------------------------------
# Shared sub-schemas
# ---------------------------------------------------------------------------

class CheckoutContactSchema(BaseModel):
    email: str = Field(..., min_length=3, description="Contact email")
    phone: str = Field(..., min_length=10, description="Contact phone number")


class CheckoutShippingSchema(BaseModel):
    name: str = Field(..., min_length=1)
    address1: str = Field(..., min_length=1)
    address2: Optional[str] = None
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    pincode: str = Field(..., min_length=5)


class CheckoutItemSchema(BaseModel):
    variant_id: UUID
    quantity: int = Field(..., gt=0, le=10)


# ---------------------------------------------------------------------------
# POST /checkout/create-order
# ---------------------------------------------------------------------------

class CreateOrderRequest(BaseModel):
    items: List[CheckoutItemSchema] = Field(..., min_length=1)
    contact: CheckoutContactSchema
    shipping: CheckoutShippingSchema
    coupon_code: Optional[str] = None


class OrderLineItemSummary(BaseModel):
    variant_id: UUID
    product_name: str
    size: str
    sku: str
    quantity: int
    price_paise: int


class CreateOrderResponse(BaseModel):
    razorpay_order_id: str
    amount_paise: int
    currency: str
    key_id: str  # Public key — safe to return to frontend for Checkout.js init
    order_summary: dict  # Subtotal, discount, delivery_fee, total, line items for display


# ---------------------------------------------------------------------------
# POST /checkout/verify-payment
# Client sends ONLY the three Razorpay token fields.
# items/contact/shipping are deliberately absent — order is built from the
# server-side checkout_session, never from anything the client re-submits.
# ---------------------------------------------------------------------------

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str = Field(..., min_length=1)
    razorpay_order_id: str = Field(..., min_length=1)
    razorpay_signature: str = Field(..., min_length=1)


class VerifyPaymentResponse(BaseModel):
    order_id: str
    order_number: str
    status: str
    total_paise: int
    requires_review: bool
    already_committed: bool


# ---------------------------------------------------------------------------
# GET /orders/guest/{order_number}
# ---------------------------------------------------------------------------

class GuestOrderItemResponse(BaseModel):
    sku_snapshot: str
    product_name_snapshot: str
    size_snapshot: str
    quantity: int
    price_at_purchase: int  # paise


class GuestOrderResponse(BaseModel):
    order_number: str
    status: str
    total_paise: int
    subtotal_paise: int
    discount_paise: int = 0
    delivery_fee_paise: int
    shipping_address: dict
    items: List[GuestOrderItemResponse]
    created_at: str
