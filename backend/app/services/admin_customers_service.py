import logging
from typing import List, Optional
from fastapi import HTTPException
from supabase import Client

logger = logging.getLogger(__name__)

def list_customers(db: Client, page: int = 1, page_size: int = 50) -> dict:
    """List customers (registered + guests) with lifetime value, paginated."""
    # Previously fetched ALL users and ALL orders with no limit.
    # Now we fetch only the fields we use, and paginate users.
    users_res = db.table('users').select('id, full_name, email, phone, created_at, role').execute()
    users = users_res.data or []

    # Fetch only the order fields needed for aggregation
    orders_res = db.table('orders').select(
        'user_id, total_paise, created_at, guest_email, guest_phone, shipping_address'
    ).execute()
    orders = orders_res.data or []
    
    agg: dict[str, dict] = {}
    for o in orders:
        uid = o.get('user_id')
        is_guest = False
        if not uid:
            guest_email = o.get('guest_email')
            if not guest_email:
                continue
            uid = f"guest:{guest_email.lower()}"
            is_guest = True
            
        if uid not in agg:
            name = 'Unknown'
            phone = None
            if is_guest:
                shipping = o.get('shipping_address') or {}
                name = shipping.get('name') or 'Unknown'
                phone = o.get('guest_phone')
                
            agg[uid] = {
                'total_orders': 0, 
                'total_spent_paise': 0, 
                'last_order_date': None,
                'is_guest': is_guest,
                'name': name,
                'email': o.get('guest_email') if is_guest else None,
                'phone': phone,
                'first_order_date': o.get('created_at')
            }
            
        agg[uid]['total_orders'] += 1
        agg[uid]['total_spent_paise'] += o.get('total_paise', 0)
        # Assuming created_at is returned as ISO string
        order_date = o.get('created_at')
        if order_date:
            if not agg[uid]['last_order_date'] or order_date > agg[uid]['last_order_date']:
                agg[uid]['last_order_date'] = order_date
            if not agg[uid]['first_order_date'] or order_date < agg[uid]['first_order_date']:
                agg[uid]['first_order_date'] = order_date
        
    result = []
    
    # Add registered users
    for u in users:
        uid = u['id']
        u_agg = agg.get(uid, {'total_orders': 0, 'total_spent_paise': 0, 'last_order_date': None})
        
        # Only show customers, OR admins who have actually placed an order
        if u.get('role') != 'customer' and u_agg['total_orders'] == 0:
            continue
            
        result.append({
            'id': uid,
            'name': u.get('full_name') or 'Unknown',
            'email': u.get('email'),
            'phone': u.get('phone'),
            'joined_date': u.get('created_at'),
            'total_spent_paise': u_agg['total_spent_paise'],
            'total_orders': u_agg['total_orders'],
            'last_order_date': u_agg['last_order_date']
        })
        # Remove from agg so we can process guests next
        if uid in agg:
            del agg[uid]
            
    # Add guest users that only exist in orders
    for uid, g_agg in agg.items():
        if g_agg.get('is_guest'):
            result.append({
                'id': uid,
                'name': f"{g_agg['name']} (Guest)",
                'email': g_agg['email'],
                'phone': g_agg['phone'],
                'joined_date': g_agg['first_order_date'],
                'total_spent_paise': g_agg['total_spent_paise'],
                'total_orders': g_agg['total_orders'],
                'last_order_date': g_agg['last_order_date']
            })
    
    # Sort by joined_date descending, handling None gracefully
    result.sort(key=lambda x: x['joined_date'] or '', reverse=True)
    return {'items': result}

def get_customer_detail(db: Client, customer_id: str) -> dict:
    """Get specific customer details including addresses."""
    is_guest = customer_id.startswith('guest:')
    
    if is_guest:
        guest_email = customer_id.replace('guest:', '')
        # Compute aggregate value for guest
        orders_res = db.table('orders').select('total_paise, guest_phone, created_at, shipping_address').eq('guest_email', guest_email).execute()
        orders = orders_res.data or []
        if not orders:
            raise HTTPException(status_code=404, detail="Guest customer not found")
            
        total_orders = len(orders)
        total_spent_paise = sum(o.get('total_paise', 0) for o in orders)
        
        # Sort to get earliest and latest details
        orders.sort(key=lambda x: x.get('created_at') or '')
        first_order = orders[0]
        
        shipping = first_order.get('shipping_address') or {}
        name = shipping.get('name') or 'Unknown'
        
        return {
            'id': customer_id,
            'name': f"{name} (Guest)",
            'email': guest_email,
            'phone': first_order.get('guest_phone'),
            'joined_date': first_order.get('created_at'),
            'total_spent_paise': total_spent_paise,
            'total_orders': total_orders,
            'addresses': []
        }
    
    # Registered User Logic — select only needed fields, not users(*)
    user_res = db.table('users').select(
        'id, full_name, email, phone, created_at, role'
    ).eq('id', customer_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    user = user_res.data[0]
    
    # Compute aggregate value
    orders_res = db.table('orders').select('total_paise').eq('user_id', customer_id).execute()
    orders = orders_res.data or []
    total_orders = len(orders)
    total_spent_paise = sum(o.get('total_paise', 0) for o in orders)
    
    # Fetch addresses
    addr_res = db.table('addresses').select('*').eq('user_id', customer_id).execute()
    addresses = addr_res.data or []
    
    return {
        'id': user['id'],
        'name': user.get('full_name') or 'Unknown',
        'email': user.get('email'),
        'phone': user.get('phone'),
        'joined_date': user.get('created_at'),
        'total_spent_paise': total_spent_paise,
        'total_orders': total_orders,
        'addresses': addresses
    }
