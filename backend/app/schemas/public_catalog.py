from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
import uuid

# ---------------------------------------------------------------------------
# Public Catalog Schemas
# ---------------------------------------------------------------------------

class PublicCategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)


class PublicProductListItem(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    gender: str
    category: str
    images: List[str]
    tags: List[str]
    min_price: int  # in rupees
    max_price: int  # in rupees
    available_sizes: List[str]
    total_stock: int

    model_config = ConfigDict(from_attributes=True)


class PublicProductListResponse(BaseModel):
    items: List[PublicProductListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class PublicVariantResponse(BaseModel):
    id: uuid.UUID
    sku: str
    size: str
    price: int  # in rupees
    stock: int
    
    model_config = ConfigDict(from_attributes=True)


class PublicProductDetailResponse(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str
    gender: str
    category: str
    category_id: uuid.UUID
    images: List[str]
    tags: List[str]
    variants: List[PublicVariantResponse]

    model_config = ConfigDict(from_attributes=True)
