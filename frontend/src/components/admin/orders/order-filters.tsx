import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/lib/admin/mock-orders'
import { AdminFilterBar, AdminSearchInput, AdminSelect } from '@/components/admin/ui/primitives'

interface OrderFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: OrderStatus | 'All'
  setStatusFilter: (status: OrderStatus | 'All') => void
  paymentFilter: PaymentStatus | 'All'
  setPaymentFilter: (status: PaymentStatus | 'All') => void
  resultCount: number
  isMobileFiltersOpen: boolean
  setIsMobileFiltersOpen: (isOpen: boolean) => void
}

export function OrderFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  resultCount,
  isMobileFiltersOpen,
  setIsMobileFiltersOpen
}: OrderFiltersProps) {

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || paymentFilter !== 'All'

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('All')
    setPaymentFilter('All')
  }

  const FilterControls = () => (
    <>
      <div className="flex flex-col gap-1 w-full lg:w-48">
        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Order Status</label>
        <AdminSelect value={statusFilter} onChange={(v) => setStatusFilter(v as any)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </AdminSelect>
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-48">
        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Payment Status</label>
        <AdminSelect value={paymentFilter} onChange={(v) => setPaymentFilter(v as any)}>
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </AdminSelect>
      </div>

      {hasActiveFilters && (
        <div className="flex items-end h-full mt-4 lg:mt-0">
          <button 
            onClick={clearFilters}
            className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 py-2"
          >
            <X className="w-4 h-4" /> Clear filters
          </button>
        </div>
      )}
    </>
  )

  return (
    <AdminFilterBar className="!mb-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between w-full">
        
        {/* Search & Mobile Toggle */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <AdminSearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search order #, name, or email"
            className="flex-1 lg:w-80"
          />
          
          <button 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden p-2.5 bg-cloud border border-ink/10 rounded-full text-ink/70 hover:bg-ink/5"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-end gap-4">
          <FilterControls />
        </div>
      </div>

      {/* Mobile Filters Dropdown */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-ink/10 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <FilterControls />
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-ink/5 flex items-center justify-between text-sm w-full">
        <span className="text-ink/60 font-medium">
          Showing <span className="text-ink font-semibold">{resultCount}</span> orders
        </span>
      </div>
    </AdminFilterBar>
  )
}
