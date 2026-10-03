import math
from fastapi import HTTPException
from supabase import Client

def list_public_categories(db: Client) -> list:
    """Fetch all active categories for the public sidebar and mega menu."""
    res = db.table('categories').select('id, name, slug, gender').eq('is_active', True).execute()
    return res.data


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
    
    genders_arr = [g.strip().lower() for g in gender.split(',')] if gender else []
    categories_arr = [c.strip().lower() for c in category.split(',')] if category else []
    
    valid_cat_names = []
    if categories_arr:
        cats_res = db.table('categories').select('name').in_('slug', categories_arr).execute()
        valid_cat_names = [c['name'].lower() for c in (cats_res.data or [])]
    
    # Call the RPC with max limits, ignoring gender and category for SQL
    rpc_params = {
        'search_term': search,
        'filter_sizes': sizes_arr,
        'min_price': min_price_paise,
        'max_price': max_price_paise,
        'filter_tag': tag,
        'sort_by': sort,
        'page_num': 1,
        'page_size': 10000
    }
    
    # Clean up None values so Postgres uses defaults correctly
    rpc_params = {k: v for k, v in rpc_params.items() if v is not None}
    
    res = db.rpc('search_public_products', rpc_params).execute()
    
    all_items = []
    if res.data:
        all_items = [row['product_data'] for row in res.data]
        
    filtered_items = []
    for item in all_items:
        if genders_arr and item.get('gender', '').lower() not in genders_arr:
            continue
        if categories_arr and item.get('category', '').lower() not in valid_cat_names:
            continue
            
        if item.get('images'):
            item['images'] = item['images'][:2]
            
        filtered_items.append(item)
        
    total = len(filtered_items)
    
    # Paginate in python
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paged_items = filtered_items[start_idx:end_idx]
        
    return {
        'items': paged_items,
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
    
    # Format variant prices to rupees
    for variant in product.get('product_variants', []):
        variant['price'] = int(variant['price'] / 100)
        
    product['variants'] = product.get('product_variants', [])
    product.pop('product_variants', None)
    product.pop('categories', None)
    
    return product

def resolve_variants(db: Client, ids_str: str) -> dict:
    """Resolve a comma-separated list of variant UUIDs for guest carts."""
    # Parse and limit to 50
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
    
    # Query product_variants joined with products
    res = (
        db.table('product_variants')
        .select('*, products(*)')
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
            
        items.append({
            'is_available': is_available,
            'variant': {
                'id': row['id'],
                'sku': row['sku'],
                'size': row['size'],
                'price': int(row['price'] / 100),
                'stock': row['stock'],
                'is_active': row['is_active']
            },
            'product': {
                'id': prod['id'],
                'name': prod['name'],
                'slug': prod['slug'],
                'images': prod.get('images', [])
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
    
    # Query products joined with categories and variants
    res = (
        db.table('products')
        .select('*, categories!inner(name), product_variants(price, stock, is_active)')
        .in_('id', valid_ids)
        .eq('status', 'Active')
        .eq('categories.is_active', True)
        .execute()
    )
    
    items = []
    for product in res.data:
        # Determine current_price based on active variants with stock
        active_variants = [
            v for v in product.get('product_variants', [])
            if v.get('is_active') is True and v.get('stock', 0) > 0
        ]
        
        # Determine price (lowest among active variants)
        current_price = 0
        if active_variants:
            current_price = int(min(v.get('price', 0) for v in active_variants) / 100)
            
        items.append({
            'id': product['id'],
            'name': product['name'],
            'slug': product['slug'],
            'category': product['categories']['name'],
            'price': current_price,
            'images': product.get('images', []),
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

