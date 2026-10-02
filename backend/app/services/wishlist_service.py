from supabase import Client
from fastapi import HTTPException, status
from typing import List

def get_wishlist(db: Client, user_id: str) -> dict:
    res = db.table('wishlist_items').select('*, products(*)').eq('user_id', user_id).execute()
    items = res.data
    
    formatted_items = []
    
    for item in items:
        product = item.get('products')
        if not product:
            continue
            
        is_available = product.get('status') == 'Active'
        
        formatted_items.append({
            "id": item["id"],
            "user_id": item["user_id"],
            "product_id": item["product_id"],
            "created_at": item["created_at"],
            "product": product,
            "is_available": is_available
        })
        
    return {
        "items": formatted_items
    }

def add_to_wishlist(db: Client, user_id: str, product_id: str) -> dict:
    # Check if product exists
    product_res = db.table('products').select('id, status').eq('id', product_id).single().execute()
    if not product_res.data:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if already wishlisted
    existing_res = db.table('wishlist_items').select('*').eq('user_id', user_id).eq('product_id', product_id).execute()
    if not existing_res.data:
        db.table('wishlist_items').insert({
            'user_id': user_id,
            'product_id': product_id
        }).execute()
        
    return get_wishlist(db, user_id)

def remove_from_wishlist(db: Client, user_id: str, product_id: str) -> None:
    res = db.table('wishlist_items').delete().eq('user_id', user_id).eq('product_id', product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

def merge_wishlist(db: Client, user_id: str, product_ids: List[str]) -> dict:
    for product_id in product_ids:
        # We can just attempt to insert and rely on ON CONFLICT DO NOTHING.
        # Supabase Python client doesn't expose ON CONFLICT DO NOTHING cleanly for inserts without throwing errors on conflict sometimes,
        # so we'll just check existence.
        
        # Check if product exists
        product_res = db.table('products').select('id').eq('id', str(product_id)).execute()
        if not product_res.data:
            continue
            
        existing_res = db.table('wishlist_items').select('id').eq('user_id', user_id).eq('product_id', str(product_id)).execute()
        if not existing_res.data:
            db.table('wishlist_items').insert({
                'user_id': user_id,
                'product_id': str(product_id)
            }).execute()
            
    return get_wishlist(db, user_id)
