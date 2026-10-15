import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException
from supabase import Client

logger = logging.getLogger(__name__)

COMBO_OFFERS_TABLE = 'combo_offers'
SITE_SETTINGS_TABLE = 'site_settings'
SITE_SETTINGS_COMBO_KEY = 'combo_offers'

def _is_table_not_found(e: Exception) -> bool:
    """Checks if error is PGRST205 (table not found in PostgREST schema cache)."""
    code = getattr(e, 'code', None)
    if code == 'PGRST205':
        return True
    if e.args and isinstance(e.args[0], dict) and e.args[0].get('code') == 'PGRST205':
        return True
    err_str = str(e)
    return "PGRST205" in err_str or "Could not find the table 'public.combo_offers'" in err_str

def _get_site_settings_offers(db: Client) -> List[dict]:
    try:
        res = db.table(SITE_SETTINGS_TABLE).select('value').eq('key', SITE_SETTINGS_COMBO_KEY).execute()
        if res.data and len(res.data) > 0:
            val = res.data[0].get('value')
            if isinstance(val, list):
                return val
        return []
    except Exception as e:
        logger.error(f"Failed to read combo offers from site_settings: {e}")
        return []

def _save_site_settings_offers(db: Client, offers: List[dict]) -> None:
    try:
        res = db.table(SITE_SETTINGS_TABLE).select('key').eq('key', SITE_SETTINGS_COMBO_KEY).execute()
        if res.data and len(res.data) > 0:
            db.table(SITE_SETTINGS_TABLE).update({'value': offers}).eq('key', SITE_SETTINGS_COMBO_KEY).execute()
        else:
            db.table(SITE_SETTINGS_TABLE).insert({'key': SITE_SETTINGS_COMBO_KEY, 'value': offers}).execute()
    except Exception as e:
        logger.error(f"Failed to save combo offers to site_settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to save combo offer configuration")

def _get_categories_map(db: Client) -> Dict[str, dict]:
    try:
        res = db.table('categories').select('id, name, slug').execute()
        return {str(cat['id']): cat for cat in (res.data or [])}
    except Exception as e:
        logger.error(f"Failed to fetch categories: {e}")
        return {}

def list_combo_offers(db: Client) -> List[dict]:
    """Fetch all combo offers with category details."""
    categories_map = _get_categories_map(db)
    
    try:
        res = db.table(COMBO_OFFERS_TABLE).select('*').order('created_at', desc=True).execute()
        offers = res.data or []
    except Exception as e:
        if _is_table_not_found(e):
            logger.info("combo_offers table not found in schema cache, using site_settings fallback")
            offers = _get_site_settings_offers(db)
        else:
            logger.error(f"Error fetching combo offers: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch combo offers")

    # Enrich with category details
    enriched = []
    for offer in offers:
        cat_id = str(offer.get('category_id'))
        cat = categories_map.get(cat_id)
        item = dict(offer)
        if cat:
            item['category_name'] = cat['name']
            item['category_slug'] = cat['slug']
        else:
            item['category_name'] = 'Unknown Category'
            item['category_slug'] = ''
        enriched.append(item)
    return enriched

def get_combo_offer(db: Client, offer_id: str) -> dict:
    """Fetch a single combo offer by ID."""
    categories_map = _get_categories_map(db)
    try:
        res = db.table(COMBO_OFFERS_TABLE).select('*').eq('id', offer_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Combo offer not found")
        offer = res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        if _is_table_not_found(e):
            offers = _get_site_settings_offers(db)
            offer = next((o for o in offers if str(o.get('id')) == str(offer_id)), None)
            if not offer:
                raise HTTPException(status_code=404, detail="Combo offer not found")
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch combo offer")

    cat_id = str(offer.get('category_id'))
    cat = categories_map.get(cat_id)
    result = dict(offer)
    if cat:
        result['category_name'] = cat['name']
        result['category_slug'] = cat['slug']
    return result

def create_combo_offer(db: Client, data: dict) -> dict:
    """Create a new combo offer."""
    categories_map = _get_categories_map(db)
    cat_id = str(data.get('category_id'))
    if cat_id not in categories_map:
        raise HTTPException(status_code=400, detail="Selected category does not exist")
    
    category = categories_map[cat_id]
    
    # Auto-generate title if missing
    if not data.get('title'):
        disc_text = f"₹{data['discount_value'] // 100} off/item" if data['discount_type'] == 'flat' else f"{data['discount_value']}% off"
        seq_text = data['sequence_type'].capitalize()
        data['title'] = f"{category['name']} Combo ({seq_text} from {data['min_quantity']}): {disc_text}"

    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        'id': str(uuid.uuid4()),
        'title': data.get('title'),
        'category_id': cat_id,
        'min_quantity': int(data['min_quantity']),
        'sequence_type': data['sequence_type'],
        'discount_type': data['discount_type'],
        'discount_value': int(data['discount_value']),
        'is_active': bool(data.get('is_active', True)),
        'created_at': now_iso,
        'updated_at': now_iso
    }

    try:
        res = db.table(COMBO_OFFERS_TABLE).insert(record).execute()
        created = res.data[0] if res.data else record
    except Exception as e:
        if _is_table_not_found(e):
            logger.info("combo_offers table not found, saving to site_settings")
            offers = _get_site_settings_offers(db)
            offers.insert(0, record)
            _save_site_settings_offers(db, offers)
            created = record
        else:
            logger.error(f"Failed to create combo offer: {e}")
            raise HTTPException(status_code=500, detail="Failed to create combo offer")

    created_dict = dict(created)
    created_dict['category_name'] = category['name']
    created_dict['category_slug'] = category['slug']
    return created_dict

def update_combo_offer(db: Client, offer_id: str, data: dict) -> dict:
    """Update an existing combo offer."""
    categories_map = _get_categories_map(db)
    if 'category_id' in data:
        cat_id = str(data['category_id'])
        if cat_id not in categories_map:
            raise HTTPException(status_code=400, detail="Selected category does not exist")

    now_iso = datetime.now(timezone.utc).isoformat()
    data['updated_at'] = now_iso

    try:
        res = db.table(COMBO_OFFERS_TABLE).update(data).eq('id', offer_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Combo offer not found")
        updated = res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        if _is_table_not_found(e):
            offers = _get_site_settings_offers(db)
            idx = next((i for i, o in enumerate(offers) if str(o.get('id')) == str(offer_id)), -1)
            if idx == -1:
                raise HTTPException(status_code=404, detail="Combo offer not found")
            offers[idx].update(data)
            _save_site_settings_offers(db, offers)
            updated = offers[idx]
        else:
            logger.error(f"Failed to update combo offer: {e}")
            raise HTTPException(status_code=500, detail="Failed to update combo offer")

    updated_dict = dict(updated)
    cat_id = str(updated_dict.get('category_id'))
    if cat_id in categories_map:
        updated_dict['category_name'] = categories_map[cat_id]['name']
        updated_dict['category_slug'] = categories_map[cat_id]['slug']
    return updated_dict

def delete_combo_offer(db: Client, offer_id: str) -> None:
    """Delete a combo offer."""
    try:
        res = db.table(COMBO_OFFERS_TABLE).delete().eq('id', offer_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Combo offer not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        if _is_table_not_found(e):
            offers = _get_site_settings_offers(db)
            filtered = [o for o in offers if str(o.get('id')) != str(offer_id)]
            if len(filtered) == len(offers):
                raise HTTPException(status_code=404, detail="Combo offer not found")
            _save_site_settings_offers(db, filtered)
        else:
            logger.error(f"Failed to delete combo offer: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete combo offer")

def get_active_combo_offers(db: Client) -> List[dict]:
    """Fetch all active combo offers."""
    all_offers = list_combo_offers(db)
    return [o for o in all_offers if o.get('is_active') is True]

def check_sequence_eligibility(quantity: int, min_quantity: int, sequence_type: str) -> bool:
    """
    Checks if a quantity satisfies the combo offer sequence:
    1. quantity >= min_quantity
    2. Parity matches sequence_type:
       - 'even': quantity % 2 == 0
       - 'odd':  quantity % 2 == 1
    """
    if quantity < min_quantity:
        return False
    if sequence_type == 'even':
        return (quantity % 2) == 0
    elif sequence_type == 'odd':
        return (quantity % 2) != 0
    return False

def calculate_next_eligible_quantity(quantity: int, min_quantity: int, sequence_type: str) -> int:
    """
    Calculates how many additional items are needed to reach the next eligible quantity.
    """
    if quantity < min_quantity:
        candidate = min_quantity
    else:
        candidate = quantity + 1

    # Find the next candidate with the right parity
    while True:
        if sequence_type == 'even' and (candidate % 2 == 0):
            break
        elif sequence_type == 'odd' and (candidate % 2 != 0):
            break
        candidate += 1

    return max(1, candidate - quantity)

def calculate_combo_discount_for_cart(db: Client, items: List[dict]) -> Tuple[int, List[dict], List[dict]]:
    """
    Computes automatic combo offer discounts for items currently in cart.
    Returns: (total_discount_paise, applied_offers, potential_offers)
    """
    active_offers = get_active_combo_offers(db)
    if not active_offers:
        return 0, [], []

    # Map offers by category_id (take the first active offer per category)
    offers_by_category: Dict[str, dict] = {}
    for offer in active_offers:
        cat_id = str(offer['category_id'])
        if cat_id not in offers_by_category:
            offers_by_category[cat_id] = offer

    # Group valid line items by category_id
    category_items: Dict[str, List[dict]] = {}
    for item in items:
        # Check availability
        if item.get('is_available') is False:
            continue
        qty = int(item.get('quantity', 0))
        if qty <= 0:
            continue
        
        # Extract category_id
        cat_id = None
        if item.get('category_id'):
            cat_id = str(item['category_id'])
        elif item.get('product') and isinstance(item['product'], dict) and item['product'].get('category_id'):
            cat_id = str(item['product']['category_id'])
        elif item.get('product_category_id'):
            cat_id = str(item['product_category_id'])

        if cat_id:
            if cat_id not in category_items:
                category_items[cat_id] = []
            category_items[cat_id].append(item)

    total_combo_discount_paise = 0
    applied_offers = []
    potential_offers = []

    for cat_id, cat_line_items in category_items.items():
        offer = offers_by_category.get(cat_id)
        if not offer:
            continue

        total_cat_qty = sum(int(i.get('quantity', 0)) for i in cat_line_items)
        cat_name = offer.get('category_name', 'Category')
        min_qty = int(offer['min_quantity'])
        seq_type = offer['sequence_type']
        disc_type = offer['discount_type']
        disc_val = int(offer['discount_value'])

        # Total price in paise for this category
        cat_total_paise = 0
        for i in cat_line_items:
            unit_price = int(i.get('price_paise') or (i.get('variant') or {}).get('price', 0))
            cat_total_paise += unit_price * int(i.get('quantity', 0))

        is_eligible = check_sequence_eligibility(total_cat_qty, min_qty, seq_type)

        if is_eligible:
            cat_discount_paise = 0
            if disc_type == 'flat':
                # Flat discount per product
                # For each product unit, discount is min(unit_price, flat_discount_per_product)
                for i in cat_line_items:
                    unit_price = int(i.get('price_paise') or (i.get('variant') or {}).get('price', 0))
                    item_qty = int(i.get('quantity', 0))
                    unit_disc = min(unit_price, disc_val)
                    cat_discount_paise += unit_disc * item_qty
            elif disc_type == 'percent':
                # Percentage discount across the category's total price
                cat_discount_paise = int(round(cat_total_paise * (disc_val / 100.0)))

            # Cap discount at category's total price
            cat_discount_paise = min(cat_discount_paise, cat_total_paise)
            total_combo_discount_paise += cat_discount_paise

            if disc_type == 'flat':
                disc_desc = f"₹{disc_val // 100} off per item"
            else:
                disc_desc = f"{disc_val}% off"

            applied_offers.append({
                'offer_id': str(offer['id']),
                'category_id': cat_id,
                'category_name': cat_name,
                'eligible_quantity': total_cat_qty,
                'sequence_type': seq_type,
                'discount_type': disc_type,
                'discount_value': disc_val,
                'discount_paise': cat_discount_paise,
                'description': f"Combo Offer ({disc_desc}) applied on {total_cat_qty} {cat_name} items",
            })
        else:
            # Not eligible yet: calculate needed quantity for encouragement
            needed = calculate_next_eligible_quantity(total_cat_qty, min_qty, seq_type)
            target = total_cat_qty + needed
            if disc_type == 'flat':
                benefit = f"₹{disc_val // 100} off per item"
            else:
                benefit = f"{disc_val}% off"
                
            msg = f"Add {needed} more {cat_name} item{'s' if needed > 1 else ''} to reach {target} and get {benefit}!"
            potential_offers.append({
                'category_id': cat_id,
                'category_name': cat_name,
                'current_quantity': total_cat_qty,
                'needed_quantity': needed,
                'target_quantity': target,
                'message': msg,
            })

    return total_combo_discount_paise, applied_offers, potential_offers
