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
        data['title'] = f"{category['name']} Combo (Table of {data['min_quantity']}): {disc_text}"

    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        'id': str(uuid.uuid4()),
        'title': data.get('title'),
        'category_id': cat_id,
        'min_quantity': int(data['min_quantity']),
        'sequence_type': data.get('sequence_type') or 'multiple',
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
        err_msg = str(e).lower()
        if "sequence_type" in err_msg or "check constraint" in err_msg or "violates check" in err_msg:
            logger.warning("DB check constraint hit on sequence_type; retrying insert with legacy 'even': %s", e)
            fallback_rec = dict(record)
            fallback_rec['sequence_type'] = 'even'
            try:
                res = db.table(COMBO_OFFERS_TABLE).insert(fallback_rec).execute()
                created = res.data[0] if res.data else fallback_rec
            except Exception as e2:
                if _is_table_not_found(e2):
                    offers = _get_site_settings_offers(db)
                    offers.insert(0, record)
                    _save_site_settings_offers(db, offers)
                    created = record
                else:
                    logger.error(f"Failed to create combo offer after fallback: {e2}")
                    raise HTTPException(status_code=500, detail="Failed to create combo offer")
        elif _is_table_not_found(e):
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
        err_msg = str(e).lower()
        if ("sequence_type" in err_msg or "check constraint" in err_msg or "violates check" in err_msg) and 'sequence_type' in data:
            fallback_data = dict(data)
            fallback_data['sequence_type'] = 'even'
            try:
                res = db.table(COMBO_OFFERS_TABLE).update(fallback_data).eq('id', offer_id).execute()
                if not res.data:
                    raise HTTPException(status_code=404, detail="Combo offer not found")
                updated = res.data[0]
            except Exception as e2:
                if isinstance(e2, HTTPException):
                    raise e2
                if _is_table_not_found(e2):
                    offers = _get_site_settings_offers(db)
                    idx = next((i for i, o in enumerate(offers) if str(o.get('id')) == str(offer_id)), -1)
                    if idx == -1:
                        raise HTTPException(status_code=404, detail="Combo offer not found")
                    offers[idx].update(data)
                    _save_site_settings_offers(db, offers)
                    updated = offers[idx]
                else:
                    logger.error(f"Failed to update combo offer after fallback: {e2}")
                    raise HTTPException(status_code=500, detail="Failed to update combo offer")
        elif _is_table_not_found(e):
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

def get_eligible_quantity(quantity: int, min_quantity: int, sequence_type: str = 'multiple') -> int:
    """
    Given total products in a category, returns how many of them qualify for the combo discount.
    Rules:
    - Combo applies in full bundle multiples of min_quantity (Table Sequence):
      e.g. min 4 (4th table sequence: 4, 8, 12, 16, 20...):
        qty 1-3  -> 0 (below min bundle)
        qty 4    -> 4 (all 4 at combo price: 1 bundle)
        qty 5-7  -> 4 (4 at combo price, 1-3 items at regular price)
        qty 8    -> 8 (all 8 at combo price: 2 bundles)
        qty 9-11 -> 8 (8 at combo price, 1-3 items at regular price)
        qty 12   -> 12 (all 12 at combo price: 3 bundles)
    """
    if quantity < min_quantity or min_quantity <= 0:
        return 0
    return (quantity // min_quantity) * min_quantity

def check_sequence_eligibility(quantity: int, min_quantity: int, sequence_type: str = 'multiple') -> bool:
    """Helper to check if all items in quantity are fully aligned with the sequence."""
    return quantity >= min_quantity and min_quantity > 0 and (quantity % min_quantity == 0)

def calculate_next_target(quantity: int, min_quantity: int, sequence_type: str = 'multiple') -> Tuple[int, int]:
    """
    Calculates the next higher target quantity in the table sequence and how many more items are needed.
    Returns: (needed_quantity, target_quantity)
    """
    if min_quantity <= 0:
        min_quantity = 1
    if quantity < min_quantity:
        target = min_quantity
        needed = min_quantity - quantity
    else:
        bundles = quantity // min_quantity
        target = (bundles + 1) * min_quantity
        needed = target - quantity
    return max(1, needed), target

def calculate_next_eligible_quantity(quantity: int, min_quantity: int, sequence_type: str = 'multiple') -> int:
    """Returns how many more items are needed to reach the next sequence threshold."""
    needed, _ = calculate_next_target(quantity, min_quantity, sequence_type)
    return needed

def calculate_combo_discount_for_cart(db: Client, items: List[dict]) -> Tuple[int, List[dict], List[dict]]:
    """
    Computes automatic combo offer discounts for items currently in cart.
    Applies combo price to the eligible sequence items (e.g. 4 out of 5),
    leaving the remaining items at their original price.
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

        eligible_qty = get_eligible_quantity(total_cat_qty, min_qty, seq_type)

        if eligible_qty > 0:
            # Flatten individual units from this category
            units: List[int] = []
            for i in cat_line_items:
                unit_price = int(i.get('price_paise') or (i.get('variant') or {}).get('price', 0))
                item_qty = int(i.get('quantity', 0))
                for _ in range(item_qty):
                    units.append(unit_price)

            # Sort descending to give customer discount against top eligible units
            units.sort(reverse=True)
            eligible_units = units[:eligible_qty]

            cat_discount_paise = 0
            if disc_type == 'flat':
                for unit_p in eligible_units:
                    cat_discount_paise += min(unit_p, disc_val)
            elif disc_type == 'percent':
                eligible_total_paise = sum(eligible_units)
                cat_discount_paise = int(round(eligible_total_paise * (disc_val / 100.0)))

            # Cap discount at category's total price
            cat_discount_paise = min(cat_discount_paise, cat_total_paise)
            total_combo_discount_paise += cat_discount_paise

            if disc_type == 'flat':
                disc_desc = f"₹{disc_val // 100} off per item"
            else:
                disc_desc = f"{disc_val}% off"

            extra_qty = total_cat_qty - eligible_qty
            bundles_count = eligible_qty // min_qty
            bundle_label = "bundle" if bundles_count == 1 else "bundles"
            if extra_qty > 0:
                item_word = "item" if extra_qty == 1 else "items"
                desc = f"Combo Offer ({disc_desc}) applied to {eligible_qty} of {total_cat_qty} {cat_name} items ({bundles_count} {bundle_label}, + {extra_qty} {item_word} at regular price)"
            else:
                desc = f"Combo Offer ({disc_desc}) applied on {eligible_qty} {cat_name} items ({bundles_count} {bundle_label})"

            applied_offers.append({
                'offer_id': str(offer['id']),
                'category_id': cat_id,
                'category_name': cat_name,
                'eligible_quantity': eligible_qty,
                'total_quantity': total_cat_qty,
                'remaining_quantity': extra_qty,
                'sequence_type': seq_type,
                'discount_type': disc_type,
                'discount_value': disc_val,
                'discount_paise': cat_discount_paise,
                'description': desc,
            })

            # Calculate next tier encouragement
            needed, target = calculate_next_target(total_cat_qty, min_qty, seq_type)
            next_bundles = target // min_qty
            if disc_type == 'flat':
                benefit = f"₹{disc_val // 100} off per item"
            else:
                benefit = f"{disc_val}% off"
            msg = f"Add {needed} more {cat_name} item{'s' if needed > 1 else ''} to complete {next_bundles} combo bundles ({target} items) and get {benefit}!"
            potential_offers.append({
                'category_id': cat_id,
                'category_name': cat_name,
                'current_quantity': total_cat_qty,
                'needed_quantity': needed,
                'target_quantity': target,
                'message': msg,
            })
        else:
            # Below minimum threshold: calculate needed quantity for initial activation
            needed, target = calculate_next_target(total_cat_qty, min_qty, seq_type)
            if disc_type == 'flat':
                benefit = f"₹{disc_val // 100} off per item"
            else:
                benefit = f"{disc_val}% off"

            msg = f"Add {needed} more {cat_name} item{'s' if needed > 1 else ''} to reach {target} items (bundle of {target}) and unlock {benefit}!"
            potential_offers.append({
                'category_id': cat_id,
                'category_name': cat_name,
                'current_quantity': total_cat_qty,
                'needed_quantity': needed,
                'target_quantity': target,
                'message': msg,
            })

    return total_combo_discount_paise, applied_offers, potential_offers
