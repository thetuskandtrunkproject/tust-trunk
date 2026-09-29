import { ArrowUpDown, Mail } from 'lucide-react'
import type { AdminOrder } from '@/lib/admin/mock-orders'
import { OrderStatusBadge } from './order-status-badge'

interface OrderTableProps {
  orders: AdminOrder[]
  onSelectOrder: (order: AdminOrder) => void
}

export function OrderTable({ orders, onSelectOrder }: OrderTableProps) {
  
  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  // Desktop View
  const DesktopTable = () => (
    <div className="hidden lg:block bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cloud border-b border-ink/10 text-xs font-medium text-ink/60 uppercase tracking-wider">
              <th className="px-6 py-4 cursor-pointer hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-2">Order # <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
              </th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-2">Date <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
              </th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-2">Total <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div>
              </th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Payment</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order) => (
              <tr 
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="border-b border-ink/5 hover:bg-ink/[0.02] cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-ink">{order.order_number}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{order.customer_name}</span>
                    <span className="text-xs text-ink/50">{order.customer_email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-ink/70">{formatDate(order.date)}</td>
                <td className="px-6 py-4 text-ink/70">{order.items.length}</td>
                <td className="px-6 py-4 font-medium text-ink">{formatPrice(order.total_paise / 100)}</td>
                <td className="px-6 py-4">
                  <OrderStatusBadge type="order" status={order.status} />
                </td>
                <td className="px-6 py-4">
                  <OrderStatusBadge type="payment" status={order.payment_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <div className="p-12 text-center text-ink/50">No orders found matching your criteria.</div>
      )}
    </div>
  )

  // Mobile View
  const MobileList = () => (
    <div className="lg:hidden flex flex-col gap-4">
      {orders.map((order: any) => (
        <div 
          key={order.id} 
          onClick={() => onSelectOrder(order)}
          className="bg-white border border-ink/10 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium text-ink mb-1">{order.order_number}</p>
              <p className="text-xs text-ink/50">{formatDate(order.date)}</p>
            </div>
            <p className="font-semibold text-ink">{formatPrice(order.total_paise / 100)}</p>
          </div>
          
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-sm font-medium text-ink">{order.customer_name}</span>
            <span className="text-xs text-ink/60 flex items-center gap-1"><Mail className="w-3 h-3" /> {order.customer_email}</span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-ink/5">
            <span className="text-xs text-ink/60">{order.items.length} items</span>
            <div className="flex gap-2">
              <OrderStatusBadge type="payment" status={order.payment_status} />
              <OrderStatusBadge type="order" status={order.status} />
            </div>
          </div>
        </div>
      ))}
      
      {orders.length === 0 && (
        <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-ink/50">
          No orders found matching your criteria.
        </div>
      )}
    </div>
  )

  return (
    <>
      <DesktopTable />
      <MobileList />
    </>
  )
}
