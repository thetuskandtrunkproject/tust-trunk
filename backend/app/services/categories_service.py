import logging
from typing import Optional
from fastapi import HTTPException
from supabase import Client

from app.schemas.categories import CategoryCreate, CategoryUpdate

logger = logging.getLogger(__name__)

CATEGORIES_TABLE = 'categories'


def list_categories(db: Client) -> list:
    """Return all categories."""
    res = db.table(CATEGORIES_TABLE).select('*').order('name').execute()
    return res.data or []


def get_category(db: Client, category_id: str) -> dict:
    """Fetch a single category."""
    res = db.table(CATEGORIES_TABLE).select('*').eq('id', category_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail='Category not found')
    return res.data[0]


def _check_slug_unique(db: Client, slug: str, exclude_id: Optional[str] = None):
    q = db.table(CATEGORIES_TABLE).select('id').eq('slug', slug)
    if exclude_id:
        q = q.neq('id', exclude_id)
    res = q.execute()
    if res.data:
        raise HTTPException(status_code=409, detail=f"Category with slug '{slug}' already exists")


def _check_name_unique(db: Client, name: str, exclude_id: Optional[str] = None):
    q = db.table(CATEGORIES_TABLE).select('id').ilike('name', name)
    if exclude_id:
        q = q.neq('id', exclude_id)
    res = q.execute()
    if res.data:
        raise HTTPException(status_code=409, detail=f"Category with name '{name}' already exists")


def create_category(db: Client, data: CategoryCreate) -> dict:
    _check_slug_unique(db, data.slug)
    _check_name_unique(db, data.name)

    row = {
        'name': data.name,
        'slug': data.slug,
        'description': data.description,
        'gender': data.gender,
        'is_active': data.is_active,
    }
    try:
        res = db.table(CATEGORIES_TABLE).insert(row).execute()
    except Exception as e:
        logger.error(f'Failed to create category: {e}')
        raise HTTPException(status_code=500, detail='Failed to create category')
    
    if not res.data:
        raise HTTPException(status_code=500, detail='Failed to create category (no data returned)')
    
    return res.data[0]


def update_category(db: Client, category_id: str, data: CategoryUpdate) -> dict:
    get_category(db, category_id)  # Ensure it exists

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return get_category(db, category_id)
    
    if 'slug' in update_data:
        _check_slug_unique(db, update_data['slug'], exclude_id=category_id)
    if 'name' in update_data:
        _check_name_unique(db, update_data['name'], exclude_id=category_id)

    try:
        res = db.table(CATEGORIES_TABLE).update(update_data).eq('id', category_id).execute()
    except Exception as e:
        logger.error(f'Failed to update category {category_id}: {e}')
        raise HTTPException(status_code=500, detail='Failed to update category')
    
    if not res.data:
        raise HTTPException(status_code=404, detail='Category not found')
    
    return res.data[0]


def delete_category(db: Client, category_id: str) -> dict:
    # First check if any products are using it
    res_products = db.table('products').select('id', count='exact').eq('category_id', category_id).execute()
    if res_products.count and res_products.count > 0:
        raise HTTPException(status_code=400, detail='Cannot delete category: products are assigned to it')

    try:
        res = db.table(CATEGORIES_TABLE).delete().eq('id', category_id).execute()
    except Exception as e:
        logger.error(f'Failed to delete category {category_id}: {e}')
        raise HTTPException(status_code=500, detail='Failed to delete category')
    
    if not res.data:
        raise HTTPException(status_code=404, detail='Category not found')
    
    return res.data[0]
