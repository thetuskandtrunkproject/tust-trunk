import { ArrowUpDown, Mail, Trash2, Printer } from 'lucide-react'
import type { AdminOrder } from '@/lib/admin/mock-orders'
import { StatusBadge, AdminTableShell, AdminTh, AdminTd } from '@/components/admin/ui/primitives'

interface OrderTableProps {
  orders: AdminOrder[]
  selectedOrderIds: string[]
  onToggleSelectOrder: (orderId: string) => void
  onToggleSelectAll: () => void
  onSelectOrder: (order: AdminOrder) => void
  onDeleteSingle: (order: AdminOrder) => void
  onPrintSingle: (order: AdminOrder) => void
}

export function OrderTable({
  orders,
  selectedOrderIds,
  onToggleSelectOrder,
  onToggleSelectAll,
  onSelectOrder,
  onDeleteSingle,
  onPrintSingle,
}: OrderTableProps) {
  const isAllSelected = orders.length > 0 && selectedOrderIds.length === orders.length
  const isPartiallySelected = selectedOrderIds.length > 0 && selectedOrderIds.length < orders.length

  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Desktop View
  const DesktopTable = () => (
    <div className="hidden lg:block">
      <AdminTableShell isEmpty={orders.length === 0} emptyMessage="No orders found matching your criteria.">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cloud/50 border-b border-ink/10">
              <th className="py-3 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all orders"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartiallySelected
                  }}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-ink/20 text-cta focus:ring-cta/30 cursor-pointer accent-cta"
                />
              </th>
              <AdminTh className="cursor-pointer hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-2">
                  Order # <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </div>
              </AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh className="cursor-pointer hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-2">
                  Date <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </div>
              </AdminTh>
              <AdminTh>Items</AdminTh>
              <AdminTh className="cursor-pointer hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-2">
                  Total <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </div>
              </AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Payment</AdminTh>
              <AdminTh className="text-right pr-6">Actions</AdminTh>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id)
              return (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className={`border-b border-ink/5 hover:bg-ink/[0.02] cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky/5 hover:bg-sky/10' : ''
                  }`}
                >
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select order ${order.order_number}`}
                      checked={isSelected}
                      onChange={() => onToggleSelectOrder(order.id)}
                      className="w-4 h-4 rounded border-ink/20 text-cta focus:ring-cta/30 cursor-pointer accent-cta"
                    />
                  </td>
                  <AdminTd className="font-medium text-ink">
                    <span className="font-mono">{order.order_number}</span>
                  </AdminTd>
                  <AdminTd>
                    <div className="flex flex-col">
                      <span className="font-medium text-ink">{order.customer_name}</span>
                      <span className="text-xs text-ink/50">{order.customer_email}</span>
                    </div>
                  </AdminTd>
                  <AdminTd className="text-ink/70">{formatDate(order.date)}</AdminTd>
                  <AdminTd className="text-ink/70">{order.items.length}</AdminTd>
                  <AdminTd className="font-medium text-ink">
                    {formatPrice(order.total_paise / 100)}
                  </AdminTd>
                  <AdminTd>
                    <StatusBadge status={order.status} />
                  </AdminTd>
                  <AdminTd>
                    <StatusBadge status={order.payment_status} />
                  </AdminTd>
                  <AdminTd className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPrintSingle(order)}
                        title="Print Courier Box Label / Invoice"
                        className="p-1.5 text-ink/60 hover:text-sky hover:bg-sky/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSingle(order)}
                        title="Delete order"
                        className="p-1.5 text-ink/60 hover:text-coral hover:bg-coral/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </AdminTd>
                </tr>
              )
            })}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  )

  // Mobile View
  const MobileList = () => (
    <div className="lg:hidden flex flex-col gap-4">
      {orders.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-ink/10 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isPartiallySelected
              }}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded border-ink/20 text-cta focus:ring-cta/30 cursor-pointer accent-cta"
            />
            <span>Select All ({orders.length})</span>
          </label>
          <span className="text-ink/50">{selectedOrderIds.length} selected</span>
        </div>
      )}

      {orders.map((order: any) => {
        const isSelected = selectedOrderIds.includes(order.id)
        return (
          <div
            key={order.id}
            onClick={() => onSelectOrder(order)}
            className={`bg-white border rounded-xl p-4 shadow-sm active:scale-[0.99] transition-all cursor-pointer ${
              isSelected ? 'border-sky bg-sky/[0.02]' : 'border-ink/10'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectOrder(order.id)}
                    className="w-4 h-4 rounded border-ink/20 text-cta focus:ring-cta/30 cursor-pointer accent-cta mt-0.5"
                  />
                </div>
                <div>
                  <p className="font-semibold text-ink font-mono">{order.order_number}</p>
                  <p className="text-xs text-ink/50">{formatDate(order.date)}</p>
                </div>
              </div>
              <p className="font-bold text-ink">{formatPrice(order.total_paise / 100)}</p>
            </div>

            <div className="flex flex-col gap-1 mb-3.5 pl-6">
              <span className="text-sm font-medium text-ink">{order.customer_name}</span>
              <span className="text-xs text-ink/60 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {order.customer_email}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-ink/5 pl-6">
              <div className="flex gap-2 items-center">
                <StatusBadge status={order.payment_status} />
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onPrintSingle(order)}
                  title="Print Shipping Label"
                  className="p-1.5 text-ink/60 hover:text-sky hover:bg-sky/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSingle(order)}
                  title="Delete order"
                  className="p-1.5 text-ink/60 hover:text-coral hover:bg-coral/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {orders.length === 0 && (
        <div className="bg-white border border-ink/10 rounded-xl p-12 text-center text-ink/50 shadow-sm">
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
