import logging
from supabase import Client
from fastapi import HTTPException
from typing import Optional

logger = logging.getLogger(__name__)

def _map_errcode_to_http(e: Exception):
    code = None
    if hasattr(e, 'code'): code = e.code
    elif e.args and isinstance(e.args[0], dict): code = e.args[0].get('code')
    
    mapping = {
        'C1004': (404, "Order not found."),
        'C1005': (400, "Cannot transition from Delivered status."),
        'C1006': (400, "Invalid status transition."),
    }
    
    if code in mapping:
        http_status, detail = mapping[code]
        if code == 'C1006':
            msg = e.args[0].get('message') if hasattr(e, 'args') and isinstance(e.args[0], dict) else getattr(e, 'message', detail)
            raise HTTPException(status_code=http_status, detail=msg)
        raise HTTPException(status_code=http_status, detail=detail)
    raise HTTPException(status_code=500, detail="Internal server error updating order status.")

def _format_items(order_items):
    items_data = []
    for item in order_items:
        image_url = None
        pv = item.get('product_variants')
        if pv:
            p = pv.get('products')
            if p:
                imgs = p.get('images')
                if imgs and len(imgs) > 0:
                    image_url = imgs[0]
        
        items_data.append({
            "variant_id": item.get('variant_id'),
            "product_name_snapshot": item['product_name_snapshot'],
            "size_snapshot": item['size_snapshot'],
            "quantity": item['quantity'],
            "price_at_purchase": item['price_at_purchase'],
            "image_url": image_url
        })
    return items_data

def get_user_orders(db: Client, user_id: str) -> dict:
    res = (
        db.table('orders')
        .select('*, order_items(*, product_variants(products(images)))')
        .eq('user_id', user_id)
        .order('created_at', desc=True)
        .limit(50)
        .execute()
    )
    
    orders_data = []
    for order in res.data:
        items_data = _format_items(order.get('order_items', []))
        orders_data.append({
            "id": order['id'],
            "order_number": order['order_number'],
            "created_at": order['created_at'],
            "status": order['status'],
            "total_paise": order['total_paise'],
            "subtotal_paise": order['subtotal_paise'],
            "delivery_fee_paise": order['delivery_fee_paise'],
            "item_count": sum(i['quantity'] for i in items_data),
            "shipping_address": order['shipping_address'],
            "items": items_data
        })
    return {"orders": orders_data}

def get_user_order_detail(db: Client, user_id: str, order_id: str) -> dict:
    res = (
        db.table('orders')
        .select('*, order_items(*, product_variants(products(images)))')
        .eq('user_id', user_id)
        .eq('id', order_id)
        .execute()
    )
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = res.data[0]
    items_data = _format_items(order.get('order_items', []))
    
    return {
        "id": order['id'],
        "order_number": order['order_number'],
        "created_at": order['created_at'],
        "status": order['status'],
        "total_paise": order['total_paise'],
        "subtotal_paise": order['subtotal_paise'],
        "delivery_fee_paise": order['delivery_fee_paise'],
        "item_count": sum(i['quantity'] for i in items_data),
        "shipping_address": order['shipping_address'],
        "items": items_data
    }

def get_admin_orders(
    db: Client, 
    search: Optional[str] = None, 
    status: Optional[str] = None, 
    customer_id: Optional[str] = None, 
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1, 
    page_size: int = 25
) -> dict:
    query = db.table('orders').select('*, order_items(*, product_variants(products(images))), users(full_name, email, phone)', count='exact')
    
    if status:
        query = query.eq('status', status)
        
    if customer_id:
        query = query.eq('user_id', customer_id)
    
    if search:
        query = query.or_(f"order_number.ilike.%{search}%,guest_email.ilike.%{search}%,guest_phone.ilike.%{search}%")

    if start_date:
        query = query.gte('created_at', f"{start_date}T00:00:00Z")
        
    if end_date:
        query = query.lte('created_at', f"{end_date}T23:59:59.999Z")

    offset = (page - 1) * page_size
    res = query.order('created_at', desc=True).range(offset, offset + page_size - 1).execute()
    
    total_count = res.count if res.count is not None else 0
    orders_data = []
    
    for order in res.data:
        if order['status'] == 'Cancelled':
            payment_status = 'Refunded'
        elif order['status'] == 'requires_review':
            payment_status = 'Pending'
        elif order.get('razorpay_payment_id'):
            payment_status = 'Paid'
        else:
            payment_status = 'Pending'
            
        user_info = order.get('users') or {}
        customer_name = user_info.get('full_name') or order.get('shipping_address', {}).get('name', 'Unknown')
        customer_email = user_info.get('email') or order.get('guest_email') or ''
        customer_phone = user_info.get('phone') or order.get('guest_phone') or ''
        
        items_data = _format_items(order.get('order_items', []))
            
        orders_data.append({
            "id": order['id'],
            "order_number": order['order_number'],
            "customer_name": customer_name,
            "customer_email": customer_email,
            "customer_phone": customer_phone,
            "date": order['created_at'],
            "status": order['status'],
            "payment_status": payment_status,
            "payment_method": "Razorpay",
            "shipping_address": order['shipping_address'],
            "items": items_data,
            "subtotal_paise": order['subtotal_paise'],
            "delivery_fee_paise": order['delivery_fee_paise'],
            "total_paise": order['total_paise']
        })
        
    return {
        "orders": orders_data,
        "total_count": total_count,
        "page": page,
        "page_size": page_size
    }

def get_admin_order_detail(db: Client, order_id: str) -> dict:
    res = (
        db.table('orders')
        .select('*, order_items(*, product_variants(products(images))), users(full_name, email, phone)')
        .eq('id', order_id)
        .execute()
    )
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = res.data[0]
    
    if order['status'] == 'Cancelled':
        payment_status = 'Refunded'
    elif order['status'] == 'requires_review':
        payment_status = 'Pending'
    elif order.get('razorpay_payment_id'):
        payment_status = 'Paid'
    else:
        payment_status = 'Pending'
        
    user_info = order.get('users') or {}
    customer_name = user_info.get('full_name') or order.get('shipping_address', {}).get('name', 'Unknown')
    customer_email = user_info.get('email') or order.get('guest_email') or ''
    customer_phone = user_info.get('phone') or order.get('guest_phone') or ''
    
    items_data = _format_items(order.get('order_items', []))
    
    return {
        "id": order['id'],
        "order_number": order['order_number'],
        "customer_name": customer_name,
        "customer_email": customer_email,
        "customer_phone": customer_phone,
        "date": order['created_at'],
        "status": order['status'],
        "payment_status": payment_status,
        "payment_method": "Razorpay",
        "shipping_address": order['shipping_address'],
        "items": items_data,
        "subtotal_paise": order['subtotal_paise'],
        "delivery_fee_paise": order['delivery_fee_paise'],
        "total_paise": order['total_paise']
    }

def update_admin_order_status(db: Client, order_id: str, new_status: str) -> dict:
    try:
        db.rpc('update_order_status', {
            'p_order_id': order_id,
            'p_new_status': new_status
        }).execute()
        return {"status": "success", "new_status": new_status}
    except Exception as e:
        _map_errcode_to_http(e)
