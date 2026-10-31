import { useState, useMemo, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Printer, Trash2, CheckSquare, X, AlertTriangle, Loader2 } from 'lucide-react'
import type { OrderStatus, PaymentStatus, AdminOrder } from '@/lib/admin/mock-orders'
import { OrderFilters } from '@/components/admin/orders/order-filters'
import { OrderTable } from '@/components/admin/orders/order-table'
import { OrderDetailDrawer } from '@/components/admin/orders/order-detail-drawer'
import { OrderShippingInvoice } from '@/components/admin/orders/order-shipping-invoice'
import { api } from '@/lib/api'
import { deleteAdminOrder, bulkDeleteAdminOrders } from '@/lib/admin/orders-api'
import { cmsApi } from '@/lib/admin/cms-api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
})

function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shopSettings, setShopSettings] = useState<any>(null)
  const { showToast } = useToast()

  // Selection states
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])

  // Print Modal states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [ordersToPrint, setOrdersToPrint] = useState<any[]>([])

  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [ordersToDelete, setOrdersToDelete] = useState<any[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'All'>('All')
  const [timeFilter, setTimeFilter] = useState<'Recent (24h)' | 'In Process' | 'All Time'>('All Time')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    // Fetch shop settings for invoices
    cmsApi.getShopSettings()
      .then(setShopSettings)
      .catch((err) => console.error('Failed to load shop settings:', err))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const fetchOrders = async () => {
      try {
        let url = '/api/v1/admin/orders'
        const params = new URLSearchParams()
        if (startDate) params.append('start_date', startDate)
        if (endDate) params.append('end_date', endDate)
        if (params.toString()) url += `?${params.toString()}`

        const res = await api.get(url, { signal: controller.signal })
        const raw = res.data.orders || []
        const seen = new Set()
        const dedupedOrders = []
        for (const o of raw) {
          const key = o.id || o.order_number
          if (key && !seen.has(key)) {
            seen.add(key)
            dedupedOrders.push(o)
          }
        }
        setOrders(dedupedOrders)
      } catch (err: any) {
        if (err.name === 'CanceledError' || controller.signal.aborted) return
        showToast('Failed to load orders')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }
    fetchOrders()
    return () => controller.abort()
  }, [startDate, endDate])

  // Derived filtered data
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchNumber = order.order_number?.toLowerCase().includes(query)
        const matchName = order.customer_name?.toLowerCase().includes(query)
        const matchEmail = order.customer_email?.toLowerCase().includes(query)
        if (!matchNumber && !matchName && !matchEmail) return false
      }

      // Status
      if (statusFilter !== 'All' && order.status !== statusFilter) return false

      // Payment
      if (paymentFilter !== 'All' && order.payment_status !== paymentFilter) return false

      // Date Range Filter (Client Fallback)
      const orderDateStr = new Date(order.date || order.created_at).toISOString().split('T')[0]
      if (startDate && orderDateStr < startDate) return false
      if (endDate && orderDateStr > endDate) return false

      // Time Pills Filter
      if (timeFilter === 'Recent (24h)') {
        const orderDate = new Date(order.date || order.created_at).getTime()
        const now = new Date().getTime()
        if (now - orderDate > 24 * 60 * 60 * 1000) return false
      } else if (timeFilter === 'In Process') {
        if (!['Pending', 'Processing'].includes(order.status)) return false
      }

      return true
    })
  }, [orders, searchQuery, statusFilter, paymentFilter, timeFilter, startDate, endDate])

  // Selection handlers
  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  const handleToggleSelectAll = () => {
    const currentFilteredIds = filteredOrders.map((o) => o.id)
    const isAllSelected =
      currentFilteredIds.length > 0 &&
      currentFilteredIds.every((id) => selectedOrderIds.includes(id))

    if (isAllSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)))
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])))
    }
  }

  const handleClearSelection = () => {
    setSelectedOrderIds([])
  }

  // Print handlers
  const handlePrintSelected = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id))
    const seen = new Set()
    const uniqueSelected = []
    for (const o of selected) {
      const key = o.id || o.order_number
      if (key && !seen.has(key)) {
        seen.add(key)
        uniqueSelected.push(o)
      }
    }
    if (uniqueSelected.length === 0) return
    setOrdersToPrint(uniqueSelected)
    setIsPrintModalOpen(true)
  }

  const handlePrintSingle = (order: any) => {
    setOrdersToPrint([order])
    setIsPrintModalOpen(true)
  }

  // Delete handlers
  const handlePromptDeleteSelected = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id))
    if (selected.length === 0) return
    setOrdersToDelete(selected)
    setIsDeleteModalOpen(true)
  }

  const handlePromptDeleteSingle = (order: any) => {
    setOrdersToDelete([order])
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (ordersToDelete.length === 0) return
    setIsDeleting(true)
    const idsToDelete = ordersToDelete.map((o) => o.id)

    try {
      if (idsToDelete.length === 1) {
        await deleteAdminOrder(idsToDelete[0])
      } else {
        await bulkDeleteAdminOrders(idsToDelete)
      }

      // Update state
      setOrders((prev) => prev.filter((o) => !idsToDelete.includes(o.id)))
      setSelectedOrderIds((prev) => prev.filter((id) => !idsToDelete.includes(id)))

      // If drawer was open for a deleted order, close it
      if (selectedOrder && idsToDelete.includes(selectedOrder.id)) {
        setIsDrawerOpen(false)
        setSelectedOrder(null)
      }

      showToast(
        idsToDelete.length === 1
          ? `Order #${ordersToDelete[0].order_number} deleted successfully`
          : `Deleted ${idsToDelete.length} orders successfully`
      )
      setIsDeleteModalOpen(false)
      setOrdersToDelete([])
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete order(s)')
    } finally {
      setIsDeleting(false)
    }
  }

  // Drawer handlers
  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    trackingNumber?: string
  ) => {
    try {
      const payload: { status: OrderStatus; tracking_number?: string } = { status: newStatus }
      if (trackingNumber) {
        payload.tracking_number = trackingNumber
      }

      await api.patch(`/api/v1/admin/orders/${orderId}/status`, payload)

      // Update local state
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const updatedShipping = { ...(o.shipping_address || {}) }
            if (trackingNumber) {
              updatedShipping.tracking_number = trackingNumber
              updatedShipping.carrier = 'ST Courier'
            }
            return {
              ...o,
              status: newStatus,
              shipping_address: updatedShipping,
              payment_status: newStatus === 'Cancelled' ? 'Refunded' : o.payment_status,
            }
          }
          return o
        })
      )

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => {
          if (!prev) return prev
          const updatedShipping = { ...(prev.shipping_address || {}) }
          if (trackingNumber) {
            updatedShipping.tracking_number = trackingNumber
            updatedShipping.carrier = 'ST Courier'
          }
          return {
            ...prev,
            status: newStatus,
            shipping_address: updatedShipping,
            payment_status: newStatus === 'Cancelled' ? 'Refunded' : prev.payment_status,
          }
        })
      }

      showToast(
        newStatus === 'Shipped'
          ? 'Order marked as Shipped & WhatsApp alert sent'
          : 'Order status updated'
      )
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update order status')
    }
  }

  return (
    <div className="animate-in fade-in duration-300 relative pb-20">
      <OrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        resultCount={filteredOrders.length}
        isMobileFiltersOpen={isMobileFiltersOpen}
        setIsMobileFiltersOpen={setIsMobileFiltersOpen}
      />

      <OrderTable
        orders={filteredOrders}
        selectedOrderIds={selectedOrderIds}
        onToggleSelectOrder={handleToggleSelectOrder}
        onToggleSelectAll={handleToggleSelectAll}
        onSelectOrder={handleSelectOrder}
        onDeleteSingle={handlePromptDeleteSingle}
        onPrintSingle={handlePrintSingle}
      />

      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={handlePromptDeleteSingle}
        onPrintOrder={handlePrintSingle}
      />

      {/* Floating Bulk Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#202223] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-white/20">
            <span className="w-6 h-6 rounded-full bg-cta text-white font-bold text-xs flex items-center justify-center">
              {selectedOrderIds.length}
            </span>
            <span className="text-xs font-semibold hidden sm:inline">
              Selected
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrintSelected}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky text-white text-xs font-bold hover:bg-sky/90 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Box Slips ({selectedOrderIds.length})</span>
          </button>

          <button
            type="button"
            onClick={handlePromptDeleteSelected}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-coral hover:bg-coral/90 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>

          <button
            type="button"
            onClick={handleClearSelection}
            className="text-xs text-white/60 hover:text-white p-1 ml-1 transition-colors cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Print Shipping Slips & Invoices Modal */}
      <OrderShippingInvoice
        orders={ordersToPrint}
        shopSettings={shopSettings}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setOrdersToPrint([])
        }}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-ink/10 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-lg text-ink">
              {ordersToDelete.length === 1
                ? `Delete Order #${ordersToDelete[0].order_number}?`
                : `Delete ${ordersToDelete.length} Selected Orders?`}
            </h3>

            <p className="text-xs sm:text-sm text-ink/70 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              {ordersToDelete.length === 1 ? 'this order' : 'these orders'}? All order records,
              purchased item history, and address details will be removed from the database. This action
              cannot be undone.
            </p>

            {ordersToDelete.length > 0 && ordersToDelete.length <= 5 && (
              <div className="mt-3 bg-cloud p-3 rounded-xl border border-ink/5 space-y-1">
                {ordersToDelete.map((o) => (
                  <div key={o.id} className="text-xs flex justify-between font-mono">
                    <span className="font-bold text-ink">{o.order_number}</span>
                    <span className="text-ink/60">{o.customer_name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setOrdersToDelete([])
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral hover:bg-coral/90 text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting
                  ? 'Deleting...'
                  : ordersToDelete.length === 1
                  ? 'Delete Order'
                  : `Delete ${ordersToDelete.length} Orders`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
