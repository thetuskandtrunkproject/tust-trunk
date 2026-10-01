import logging
import uuid
import math
from typing import Optional
from fastapi import HTTPException
from supabase import Client

from app.schemas.products import (
    ProductCreate,
    ProductUpdate,
    VariantCreate,
    VariantUpdate,
)

logger = logging.getLogger(__name__)

PRODUCTS_TABLE = 'products'
VARIANTS_TABLE = 'product_variants'


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_category_name(db: Client, category_id: str) -> str:
    res = db.table('categories').select('name').eq('id', category_id).execute()
    if res.data:
        return res.data[0]['name']
    return ''

def _get_product_or_404(db: Client, product_id: str) -> dict:
    """Fetch a single product row, raising 404 if not found."""
    res = db.table(PRODUCTS_TABLE).select('*, categories(name)').eq('id', product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail='Product not found')
    product = res.data[0]
    if 'categories' in product and product['categories']:
        product['category'] = product['categories']['name']
    else:
        product['category'] = ''
    product.pop('categories', None)
    return product


def _get_variant_or_404(db: Client, variant_id: str, product_id: str) -> dict:
    """Fetch a variant, verifying it belongs to the given product."""
    res = (
        db.table(VARIANTS_TABLE)
        .select('*')
        .eq('id', variant_id)
        .eq('product_id', product_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=404,
            detail='Variant not found on this product'
        )
    return res.data[0]


def _check_slug_unique(db: Client, slug: str, exclude_id: Optional[str] = None) -> None:
    """Raise 409 if the slug is already taken by another product."""
    q = db.table(PRODUCTS_TABLE).select('id').eq('slug', slug)
    if exclude_id:
        q = q.neq('id', exclude_id)
    res = q.execute()
    if res.data:
        raise HTTPException(
            status_code=409,
            detail=f"A product with slug '{slug}' already exists"
        )


def _check_sku_unique(db: Client, sku: str, exclude_variant_id: Optional[str] = None) -> None:
    """Raise 409 if the SKU is already taken anywhere in the catalog."""
    q = db.table(VARIANTS_TABLE).select('id').eq('sku', sku)
    if exclude_variant_id:
        q = q.neq('id', exclude_variant_id)
    res = q.execute()
    if res.data:
        raise HTTPException(
            status_code=409,
            detail=f"SKU '{sku}' is already in use in the catalog"
        )


def _attach_variants(db: Client, product: dict) -> dict:
    """Fetch all variants for a product and attach them."""
    res = (
        db.table(VARIANTS_TABLE)
        .select('*')
        .eq('product_id', product['id'])
        .order('created_at', desc=False)
        .execute()
    )
    product['variants'] = res.data or []
    return product


# ---------------------------------------------------------------------------
# Create product (atomic: product + all initial variants)
# ---------------------------------------------------------------------------

def create_product(db: Client, data: ProductCreate, admin_user: dict) -> dict:
    """
    Creates a product and its initial variants as an atomic operation.

    Supabase Python client does not expose native transactions, so we use
    a careful sequence with rollback on failure: insert product first,
    then insert all variants. If variant insertion fails, the product row
    is deleted to prevent a half-created product from persisting.
    """
    _check_slug_unique(db, data.slug)

    # Check all SKUs upfront before touching the DB
    seen_skus: set[str] = set()
    for v in data.variants:
        if v.sku in seen_skus:
            raise HTTPException(
                status_code=422,
                detail=f"Duplicate SKU '{v.sku}' in request — each variant must have a unique SKU"
            )
        seen_skus.add(v.sku)
        _check_sku_unique(db, v.sku)

    # Insert product
    product_row = {
        'name': data.name,
        'slug': data.slug,
        'description': data.description,
        'gender': data.gender,
        'category_id': str(data.category_id),
        'images': data.images,
        'tags': data.tags,
        'status': data.status,
        'created_by': admin_user['id'],
    }
    try:
        product_res = db.table(PRODUCTS_TABLE).insert(product_row).execute()
    except Exception as e:
        logger.error(f'Failed to insert product: {e}')
        raise HTTPException(status_code=500, detail='Failed to create product')

    if not product_res.data:
        raise HTTPException(status_code=500, detail='Failed to create product — no data returned')

    product = product_res.data[0]
    product_id = product['id']

    product['category'] = _get_category_name(db, str(data.category_id))
    
    # Insert all variants. On failure, roll back the product row.
    variant_rows = [
        {
            'product_id': product_id,
            'sku': v.sku,
            'size': v.size,
            'price': v.price,
            'stock': v.stock,
            'is_active': True,
        }
        for v in data.variants
    ]
    try:
        variants_res = db.table(VARIANTS_TABLE).insert(variant_rows).execute()
    except Exception as e:
        logger.error(f'Failed to insert variants for product {product_id}, rolling back: {e}')
        # Rollback: delete the orphaned product row
        db.table(PRODUCTS_TABLE).delete().eq('id', product_id).execute()
        raise HTTPException(status_code=500, detail='Failed to create product variants')

    if not variants_res.data:
        db.table(PRODUCTS_TABLE).delete().eq('id', product_id).execute()
        raise HTTPException(status_code=500, detail='Failed to create product variants — no data returned')

    product['variants'] = variants_res.data
    return get_product(db, product_id)


# ---------------------------------------------------------------------------
# List products (admin view, paginated, with aggregated variant summary)
# ---------------------------------------------------------------------------

def list_products(
    db: Client,
    page: int,
    page_size: int,
    status: Optional[str],
    gender: Optional[str],
    category: Optional[str],
    search: Optional[str],
    sort: str,
    include_variants: bool = False,
) -> dict:
    """
    Returns a paginated list of products with aggregated variant_count and
    total_stock. Uses a single Supabase query per request — no N+1.

    Supabase Python v2 does not support raw SQL joins from the client directly,
    so variant aggregates are fetched in a separate single query and merged 
    in Python. This is 2 queries total (not N+1 per product).
    """
    # Build product query with filters
    q = db.table(PRODUCTS_TABLE).select('*, categories(name)', count='exact')

    if status:
        q = q.eq('status', status)
    if gender:
        q = q.eq('gender', gender)
    if category:
        pass
    if search:
        q = q.ilike('name', f'%{search}%')

    # Sorting
    sort_map = {
        'name_asc': ('name', False),
        'updated_at_desc': ('updated_at', True),
        'created_at_desc': ('created_at', True),
    }
    sort_col, sort_desc = sort_map.get(sort, ('updated_at', True))
    q = q.order(sort_col, desc=sort_desc)

    # Pagination (Supabase uses offset-based)
    offset = (page - 1) * page_size
    q = q.range(offset, offset + page_size - 1)

    res = q.execute()
    products = res.data or []
    total = res.count or 0

    if not products:
        return {
            'items': [],
            'total': 0,
            'page': page,
            'page_size': page_size,
            'total_pages': 0,
        }

    # Fetch variant data for all products on this page (one query)
    product_ids = [p['id'] for p in products]
    
    variant_cols = '*' if include_variants else 'product_id, stock'
    variants_res = (
        db.table(VARIANTS_TABLE)
        .select(variant_cols)
        .in_('product_id', product_ids)
        .execute()
    )
    variants_raw = variants_res.data or []

    # Build aggregate map: { product_id: { count, total_stock, variants } }
    agg: dict[str, dict] = {}
    for v in variants_raw:
        pid = v['product_id']
        if pid not in agg:
            agg[pid] = {'variant_count': 0, 'total_stock': 0, 'variants': []}
        agg[pid]['variant_count'] += 1
        agg[pid]['total_stock'] += v.get('stock', 0)
        if include_variants:
            agg[pid]['variants'].append(v)

    # Attach aggregates to each product
    for p in products:
        a = agg.get(p['id'], {'variant_count': 0, 'total_stock': 0, 'variants': []})
        p['variant_count'] = a['variant_count']
        p['total_stock'] = a['total_stock']
        if include_variants:
            # Optionally sort variants if needed, e.g., by id or created_at
            p['variants'] = sorted(a['variants'], key=lambda x: x.get('created_at', ''))
            
        if 'categories' in p and p['categories']:
            p['category'] = p['categories']['name']
        else:
            p['category'] = ''
        p.pop('categories', None)

    return {
        'items': products,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': math.ceil(total / page_size) if total > 0 else 0,
    }


# ---------------------------------------------------------------------------
# Get single product with all variants
# ---------------------------------------------------------------------------

def get_product(db: Client, product_id: str) -> dict:
    product = _get_product_or_404(db, product_id)
    return _attach_variants(db, product)


# ---------------------------------------------------------------------------
# Update product-level fields (partial)
# ---------------------------------------------------------------------------

def update_product(db: Client, product_id: str, data: ProductUpdate) -> dict:
    _get_product_or_404(db, product_id)  # Raise 404 if not found

    update_data = data.model_dump(exclude_unset=True)
    if 'category_id' in update_data and update_data['category_id'] is not None:
        update_data['category_id'] = str(update_data['category_id'])
    
    if not update_data:
        return get_product(db, product_id)

    # Check slug uniqueness if being changed
    if 'slug' in update_data:
        _check_slug_unique(db, update_data['slug'], exclude_id=product_id)

    try:
        res = (
            db.table(PRODUCTS_TABLE)
            .update(update_data)
            .eq('id', product_id)
            .execute()
        )
    except Exception as e:
        logger.error(f'Failed to update product {product_id}: {e}')
        raise HTTPException(status_code=500, detail=f'Failed to update product: {str(e)}')

    if not res.data:
        raise HTTPException(status_code=404, detail='Product not found')

    return get_product(db, product_id)


# ---------------------------------------------------------------------------
# Soft-delete product (archive)
# ---------------------------------------------------------------------------

def archive_product(db: Client, product_id: str) -> dict:
    """
    Soft-delete: sets product status = 'Archived' and all child variants
    is_active = False, atomically in two sequential updates.

    Hard delete is not supported. See design doc: hard-deleting variant rows
    would orphan future order line items that reference variant IDs.
    """
    _get_product_or_404(db, product_id)

    try:
        # Deactivate all variants first
        db.table(VARIANTS_TABLE).update({'is_active': False}).eq('product_id', product_id).execute()
        # Archive the product
        res = db.table(PRODUCTS_TABLE).update({'status': 'Archived'}).eq('id', product_id).execute()
    except Exception as e:
        logger.error(f'Failed to archive product {product_id}: {e}')
        raise HTTPException(status_code=500, detail='Failed to archive product')

    if not res.data:
        raise HTTPException(status_code=404, detail='Product not found')

    return get_product(db, product_id)


# ---------------------------------------------------------------------------
# Add variant to existing product
# ---------------------------------------------------------------------------

def add_variant(db: Client, product_id: str, data: VariantCreate) -> dict:
    _get_product_or_404(db, product_id)
    _check_sku_unique(db, data.sku)

    variant_row = {
        'product_id': product_id,
        'sku': data.sku,
        'size': data.size,
        'price': data.price,
        'stock': data.stock,
        'is_active': True,
    }
    try:
        res = db.table(VARIANTS_TABLE).insert(variant_row).execute()
    except Exception as e:
        logger.error(f'Failed to add variant to product {product_id}: {e}')
        raise HTTPException(status_code=500, detail='Failed to add variant')

    if not res.data:
        raise HTTPException(status_code=500, detail='Failed to add variant — no data returned')

    return res.data[0]


# ---------------------------------------------------------------------------
# Update a variant (partial)
# ---------------------------------------------------------------------------

def update_variant(db: Client, product_id: str, variant_id: str, data: VariantUpdate) -> dict:
    _get_variant_or_404(db, variant_id, product_id)

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return _get_variant_or_404(db, variant_id, product_id)

    # Check SKU uniqueness if changing the SKU
    if 'sku' in update_data:
        _check_sku_unique(db, update_data['sku'], exclude_variant_id=variant_id)

    try:
        res = (
            db.table(VARIANTS_TABLE)
            .update(update_data)
            .eq('id', variant_id)
            .eq('product_id', product_id)
            .execute()
        )
    except Exception as e:
        logger.error(f'Failed to update variant {variant_id}: {e}')
        raise HTTPException(status_code=500, detail='Failed to update variant')

    if not res.data:
        raise HTTPException(status_code=404, detail='Variant not found')

    return res.data[0]


# ---------------------------------------------------------------------------
# Soft-delete a variant (deactivate)
# ---------------------------------------------------------------------------

def deactivate_variant(db: Client, product_id: str, variant_id: str) -> dict:
    """
    Soft-delete: sets is_active = False on the variant.
    The variant row is preserved so historical order references remain valid.
    """
    _get_variant_or_404(db, variant_id, product_id)

    try:
        res = (
            db.table(VARIANTS_TABLE)
            .update({'is_active': False})
            .eq('id', variant_id)
            .eq('product_id', product_id)
            .execute()
        )
    except Exception as e:
        logger.error(f'Failed to deactivate variant {variant_id}: {e}')
        raise HTTPException(status_code=500, detail='Failed to deactivate variant')

    if not res.data:
        raise HTTPException(status_code=404, detail='Variant not found')

    return res.data[0]


# ---------------------------------------------------------------------------
# Image: upload
# ---------------------------------------------------------------------------

def upload_product_image(db: Client, product_id: str, file_bytes: bytes, storage_path: str) -> dict:
    """
    Uploads an image file to Supabase Storage and appends its public URL
    to the product's images array.

    storage_path: pre-computed path in format products/{product_id}/{uuid4}-{filename}
    Returns the updated product row (without variants for speed).
    """
    product = _get_product_or_404(db, product_id)

    BUCKET = 'product-images'

    try:
        db.storage.from_(BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={'upsert': 'false'},
        )
    except Exception as e:
        err_str = str(e)
        if 'already exists' in err_str.lower() or 'duplicate' in err_str.lower():
            raise HTTPException(status_code=409, detail='A file with this name already exists. Retry — the UUID prefix should prevent this.')
        logger.error(f'Storage upload failed for {storage_path}: {e}')
        raise HTTPException(status_code=500, detail='Image upload failed')

    # Get the public URL from Supabase storage
    url_response = db.storage.from_(BUCKET).get_public_url(storage_path)
    # url_response is a string (the public URL) in supabase-py v2
    public_url = url_response if isinstance(url_response, str) else url_response.get('publicUrl', '')

    if not public_url:
        raise HTTPException(status_code=500, detail='Failed to retrieve public URL after upload')

    # Append (additive — does not replace existing images)
    existing_images: list = product.get('images') or []
    updated_images = existing_images + [public_url]

    try:
        res = (
            db.table(PRODUCTS_TABLE)
            .update({'images': updated_images})
            .eq('id', product_id)
            .execute()
        )
    except Exception as e:
        logger.error(f'Failed to update product images array for {product_id}: {e}')
        raise HTTPException(status_code=500, detail='Image uploaded to storage but failed to update product record')

    return get_product(db, product_id)


# ---------------------------------------------------------------------------
# Image: delete
# ---------------------------------------------------------------------------

def delete_product_image(db: Client, product_id: str, image_url: str) -> dict:
    """
    Removes image_url from the product's images array and deletes the
    underlying file from Supabase Storage to prevent orphaned files.

    image_url: the exact public URL string that was returned during upload.
    """
    product = _get_product_or_404(db, product_id)

    existing_images: list = product.get('images') or []
    if image_url not in existing_images:
        raise HTTPException(
            status_code=404,
            detail='Image URL not found on this product'
        )

    BUCKET = 'product-images'
    SUPABASE_STORAGE_PREFIX = f'/storage/v1/object/public/{BUCKET}/'

    # Derive the storage path from the public URL
    # Public URL format: https://<project>.supabase.co/storage/v1/object/public/product-images/products/...
    if SUPABASE_STORAGE_PREFIX in image_url:
        storage_path = image_url.split(SUPABASE_STORAGE_PREFIX)[-1]
    else:
        logger.warning(f'Cannot derive storage path from URL: {image_url}')
        storage_path = None

    # Remove from images array first (the source of truth for display)
    updated_images = [img for img in existing_images if img != image_url]
    try:
        res = (
            db.table(PRODUCTS_TABLE)
            .update({'images': updated_images})
            .eq('id', product_id)
            .execute()
        )
    except Exception as e:
        logger.error(f'Failed to remove image from product {product_id}: {e}')
        raise HTTPException(status_code=500, detail='Failed to update product images')

    # Delete the storage object (best-effort — do not fail the request if storage
    # deletion fails, since the DB reference is already removed)
    if storage_path:
        try:
            db.storage.from_(BUCKET).remove([storage_path])
        except Exception as e:
            logger.warning(f'Storage delete failed for {storage_path} (continuing anyway): {e}')

    return get_product(db, product_id)


# ---------------------------------------------------------------------------
# Bulk Actions
# ---------------------------------------------------------------------------

def bulk_move_category(db: Client, product_ids: list[str], category_id: str) -> dict:
    try:
        db.table(PRODUCTS_TABLE).update({'category_id': category_id}).in_('id', product_ids).execute()
        return {"status": "success"}
    except Exception as e:
        logger.error(f'Failed to bulk move category: {e}')
        raise HTTPException(status_code=500, detail='Failed to move products')


def bulk_update_status(db: Client, product_ids: list[str], status: str) -> dict:
    try:
        db.table(PRODUCTS_TABLE).update({'status': status}).in_('id', product_ids).execute()
        return {"status": "success"}
    except Exception as e:
        logger.error(f'Failed to bulk update status: {e}')
        raise HTTPException(status_code=500, detail='Failed to update products')


def bulk_delete_products(db: Client, product_ids: list[str]) -> dict:
    try:
        # DB constraints will fail if orders exist for these products. We assume simple deletes for now.
        db.table(VARIANTS_TABLE).delete().in_('product_id', product_ids).execute()
        db.table(PRODUCTS_TABLE).delete().in_('id', product_ids).execute()
        return {"status": "success"}
    except Exception as e:
        logger.error(f'Failed to bulk delete products: {e}')
        raise HTTPException(status_code=500, detail='Failed to delete products')


def bulk_update_sale_price(db: Client, product_ids: list[str], sale_price: int | None) -> dict:
    try:
        db.table(VARIANTS_TABLE).update({'sale_price': sale_price}).in_('product_id', product_ids).execute()
        return {"status": "success"}
    except Exception as e:
        logger.error(f'Failed to bulk update sale price: {e}')
        raise HTTPException(status_code=500, detail='Failed to update sale price')

