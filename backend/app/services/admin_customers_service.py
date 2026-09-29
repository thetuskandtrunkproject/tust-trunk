import logging
from typing import List, Optional
from fastapi import HTTPException
from supabase import Client

logger = logging.getLogger(__name__)

def list_customers(db: Client) -> dict:
    """List all customers and their lifetime value aggregated from orders."""
    # Fetch all users where role = 'customer'
    users_res = db.table('users').select('*').eq('role', 'customer').execute()
    users = users_res.data or []
    
    # Fetch all orders to compute lifetime value for these users
    orders_res = db.table('orders').select('user_id, total_paise, created_at').execute()
    orders = orders_res.data or []
    
    agg: dict[str, dict] = {}
    for o in orders:
        uid = o.get('user_id')
        if not uid:
            continue
        if uid not in agg:
            agg[uid] = {'total_orders': 0, 'total_spent_paise': 0, 'last_order_date': None}
        agg[uid]['total_orders'] += 1
        agg[uid]['total_spent_paise'] += o.get('total_paise', 0)
        # Assuming created_at is returned as ISO string
        order_date = o.get('created_at')
        if order_date:
            if not agg[uid]['last_order_date'] or order_date > agg[uid]['last_order_date']:
                agg[uid]['last_order_date'] = order_date
        
    result = []
    for u in users:
        uid = u['id']
        u_agg = agg.get(uid, {'total_orders': 0, 'total_spent_paise': 0, 'last_order_date': None})
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
    
    # Sort by joined_date descending
    result.sort(key=lambda x: x['joined_date'], reverse=True)
    return {'items': result}

def get_customer_detail(db: Client, customer_id: str) -> dict:
    """Get specific customer details including addresses."""
    user_res = db.table('users').select('*').eq('id', customer_id).execute()
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
