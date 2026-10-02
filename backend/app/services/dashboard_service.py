import logging
from datetime import datetime, timedelta, timezone
from supabase import Client
from fastapi import HTTPException

logger = logging.getLogger(__name__)

LOW_STOCK_THRESHOLD = 5

def _get_time_ago_str(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    diff = now - dt
    if diff.total_seconds() < 60:
        return "Just now"
    if diff.total_seconds() < 3600:
        mins = int(diff.total_seconds() / 60)
        return f"{mins} min{'s' if mins != 1 else ''} ago"
    if diff.total_seconds() < 86400:
        hrs = int(diff.total_seconds() / 3600)
        return f"{hrs} hour{'s' if hrs != 1 else ''} ago"
    days = int(diff.total_seconds() / 86400)
    return f"{days} day{'s' if days != 1 else ''} ago"

def get_dashboard_metrics(db: Client, time_range: str = '30d', start_date_str: str = None, end_date_str: str = None) -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    
    # Determine boundaries
    if start_date_str and end_date_str:
        # Custom date range
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        if end_date < start_date:
            end_date = start_date # Failsafe
        days_lookback = (end_date - start_date).days + 1
    else:
        # Predefined ranges
        days_lookback = 30
        if time_range in ('1d', 'day'): days_lookback = 1
        elif time_range in ('7d', 'week'): days_lookback = 7
        elif time_range in ('30d', 'month'): days_lookback = 30
        elif time_range in ('1y', 'year'): days_lookback = 365
        
        start_date = today_start - timedelta(days=days_lookback - 1)
        end_date = today_start
    
    end_date_inclusive = end_date + timedelta(days=1)
    
    # Calculate previous period boundaries
    prev_start_date = start_date - timedelta(days=days_lookback)
    prev_end_date_inclusive = start_date
    
    # 1. Previous Period Revenue
    res_prev = (
        db.table('orders')
        .select('total_paise')
        .gte('created_at', prev_start_date.isoformat())
        .lt('created_at', prev_end_date_inclusive.isoformat())
        .neq('status', 'Cancelled')
        .neq('status', 'requires_review')
        .execute()
    )
    
    previous_period_revenue = sum(o['total_paise'] for o in res_prev.data)

    # 2. Today, Week, Month, Year Time Breakdown Revenues
    today_iso = today_start.isoformat()
    week_iso = (today_start - timedelta(days=6)).isoformat()
    month_iso = (today_start - timedelta(days=29)).isoformat()
    year_iso = (today_start - timedelta(days=364)).isoformat()

    res_all_time = (
        db.table('orders')
        .select('created_at, total_paise')
        .gte('created_at', year_iso)
        .neq('status', 'Cancelled')
        .neq('status', 'requires_review')
        .execute()
    )

    today_revenue = 0
    week_revenue = 0
    month_revenue = 0
    year_revenue = 0

    for o in res_all_time.data:
        paise = o['total_paise']
        c_at = o['created_at']
        year_revenue += paise
        if c_at >= month_iso:
            month_revenue += paise
        if c_at >= week_iso:
            week_revenue += paise
        if c_at >= today_iso:
            today_revenue += paise

    # 3. Pending Orders
    res_pending = (
        db.table('orders')
        .select('id', count='exact')
        .eq('status', 'Processing')
        .execute()
    )
    pending_orders = res_pending.count if res_pending.count is not None else 0

    # 4. Low Stock Count
    res_low_stock = (
        db.table('product_variants')
        .select('id', count='exact')
        .gt('stock', 0)
        .lt('stock', LOW_STOCK_THRESHOLD)
        .eq('is_active', True)
        .execute()
    )
    low_stock_count = res_low_stock.count if res_low_stock.count is not None else 0

    res_chart = (
        db.table('orders')
        .select('created_at, total_paise, order_items(quantity, price_at_purchase, product_name_snapshot, variant_id, product_variants(products(id, images)))')
        .gte('created_at', start_date.isoformat())
        .lt('created_at', end_date_inclusive.isoformat())
        .neq('status', 'Cancelled')
        .neq('status', 'requires_review')
        .execute()
    )
    
    # Initialize empty buckets for every day to ensure continuous chart
    revenue_by_date = {}
    for i in range(days_lookback):
        d = (start_date + timedelta(days=i)).strftime('%b %d').replace(' 0', ' ') # e.g. "Sep 15"
        revenue_by_date[d] = 0
        
    products_agg = {}
    
    period_revenue = 0
    total_orders = len(res_chart.data)
            
    for order in res_chart.data:
        period_revenue += order['total_paise']
        # Accumulate revenue by date
        dt = datetime.fromisoformat(order['created_at'].replace('Z', '+00:00'))
        date_label = dt.strftime('%b %d').replace(' 0', ' ')
        if date_label in revenue_by_date:
            revenue_by_date[date_label] += order['total_paise']
            
        # Accumulate top products
        for item in order.get('order_items', []):
            vid = item.get('variant_id')
            if not vid:
                continue # Hard-deleted variant, skip per OQ-2
                
            pv = item.get('product_variants') or {}
            p = pv.get('products') or {}
            product_id = p.get('id')
            
            if not product_id:
                continue # Should not happen if variant exists, but safe fallback
                
            name = item['product_name_snapshot']
            images = p.get('images', [])
            image_url = images[0] if images else ""
            
            if product_id not in products_agg:
                products_agg[product_id] = {
                    "id": product_id,
                    "name": name,
                    "unitsSold": 0,
                    "revenue": 0,
                    "image": image_url
                }
            
            products_agg[product_id]["unitsSold"] += item['quantity']
            products_agg[product_id]["revenue"] += (item['quantity'] * item['price_at_purchase'])
            
    revenue_data = [{"date": k, "revenue": v} for k, v in revenue_by_date.items()]
    top_products = sorted(products_agg.values(), key=lambda x: x['revenue'], reverse=True)[:5]
    
    avg_daily_revenue = period_revenue // days_lookback if days_lookback > 0 else 0
    avg_order_value = period_revenue // total_orders if total_orders > 0 else 0
    
    # 6. Recent Activity Feed (Synthesized)
    res_orders = (
        db.table('orders')
        .select('order_number, status, created_at')
        .order('created_at', desc=True)
        .limit(5)
        .execute()
    )
    
    res_users = (
        db.table('users')
        .select('full_name, email, created_at')
        .order('created_at', desc=True)
        .limit(5)
        .execute()
    )
    
    activities = []
    for o in res_orders.data:
        if o['status'] == 'Processing':
            msg = f"New order #{o['order_number']} placed"
            act_type = "order"
        else:
            msg = f"Order #{o['order_number']} status updated to {o['status']}"
            act_type = "shipping" if o['status'] in ['Shipped', 'Out for Delivery', 'Delivered'] else "order"
            
        dt = datetime.fromisoformat(o['created_at'].replace('Z', '+00:00'))
        activities.append({
            "type": act_type,
            "message": msg,
            "timestamp": dt
        })
        
    for u in res_users.data:
        name = u['full_name'] or u['email']
        dt = datetime.fromisoformat(u['created_at'].replace('Z', '+00:00'))
        activities.append({
            "type": "customer",
            "message": f"New customer account created: {name}",
            "timestamp": dt
        })
        
    # Sort descending by timestamp and take top 5
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    recent_activity = []
    for i, act in enumerate(activities[:5]):
        recent_activity.append({
            "id": i + 1,
            "type": act["type"],
            "message": act["message"],
            "time": _get_time_ago_str(act["timestamp"])
        })
        
    return {
        "periodRevenue": period_revenue,
        "previousPeriodRevenue": previous_period_revenue,
        "avgDailyRevenue": avg_daily_revenue,
        "totalOrders": total_orders,
        "avgOrderValue": avg_order_value,
        "todayRevenue": today_revenue,
        "weekRevenue": week_revenue,
        "monthRevenue": month_revenue,
        "yearRevenue": year_revenue,
        "pendingOrders": pending_orders,
        "lowStockCount": low_stock_count,
        "revenueData": revenue_data,
        "topProducts": top_products,
        "recentActivity": recent_activity
    }

def update_variant_stock(db: Client, variant_id: str, new_stock: int) -> dict:
    res = (
        db.table('product_variants')
        .update({'stock': new_stock})
        .eq('id', variant_id)
        .execute()
    )
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Variant not found")
        
    return {"status": "success", "stock": new_stock}
