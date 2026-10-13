import logging
from supabase import Client
from fastapi import HTTPException
from typing import Optional

logger = logging.getLogger(__name__)

def _format_order_number(order_number: str) -> str:
    if not order_number:
        return 'ORD-TT-001'
    if order_number.startswith('ORD-TT-'):
        return order_number
    import re
    nums = re.findall(r'\d+', order_number)
    if nums:
        seq_str = nums[1] if len(nums) >= 2 else nums[0]
        try:
            val = int(seq_str)
            return f"ORD-TT-{val:03d}"
        except ValueError:
            pass
    return order_number

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
    # Limit to 20 most recent orders. Select only needed fields — not order(*) + products(*).
    # The account orders page shows status, total, and a thumbnail; no need for all columns.
    res = (
        db.table('orders')
        .select('id, order_number, created_at, status, total_paise, subtotal_paise, '
                'delivery_fee_paise, shipping_address, '
                'order_items(variant_id, product_name_snapshot, size_snapshot, quantity, '
                'price_at_purchase, product_variants(products(id, images)))')
        .eq('user_id', user_id)
        .order('created_at', desc=True)
        .limit(20)
        .execute()
    )
    
    orders_data = []
    for order in res.data:
        items_data = _format_items(order.get('order_items', []))
        orders_data.append({
            "id": order['id'],
            "order_number": _format_order_number(order['order_number']),
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
        "order_number": _format_order_number(order['order_number']),
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
    # Select only needed columns. order_items only needs thumbnail — images sliced to 1 in _format_items.
    query = db.table('orders').select(
        'id, order_number, created_at, status, razorpay_payment_id, total_paise, '
        'subtotal_paise, delivery_fee_paise, shipping_address, guest_email, guest_phone, discount_paise, coupon_code, '
        'order_items(variant_id, product_name_snapshot, size_snapshot, quantity, '
        'price_at_purchase, product_variants(products(id, images))), '
        'users(full_name, email, phone)',
        count='exact'
    )
    
    if status:
        query = query.eq('status', status)
        
    if customer_id:
        if customer_id.startswith('guest:'):
            guest_email = customer_id.replace('guest:', '')
            query = query.eq('guest_email', guest_email)
        else:
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
            "order_number": _format_order_number(order['order_number']),
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
            "discount_paise": order.get('discount_paise') or 0,
            "gst_paise": max(0, (order.get('total_paise') or 0) - ((order.get('subtotal_paise') or 0) + (order.get('delivery_fee_paise') or 0) - (order.get('discount_paise') or 0))),
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
        .select(
            'id, order_number, created_at, status, razorpay_payment_id, total_paise, '
            'subtotal_paise, delivery_fee_paise, shipping_address, guest_email, guest_phone, '
            'order_items(variant_id, product_name_snapshot, size_snapshot, quantity, '
            'price_at_purchase, product_variants(products(id, images))), '
            'users(full_name, email, phone)'
        )
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
        "order_number": _format_order_number(order['order_number']),
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
from app.services import payperwa_service

def update_admin_order_status(db: Client, order_id: str, new_status: str, tracking_number: str | None = None) -> dict:
    try:
        db.rpc('update_order_status', {
            'p_order_id': order_id,
            'p_new_status': new_status
        }).execute()
        
        # If tracking_number was provided, save it into shipping_address JSON
        if tracking_number:
            try:
                order_res = db.table('orders').select('shipping_address').eq('id', order_id).execute()
                if order_res.data:
                    addr = order_res.data[0].get('shipping_address') or {}
                    addr['tracking_number'] = tracking_number.strip()
                    addr['carrier'] = 'ST Courier'
                    db.table('orders').update({'shipping_address': addr}).eq('id', order_id).execute()
            except Exception as e:
                logger.error(f"Failed to update tracking_number on order {order_id}: {e}")

        # Send WhatsApp status update
        try:
            order_details_res = db.table('orders').select('order_number, guest_phone, shipping_address, users(full_name, phone)').eq('id', order_id).execute()
            items_res = db.table('order_items').select('product_name_snapshot, size_snapshot, quantity').eq('order_id', order_id).execute()
            items_list = [f"{item['product_name_snapshot']} ({item.get('size_snapshot', '')}) x {item['quantity']}" for item in (items_res.data or [])]
            items_summary = ", ".join(items_list) if items_list else "Order Items"
            if len(items_summary) > 100:
                items_summary = items_summary[:97] + "..."

            if order_details_res.data:
                order_info = order_details_res.data[0]
                phone = order_info.get('guest_phone') or (order_info.get('users') or {}).get('phone') or ""
                name = (order_info.get('shipping_address') or {}).get('name') or (order_info.get('users') or {}).get('full_name') or "Customer"
                order_num = order_info['order_number']
                
                if phone:
                    if len(phone) == 10:
                        phone = f"+91{phone}"
                    elif phone.startswith("91") and len(phone) == 12:
                        phone = f"+{phone}"
                    
                    if new_status == 'Shipped':
                        final_tracking = tracking_number or (order_info.get('shipping_address') or {}).get('tracking_number') or "ST Courier"
                        payperwa_service.send_order_shipped(phone, name, order_num, items_summary, final_tracking)
        except Exception as e:
            logger.error(f"Failed to send PayPerWA status update for order {order_id}: {e}")
            
        return {"status": "success", "new_status": new_status, "tracking_number": tracking_number}
    except Exception as e:
        _map_errcode_to_http(e)
