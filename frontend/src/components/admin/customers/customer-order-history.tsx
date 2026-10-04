import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { AdminOrder } from '@/lib/admin/mock-orders'
import { OrderStatusBadge } from '@/components/admin/orders/order-status-badge'

interface CustomerOrderHistoryProps {
  orders: AdminOrder[]
}

export function CustomerOrderHistory({ orders }: CustomerOrderHistoryProps) {
  const formatPrice = (price?: number) => (price ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-ink/10 rounded-2xl p-8 text-center shadow-sm">
        <p className="text-ink/60">This customer hasn't placed any orders yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cloud border-b border-ink/10 text-xs font-medium text-ink/60 uppercase tracking-wider">
              <th className="px-6 py-4">Order Number</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Items</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map(order => (
              <tr 
                key={order.id} 
                className="border-b border-ink/5 hover:bg-ink/[0.02] transition-colors group"
              >
                <td className="px-6 py-4">
                  <Link 
                    to="/admin/orders" 
                    search={{ search: order.order_number }} 
                    className="font-medium text-ink group-hover:text-sky transition-colors"
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-6 py-4 text-ink/70">
                  {formatDate(order.date)}
                </td>
                <td className="px-6 py-4">
                  <OrderStatusBadge type="order" status={order.status} />
                </td>
                <td className="px-6 py-4 text-right text-ink/70">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-ink">
                  {formatPrice(order.total_paise / 100)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to="/admin/orders" 
                    search={{ search: order.order_number }} 
                    className="p-2 text-ink/40 hover:text-ink transition-colors inline-flex"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

