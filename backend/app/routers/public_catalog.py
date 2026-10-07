from fastapi import APIRouter, Depends, Query, Request, Response
from typing import Optional, List
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.schemas.public_catalog import (
    PublicProductListResponse,
    PublicProductDetailResponse,
    PublicCategoryResponse,
    PublicResolveResponse,
    PublicResolveProductResponse
)
from app.services import public_catalog_service

router = APIRouter(prefix="/public", tags=["Public Catalog"])

# 120 req/minute per IP for product listings
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])


@router.get('/categories', response_model=List[PublicCategoryResponse])
@limiter.limit('120/minute')
def list_categories(request: Request, response: Response, db: Client = Depends(get_db_client)):
    """Fetch active categories for public storefront."""
    response.headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=600"
    return public_catalog_service.list_public_categories(db)

@router.get('/sizes', response_model=List[str])
@limiter.limit('120/minute')
def list_sizes(request: Request, response: Response, db: Client = Depends(get_db_client)):
    """Fetch all active available sizes."""
    response.headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=600"
    return public_catalog_service.list_public_sizes(db)


@router.get('/products', response_model=PublicProductListResponse)
@limiter.limit('120/minute')
def list_products(
    request: Request,
    response: Response,
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
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
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


@router.get('/products/resolve', response_model=PublicResolveProductResponse)
@limiter.limit('60/minute')
def resolve_products(
    request: Request,
    ids: str = Query(..., description="Comma-separated list of product UUIDs"),
    db: Client = Depends(get_db_client)
):
    """Resolve a batch of product IDs into display data for guest wishlists."""
    return public_catalog_service.resolve_products(db, ids)

@router.get('/products/{slug}', response_model=PublicProductDetailResponse)
@limiter.limit('60/minute')
def get_product(request: Request, response: Response, slug: str, db: Client = Depends(get_db_client)):
    """Fetch full public product details including active variants."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    return public_catalog_service.get_public_product(db, slug)

@router.get('/variants/resolve', response_model=PublicResolveResponse)
@limiter.limit('60/minute')
def resolve_variants(
    request: Request, 
    ids: str = Query(..., description="Comma-separated list of variant UUIDs"), 
    db: Client = Depends(get_db_client)
):
    """Resolve a batch of variant IDs into display data for guest carts."""
    return public_catalog_service.resolve_variants(db, ids)

