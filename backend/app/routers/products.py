import uuid
import logging
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, Request, status, HTTPException, File, UploadFile, Query
from supabase import Client
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.products import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    VariantCreate,
    VariantUpdate,
    VariantResponse,
    ImageDeleteRequest,
    BulkMoveCategoryRequest,
    BulkStatusUpdateRequest,
    BulkDeleteRequest,
    BulkSalePriceRequest,
)
from app.dependencies.auth import get_current_admin
from app.core.database import get_db_client
from app.services import products_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/api/v1/admin/products', tags=['admin-products'])

# Rate limiter keyed by admin firebase_uid (not IP) since all endpoints are 
# authenticated-only. This ensures a compromised admin token cannot hammer 
# write endpoints.
# Falls back to IP if the uid key function raises.
def _admin_uid_key(request: Request) -> str:
    """Key function: uses the admin's firebase_uid, falls back to IP."""
    try:
        # The admin dict is resolved by get_current_admin and stored in request.state
        # by our dependency. We access it directly from state to avoid re-running
        # the dependency inside the key function.
        uid = getattr(request.state, 'admin_firebase_uid', None)
        if uid:
            return uid
    except Exception:
        pass
    return get_remote_address(request)


import os
limiter = Limiter(key_func=_admin_uid_key, storage_uri=os.getenv("REDIS_URL", "memory://"))

# ---------------------------------------------------------------------------
# Middleware: inject admin uid into request.state so the rate limiter key
# function can read it without re-running authentication.
# This is set in the router dependency via a helper dependency.
# ---------------------------------------------------------------------------

def _set_admin_state(request: Request, admin: dict = Depends(get_current_admin)) -> dict:
    """
    Injects the admin's firebase_uid into request.state so the rate limiter
    key function can access it without re-invoking auth dependencies.
    """
    request.state.admin_firebase_uid = admin.get('firebase_uid', '')
    return admin


# ---------------------------------------------------------------------------
# POST /api/v1/admin/products/
# Create a product with initial variants (atomic)
# ---------------------------------------------------------------------------

@router.post('/', response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit('30/minute')
def create_product(
    request: Request,
    data: ProductCreate,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Creates a new product with its initial variants in a single atomic operation.
    At least one variant is required.
    Prices are in paise (1 INR = 100 paise).
    """
    return products_service.create_product(db, data, admin)


# ---------------------------------------------------------------------------
# GET /api/v1/admin/products/
# List products with pagination and filters
# ---------------------------------------------------------------------------

@router.get('/', response_model=ProductListResponse)
@limiter.limit('200/minute')
def list_products(
    request: Request,
    page: int = Query(default=1, ge=1, description='Page number (1-based)'),
    page_size: int = Query(default=20, ge=1, le=100, description='Items per page (max 100)'),
    status: Optional[str] = Query(default=None, description='Filter by status: Active | Draft | Archived'),
    gender: Optional[str] = Query(default=None, description='Filter by gender: Men | Women | Kids | Unisex'),
    category: Optional[str] = Query(default=None, description='Filter by category (partial match)'),
    search: Optional[str] = Query(default=None, description='Search by product name'),
    sort: str = Query(default='updated_at_desc', description='Sort: name_asc | updated_at_desc | created_at_desc'),
    include_variants: bool = Query(default=False, description='Include full variant objects'),
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Admin product list. Returns lightweight product objects (no full variant arrays).
    Includes variant_count and total_stock aggregated per product.
    Optionally include full variants by setting include_variants=true.
    """
    if status and status not in ('Active', 'Draft', 'Archived'):
        raise HTTPException(status_code=422, detail="status must be one of: Active, Draft, Archived")
    if gender and gender not in ('Men', 'Women', 'Kids', 'Unisex'):
        raise HTTPException(status_code=422, detail="gender must be one of: Men, Women, Kids, Unisex")
    if sort not in ('name_asc', 'updated_at_desc', 'created_at_desc'):
        raise HTTPException(status_code=422, detail="sort must be one of: name_asc, updated_at_desc, created_at_desc")

    return products_service.list_products(db, page, page_size, status, gender, category, search, sort, include_variants)


# ---------------------------------------------------------------------------
# GET /api/v1/admin/products/{product_id}
# Get a single product with all its variants
# ---------------------------------------------------------------------------

@router.get('/{product_id}', response_model=ProductResponse)
@limiter.limit('200/minute')
def get_product(
    request: Request,
    product_id: str,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """Returns the full product including all variants."""
    return products_service.get_product(db, product_id)


# ---------------------------------------------------------------------------
# PATCH /api/v1/admin/products/{product_id}
# Update product-level fields only (partial)
# ---------------------------------------------------------------------------

@router.patch('/{product_id}', response_model=ProductResponse)
@limiter.limit('60/minute')
def update_product(
    request: Request,
    product_id: str,
    data: ProductUpdate,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Partial update of product-level fields.
    Only fields present in the request body are modified.
    Variants are not affected by this endpoint — use the /variants/ sub-resource.
    """
    return products_service.update_product(db, product_id, data)


# ---------------------------------------------------------------------------
# DELETE /api/v1/admin/products/{product_id}
# Soft-delete: archive product and deactivate all its variants
# ---------------------------------------------------------------------------

@router.delete('/{product_id}', response_model=ProductResponse)
@limiter.limit('10/minute')
def archive_product(
    request: Request,
    product_id: str,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Soft-deletes the product by setting status = 'Archived' and 
    is_active = False on all child variants.
    Hard deletion is not supported — variant rows must be preserved
    for future order history integrity.
    """
    return products_service.archive_product(db, product_id)


# ---------------------------------------------------------------------------
# POST /api/v1/admin/products/{product_id}/variants/
# Add a new variant to an existing product
# ---------------------------------------------------------------------------

@router.post('/{product_id}/variants/', response_model=VariantResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit('60/minute')
def add_variant(
    request: Request,
    product_id: str,
    data: VariantCreate,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """Adds a new variant (sku, size, price, stock) to an existing product."""
    return products_service.add_variant(db, product_id, data)


# ---------------------------------------------------------------------------
# PATCH /api/v1/admin/products/{product_id}/variants/{variant_id}
# Partial update of a single variant
# ---------------------------------------------------------------------------

@router.patch('/{product_id}/variants/{variant_id}', response_model=VariantResponse)
@limiter.limit('120/minute')
def update_variant(
    request: Request,
    product_id: str,
    variant_id: str,
    data: VariantUpdate,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Partial update of a single variant.
    A stock-only update sends just { "stock": 150 } — no other fields required.
    """
    return products_service.update_variant(db, product_id, variant_id, data)


# ---------------------------------------------------------------------------
# DELETE /api/v1/admin/products/{product_id}/variants/{variant_id}
# Soft-delete: deactivate a variant
# ---------------------------------------------------------------------------

@router.delete('/{product_id}/variants/{variant_id}', response_model=VariantResponse)
@limiter.limit('20/minute')
def deactivate_variant(
    request: Request,
    product_id: str,
    variant_id: str,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Soft-deletes a variant by setting is_active = False.
    The variant row is preserved for order history integrity.
    """
    return products_service.deactivate_variant(db, product_id, variant_id)


# ---------------------------------------------------------------------------
# POST /api/v1/admin/products/{product_id}/images
# Upload an image for a product
# ---------------------------------------------------------------------------

ALLOWED_IMAGE_TYPES = {'image/webp'}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


# ---------------------------------------------------------------------------
# Bulk Actions
# ---------------------------------------------------------------------------

@router.post('/bulk/category')
@limiter.limit("30/minute")
def bulk_move_category(
    data: BulkMoveCategoryRequest,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """Move multiple products to a new category."""
    return products_service.bulk_move_category(db, [str(pid) for pid in data.product_ids], str(data.category_id))


@router.post('/bulk/status')
@limiter.limit("30/minute")
def bulk_update_status(
    data: BulkStatusUpdateRequest,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """Change status for multiple products."""
    return products_service.bulk_update_status(db, [str(pid) for pid in data.product_ids], data.status)


@router.post('/bulk/delete')
@limiter.limit("30/minute")
def bulk_delete_products(
    data: BulkDeleteRequest,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """Delete multiple products."""
    return products_service.bulk_delete_products(db, [str(pid) for pid in data.product_ids])


@router.post('/bulk/sale-price')
@limiter.limit("30/minute")
def bulk_update_sale_price(
    data: BulkSalePriceRequest,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """Set or remove sale price for multiple products."""
    return products_service.bulk_update_sale_price(db, [str(pid) for pid in data.product_ids], data.sale_price)


# ---------------------------------------------------------------------------
# POST /api/v1/admin/products/{product_id}/images
# ---------------------------------------------------------------------------
@router.post('/{product_id}/images', response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit('30/minute')
async def upload_image(
    request: Request,
    product_id: str,
    file: UploadFile = File(..., description='Image file (webp, max 5MB)'),
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Uploads an image to Supabase Storage bucket 'product-images' and appends
    the resulting public URL to the product's images array.

    Path pattern: products/{product_id}/{uuid4}-{original_filename}
    Accepted types: image/webp
    Max size: 5MB

    This endpoint is additive — it never replaces existing images.
    """
    # Validate content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: webp"
        )

    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f'File too large. Maximum allowed size is 5MB (received {len(file_bytes) / 1024 / 1024:.1f}MB)'
        )

    # Re-validate content type by reading magic bytes (defense in depth)
    # WebP: RIFF....WEBP
    if not (
        (file_bytes[:4] == b'RIFF' and file_bytes[8:12] == b'WEBP')  # WebP
    ):
        raise HTTPException(
            status_code=400,
            detail='File content does not match its declared type. Only real jpg/png/webp images are accepted.'
        )

    # Build storage path: products/{product_id}/{uuid4}-{sanitized_filename}
    original_name = file.filename or 'image'
    # Sanitize: keep only alphanumeric, dots, hyphens
    safe_name = ''.join(c if c.isalnum() or c in '.-_' else '_' for c in original_name)
    storage_path = f'products/{product_id}/{uuid.uuid4()}-{safe_name}'

    return products_service.upload_product_image(db, product_id, file_bytes, storage_path)


# ---------------------------------------------------------------------------
# DELETE /api/v1/admin/products/{product_id}/images
# Remove a specific image from a product (by URL in request body)
# ---------------------------------------------------------------------------

@router.delete('/{product_id}/images', response_model=ProductResponse)
@limiter.limit('30/minute')
def delete_image(
    request: Request,
    product_id: str,
    body: ImageDeleteRequest,
    admin: dict = Depends(_set_admin_state),
    db: Client = Depends(get_db_client),
):
    """
    Removes a specific image URL from the product's images array and deletes
    the underlying file from Supabase Storage.

    Request body:
    { "image_url": "https://<project>.supabase.co/storage/v1/object/public/product-images/products/..." }

    The image_url must be an exact match of a URL currently in the product's images array.
    """
    return products_service.delete_product_image(db, product_id, body.image_url)
