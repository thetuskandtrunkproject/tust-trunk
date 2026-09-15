import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/lib/admin/mock-orders'

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
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wider">Order Status</label>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-cloud border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky/50"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-48">
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wider">Payment Status</label>
        <select 
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as any)}
          className="bg-cloud border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky/50"
        >
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-end h-full mt-4 lg:mt-0">
          <button 
            onClick={clearFilters}
            className="text-sm font-medium text-rust hover:text-rust/80 flex items-center gap-1 py-2"
          >
            <X className="w-4 h-4" /> Clear filters
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="bg-white border border-ink/10 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
        
        {/* Search & Mobile Toggle */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search order #, name, or email" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cloud border border-ink/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-sky/50"
            />
          </div>
          
          <button 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden p-2 bg-cloud border border-ink/10 rounded-lg text-ink/70 hover:bg-ink/5"
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
      <div className="mt-4 pt-4 border-t border-ink/5 flex items-center justify-between text-sm">
        <span className="text-ink/60 font-medium">
          Showing <span className="text-ink font-semibold">{resultCount}</span> orders
        </span>
      </div>
    </div>
  )
}
