import { useState, useMemo, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { OrderStatus, PaymentStatus } from '@/lib/admin/mock-orders'
import { OrderFilters } from '@/components/admin/orders/order-filters'
import { OrderTable } from '@/components/admin/orders/order-table'
import { OrderDetailDrawer } from '@/components/admin/orders/order-detail-drawer'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
})

function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'All'>('All')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/v1/admin/orders', { signal: controller.signal })
        setOrders(res.data.orders || [])
      } catch (err: any) {
        if (err.name === 'CanceledError' || controller.signal.aborted) return
        showToast('Failed to load orders')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }
    fetchOrders()
    return () => controller.abort()
  }, [])

  // Derived filtered data
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchNumber = order.order_number.toLowerCase().includes(query)
        const matchName = order.customer_name.toLowerCase().includes(query)
        const matchEmail = order.customer_email.toLowerCase().includes(query)
        if (!matchNumber && !matchName && !matchEmail) return false
      }
      
      // Status
      if (statusFilter !== 'All' && order.status !== statusFilter) return false
      
      // Payment
      if (paymentFilter !== 'All' && order.payment_status !== paymentFilter) return false
      
      return true
    })
  }, [orders, searchQuery, statusFilter, paymentFilter])

  // Handlers
  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/api/v1/admin/orders/${orderId}/status`, { status: newStatus })
      
      // Update local state (this reflects immediately in the table behind the drawer)
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return { 
            ...o, 
            status: newStatus,
            // Auto-update payment status if cancelled
            payment_status: newStatus === 'Cancelled' ? 'Refunded' : o.payment_status
          }
        }
        return o
      }))
      
      // Also update the selected order in the drawer
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => {
          if (!prev) return prev
          return {
            ...prev,
            status: newStatus,
            payment_status: newStatus === 'Cancelled' ? 'Refunded' : prev.payment_status
          }
        })
      }
      
      showToast('Order status updated')
    } catch (err) {
      showToast('Failed to update order status')
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      
      <OrderFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        resultCount={filteredOrders.length}
        isMobileFiltersOpen={isMobileFiltersOpen}
        setIsMobileFiltersOpen={setIsMobileFiltersOpen}
      />

      <OrderTable 
        orders={filteredOrders} 
        onSelectOrder={handleSelectOrder} 
      />

      <OrderDetailDrawer 
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

    </div>
  )
}
