from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from typing import Optional, Literal, List
from datetime import datetime
import uuid


# ---------------------------------------------------------------------------
# Variant schemas
# ---------------------------------------------------------------------------

class VariantCreate(BaseModel):
    sku: str
    size: str
    price: int  # in paise
    stock: int = 0

    @field_validator('sku')
    @classmethod
    def sku_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('SKU must not be empty')
        return v

    @field_validator('size')
    @classmethod
    def size_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Size must not be empty')
        return v

    @field_validator('price')
    @classmethod
    def price_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError('Price must be greater than 0 paise')
        return v

    @field_validator('stock')
    @classmethod
    def stock_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError('Stock cannot be negative')
        return v


class VariantUpdate(BaseModel):
    """Partial update for a variant — only supplied fields are changed."""
    sku: Optional[str] = None
    size: Optional[str] = None
    price: Optional[int] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator('sku')
    @classmethod
    def sku_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('SKU must not be empty')
        return v

    @field_validator('size')
    @classmethod
    def size_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Size must not be empty')
        return v

    @field_validator('price')
    @classmethod
    def price_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError('Price must be greater than 0 paise')
        return v

    @field_validator('stock')
    @classmethod
    def stock_non_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError('Stock cannot be negative')
        return v


class VariantResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    sku: str
    size: str
    price: int
    stock: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Product schemas
# ---------------------------------------------------------------------------

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str = ''
    gender: Literal['Women', 'Kids']
    category_id: uuid.UUID
    images: List[str] = []
    tags: List[str] = []
    status: Literal['Active', 'Draft', 'Archived'] = 'Draft'
    variants: List[VariantCreate]  # At least one variant required

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Product name must not be empty')
        return v

    @field_validator('slug')
    @classmethod
    def slug_valid(cls, v: str) -> str:
        import re
        v = v.strip().lower()
        if not v:
            raise ValueError('Slug must not be empty')
        if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', v):
            raise ValueError('Slug must be lowercase alphanumeric with hyphens only (e.g. "my-product")')
        return v


    @model_validator(mode='after')
    def at_least_one_variant(self) -> 'ProductCreate':
        if not self.variants:
            raise ValueError('At least one variant is required when creating a product')
        return self


class ProductUpdate(BaseModel):
    """Partial update for product-level fields only — variants are updated separately."""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    gender: Optional[Literal['Women', 'Kids']] = None
    category_id: Optional[uuid.UUID] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[Literal['Active', 'Draft', 'Archived']] = None

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Product name must not be empty')
        return v

    @field_validator('slug')
    @classmethod
    def slug_valid(cls, v: Optional[str]) -> Optional[str]:
        import re
        if v is not None:
            v = v.strip().lower()
            if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', v):
                raise ValueError('Slug must be lowercase alphanumeric with hyphens only')
        return v



class ProductListItem(BaseModel):
    """Lightweight product shape for admin list view — optionally includes full variant array."""
    id: uuid.UUID
    name: str
    slug: str
    gender: str
    category_id: uuid.UUID
    category: str
    status: str
    images: List[str]
    tags: List[str]
    variant_count: int
    total_stock: int
    created_at: datetime
    updated_at: datetime
    variants: Optional[List[VariantResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(BaseModel):
    """Full product with all variants — used for single-product GET."""
    id: uuid.UUID
    name: str
    slug: str
    description: str
    gender: str
    category_id: uuid.UUID
    category: str
    images: List[str]
    tags: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
    variants: List[VariantResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    """Paginated admin product list."""
    items: List[ProductListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------------------------
# Image management schemas
# ---------------------------------------------------------------------------

class ImageDeleteRequest(BaseModel):
    """Body for DELETE /admin/products/{product_id}/images"""
    image_url: str  # The exact public URL to remove from the images array

    @field_validator('image_url')
    @classmethod
    def url_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('image_url must not be empty')
        return v
