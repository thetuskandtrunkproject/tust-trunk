import math
from fastapi import HTTPException
from supabase import Client

def list_public_categories(db: Client) -> list:
    """Fetch all active categories for the public sidebar."""
    res = db.table('categories').select('id, name, slug').eq('is_active', True).execute()
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
    
    # Call the RPC
    rpc_params = {
        'search_term': search,
        'filter_gender': gender,
        'filter_category': category,
        'filter_sizes': sizes_arr,
        'min_price': min_price_paise,
        'max_price': max_price_paise,
        'filter_tag': tag,
        'sort_by': sort,
        'page_num': page,
        'page_size': page_size
    }
    
    # Clean up None values so Postgres uses defaults correctly
    rpc_params = {k: v for k, v in rpc_params.items() if v is not None}
    
    res = db.rpc('search_public_products', rpc_params).execute()
    
    total = 0
    items = []
    
    if res.data:
        total = res.data[0]['total_count']
        items = [row['product_data'] for row in res.data]
        
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
    ids_list = [v_id.strip() for v_id in ids_str.split(',') if v_id.strip()]
    if not ids_list:
        return {'items': []}
        
    ids_list = ids_list[:50]
    
    # Query product_variants joined with products
    res = (
        db.table('product_variants')
        .select('*, products(*)')
        .in_('id', ids_list)
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

