import math
from fastapi import HTTPException
from supabase import Client

def list_public_categories(db: Client) -> list:
    """Fetch all active categories for the public sidebar and mega menu."""
    res = db.table('categories').select('id, name, slug, gender').eq('is_active', True).execute()
    return res.data


def list_public_sizes(db: Client) -> list:
    """Fetch all available sizes from active products in stock."""
    res = db.table('product_variants').select('size').eq('is_active', True).gt('stock', 0).execute()
    sizes = set(item['size'] for item in res.data if item['size'])
    return sorted(list(sizes))


def list_public_products(
    db: Client,
    page: int,
    page_size: int,
    search: str | None,
    gender: str | None,
    category: str | None,
    sizes: str | None,
    min_price: int | None,
    max_price: int | None,
    tag: str | None,
    sort: str
) -> dict:
    # Parse sizes into array
    sizes_arr = sizes.split(',') if sizes else None

    # Prices from frontend are in rupees, convert to paise for DB
    min_price_paise = min_price * 100 if min_price is not None else None
    max_price_paise = max_price * 100 if max_price is not None else None

    # The RPC supports a single gender/category value at a time.
    # Take the first value from a comma-separated string if provided.
    gender_filter = gender.split(',')[0].strip() if gender else None
    category_filter = category.split(',')[0].strip() if category else None

    # Build RPC params — let Postgres handle ALL filtering and pagination.
    # The RPC (migration 006) caps page_size at 48 server-side.
    # Previously this was page_size=10000 which fetched the entire catalog on every request.
    rpc_params: dict = {
        'page_num': page,
        'page_size': page_size,
        'sort_by': sort,
    }
    if search:
        rpc_params['search_term'] = search
    if gender_filter:
        rpc_params['filter_gender'] = gender_filter
    if category_filter:
        rpc_params['filter_category'] = category_filter
    if sizes_arr:
        rpc_params['filter_sizes'] = sizes_arr
    if min_price_paise is not None:
        rpc_params['min_price'] = min_price_paise
    if max_price_paise is not None:
        rpc_params['max_price'] = max_price_paise
    if tag:
        rpc_params['filter_tag'] = tag

    res = db.rpc('search_public_products', rpc_params).execute()

    items = []
    total = 0
    if res.data:
        total = res.data[0]['total_count']
        for row in res.data:
            item = row['product_data']
            # Keep only first 2 images per product for list view (reduces payload)
            if item.get('images'):
                item['images'] = item['images'][:2]
            items.append(item)

    return {
        'items': items,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': math.ceil(total / page_size) if total > 0 else 0
    }


def get_public_product(db: Client, slug: str) -> dict:
    # Fetch product with categories and active variants
    res = (
        db.table('products')
        .select('*, categories!inner(name), product_variants(*)')
        .eq('slug', slug)
        .eq('status', 'Active')
        .eq('categories.is_active', True)
        .eq('product_variants.is_active', True)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")

    product = res.data[0]

    # Format category
    product['category'] = product['categories']['name']

    # Prices are already in paise, leave them as is for the frontend
    # (The frontend divides by 100 when displaying)
    for variant in product.get('product_variants', []):
        variant['price'] = variant['price']

    product['variants'] = product.get('product_variants', [])
    product.pop('product_variants', None)
    product.pop('categories', None)

    return product

def resolve_variants(db: Client, ids_str: str) -> dict:
    """Resolve a comma-separated list of variant UUIDs for guest carts."""
    import uuid
    ids_list = [v_id.strip() for v_id in ids_str.split(',') if v_id.strip()]
    valid_ids = []
    for vid in ids_list:
        try:
            uuid.UUID(vid)
            valid_ids.append(vid)
        except ValueError:
            pass

    if not valid_ids:
        return {'items': []}

    valid_ids = valid_ids[:50]

    # Select only needed fields — previously used products(*) which fetched ALL columns
    res = (
        db.table('product_variants')
        .select('id, sku, size, price, sale_price, sale_start_date, sale_end_date, stock, is_active, products(id, name, slug, images, status)')
        .in_('id', valid_ids)
        .execute()
    )

    items = []
    for row in res.data:
        prod = row.get('products')
        if not prod:
            continue

        is_available = (
            row.get('is_active') is True
            and row.get('stock', 0) > 0
            and prod.get('status') == 'Active'
        )

        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        def get_active_price(v):
            if v.get('sale_price'):
                start = datetime.fromisoformat(v['sale_start_date'].replace('Z', '+00:00')) if v.get('sale_start_date') else None
                end = datetime.fromisoformat(v['sale_end_date'].replace('Z', '+00:00')) if v.get('sale_end_date') else None
                started = not start or now >= start
                not_ended = not end or now <= end
                if started and not_ended:
                    return v['sale_price']
            return v.get('price', 0)

        active_price = get_active_price(row)

        items.append({
            'is_available': is_available,
            'variant': {
                'id': row['id'],
                'sku': row['sku'],
                'size': row['size'],
                'price': active_price,
                'original_price': row['price'] if row['price'] > active_price else None,
                'stock': row['stock'],
                'is_active': row['is_active']
            },
            'product': {
                'id': prod['id'],
                'name': prod['name'],
                'slug': prod['slug'],
                'images': prod.get('images', [])[:2]  # Only first 2 images needed
            }
        })

    return {'items': items}

def resolve_products(db: Client, ids_str: str) -> dict:
    """Resolve a comma-separated list of product UUIDs for guest wishlists."""
    import uuid
    ids_list = [p_id.strip() for p_id in ids_str.split(',') if p_id.strip()]
    valid_ids = []
    for pid in ids_list:
        try:
            uuid.UUID(pid)
            valid_ids.append(pid)
        except ValueError:
            pass

    if not valid_ids:
        return {'items': [], 'total': 0, 'page': 1, 'page_size': 50, 'total_pages': 0}

    valid_ids = valid_ids[:50]

    # Select only required fields — previously used products(*) which fetched all columns
    res = (
        db.table('products')
        .select('id, name, slug, images, tags, product_variants(price, sale_price, sale_start_date, sale_end_date, stock, is_active), categories!inner(name)')
        .in_('id', valid_ids)
        .eq('status', 'Active')
        .eq('categories.is_active', True)
        .execute()
    )

    items = []
    for product in res.data:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        def get_active_price(v):
            if v.get('sale_price'):
                start = datetime.fromisoformat(v['sale_start_date'].replace('Z', '+00:00')) if v.get('sale_start_date') else None
                end = datetime.fromisoformat(v['sale_end_date'].replace('Z', '+00:00')) if v.get('sale_end_date') else None
                started = not start or now >= start
                not_ended = not end or now <= end
                if started and not_ended:
                    return v['sale_price']
            return v.get('price', 0)

        # Determine current_price based on active variants with stock
        active_variants = [
            v for v in product.get('product_variants', [])
            if v.get('is_active') is True and v.get('stock', 0) > 0
        ]

        # Determine price (lowest among variants). Fallback to all variants if active_variants is empty
        variants_to_check = active_variants if active_variants else product.get('product_variants', [])
        
        current_price = 0
        original_price = 0
        if variants_to_check:
            min_variant = min(variants_to_check, key=lambda v: get_active_price(v))
            current_price = get_active_price(min_variant)
            original_price = min_variant.get('price', 0)

        items.append({
            'id': product['id'],
            'name': product['name'],
            'slug': product['slug'],
            'category': product['categories']['name'],
            'price': current_price,
            'original_price': original_price if original_price > current_price else None,
            'images': product.get('images', [])[:2],  # Only first 2 images needed
            'tags': product.get('tags', []),
            'is_available': len(active_variants) > 0
        })

    return {
        'items': items,
        'total': len(items),
        'page': 1,
        'page_size': len(items) if items else 50,
        'total_pages': 1
    }
