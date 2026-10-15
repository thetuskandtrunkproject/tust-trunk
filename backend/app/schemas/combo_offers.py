from pydantic import BaseModel, Field, UUID4, model_validator
from typing import Optional, List, Literal
from datetime import datetime

class ComboOfferBase(BaseModel):
    title: Optional[str] = None
    category_id: UUID4
    min_quantity: int = Field(..., ge=1, description="Minimum product quantity required to activate offer")
    sequence_type: Literal['even', 'odd'] = Field(..., description="Quantity sequence: 'even' or 'odd'")
    discount_type: Literal['flat', 'percent'] = Field(..., description="Discount type: 'flat' (per product in paise) or 'percent'")
    discount_value: int = Field(..., gt=0, description="Discount amount in paise (flat per product) or percentage (1-100)")
    is_active: bool = Field(default=True, description="Whether offer is currently active")

    @model_validator(mode='after')
    def validate_offer(self):
        if self.discount_type == 'percent' and self.discount_value > 100:
            raise ValueError("Percentage discount cannot exceed 100%")
        return self

class ComboOfferCreate(ComboOfferBase):
    pass

class ComboOfferUpdate(BaseModel):
    title: Optional[str] = None
    category_id: Optional[UUID4] = None
    min_quantity: Optional[int] = Field(None, ge=1)
    sequence_type: Optional[Literal['even', 'odd']] = None
    discount_type: Optional[Literal['flat', 'percent']] = None
    discount_value: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None

    @model_validator(mode='after')
    def validate_offer(self):
        if self.discount_type == 'percent' and self.discount_value and self.discount_value > 100:
            raise ValueError("Percentage discount cannot exceed 100%")
        return self

class ComboOfferResponse(BaseModel):
    id: UUID4
    title: Optional[str] = None
    category_id: UUID4
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    min_quantity: int
    sequence_type: str
    discount_type: str
    discount_value: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class ComboOfferApplied(BaseModel):
    offer_id: str
    category_id: str
    category_name: str
    eligible_quantity: int
    sequence_type: str
    discount_type: str
    discount_value: int
    discount_paise: int
    description: str

class ComboOfferPotential(BaseModel):
    category_id: str
    category_name: str
    current_quantity: int
    needed_quantity: int
    target_quantity: int
    message: str

class ComboCalculationItem(BaseModel):
    variant_id: str
    quantity: int = Field(..., gt=0)

class ComboCalculationRequest(BaseModel):
    items: List[ComboCalculationItem]

class ComboCalculationResponse(BaseModel):
    subtotal_paise: int
    combo_discount_paise: int
    final_subtotal_paise: int
    applied_offers: List[ComboOfferApplied]
    potential_offers: List[ComboOfferPotential]
