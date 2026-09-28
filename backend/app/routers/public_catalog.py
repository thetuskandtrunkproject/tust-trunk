from fastapi import APIRouter, Depends, Query, Request
from typing import Optional, List
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.schemas.public_catalog import (
    PublicProductListResponse,
    PublicProductDetailResponse,
    PublicCategoryResponse
)
from app.services import public_catalog_service

router = APIRouter(prefix="/public", tags=["Public Catalog"])

# 120 req/minute per IP for product listings
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])


@router.get('/categories', response_model=List[PublicCategoryResponse])
@limiter.limit('120/minute')
def list_categories(request: Request, db: Client = Depends(get_db_client)):
    """Fetch active categories for public storefront."""
    return public_catalog_service.list_public_categories(db)


@router.get('/products', response_model=PublicProductListResponse)
@limiter.limit('120/minute')
def list_products(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=48),
    search: Optional[str] = None,
    gender: Optional[str] = None,
    category: Optional[str] = None,
    sizes: Optional[str] = None,
    minPrice: Optional[int] = None,
    maxPrice: Optional[int] = None,
    tag: Optional[str] = None,
    sort: str = Query(default='newest')
):
    """Fetch active, in-stock public products with filters."""
    db = get_db_client()
    return public_catalog_service.list_public_products(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        gender=gender,
        category=category,
        sizes=sizes,
        min_price=minPrice,
        max_price=maxPrice,
        tag=tag,
        sort=sort
    )


@router.get('/products/{slug}', response_model=PublicProductDetailResponse)
@limiter.limit('60/minute')
def get_product(request: Request, slug: str, db: Client = Depends(get_db_client)):
    """Fetch full public product details including active variants."""
    return public_catalog_service.get_public_product(db, slug)
