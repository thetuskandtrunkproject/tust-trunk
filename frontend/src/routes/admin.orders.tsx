import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { adminMockOrders } from '@/lib/admin/mock-orders'
import type { AdminOrder, OrderStatus, PaymentStatus } from '@/lib/admin/mock-orders'
import { OrderFilters } from '@/components/admin/orders/order-filters'
import { OrderTable } from '@/components/admin/orders/order-table'
import { OrderDetailDrawer } from '@/components/admin/orders/order-detail-drawer'

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
})

function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(adminMockOrders)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'All'>('All')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Derived filtered data
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchNumber = order.orderNumber.toLowerCase().includes(query)
        const matchName = order.customerName.toLowerCase().includes(query)
        const matchEmail = order.customerEmail.toLowerCase().includes(query)
        if (!matchNumber && !matchName && !matchEmail) return false
      }
      
      // Status
      if (statusFilter !== 'All' && order.status !== statusFilter) return false
      
      // Payment
      if (paymentFilter !== 'All' && order.paymentStatus !== paymentFilter) return false
      
      return true
    })
  }, [orders, searchQuery, statusFilter, paymentFilter])

  // Handlers
  const handleSelectOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    // Update local state (this reflects immediately in the table behind the drawer)
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: newStatus,
          // Auto-update payment status if cancelled
          paymentStatus: newStatus === 'Cancelled' ? 'Refunded' : o.paymentStatus
        }
      }
      return o
    }))
    
    // Also update the selected order in the drawer
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => {
        if (!prev) return prev
        return {
          ...prev,
          status: newStatus,
          paymentStatus: newStatus === 'Cancelled' ? 'Refunded' : prev.paymentStatus
        }
      })
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
