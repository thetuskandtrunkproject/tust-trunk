from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Literal
from datetime import datetime
import uuid
import re

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str = ''
    gender: Literal['Kids', 'Women', 'Unisex'] = 'Unisex'
    is_active: bool = True

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Category name must not be empty')
        return v

    @field_validator('slug')
    @classmethod
    def slug_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError('Slug must not be empty')
        if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', v):
            raise ValueError('Slug must be lowercase alphanumeric with hyphens only')
        return v


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    gender: Optional[Literal['Kids', 'Women', 'Unisex']] = None
    is_active: Optional[bool] = None

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Category name must not be empty')
        return v

    @field_validator('slug')
    @classmethod
    def slug_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', v):
                raise ValueError('Slug must be lowercase alphanumeric with hyphens only')
        return v


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str
    gender: str = 'Unisex'
    is_active: bool
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
