import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/lib/admin/mock-orders'
import { AdminFilterBar, AdminSearchInput, AdminSelect, AdminDatePicker } from '@/components/admin/ui/primitives'

interface OrderFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: OrderStatus | 'All'
  setStatusFilter: (status: OrderStatus | 'All') => void
  paymentFilter: PaymentStatus | 'All'
  setPaymentFilter: (status: PaymentStatus | 'All') => void
  timeFilter: 'Recent (24h)' | 'In Process' | 'All Time'
  setTimeFilter: (time: 'Recent (24h)' | 'In Process' | 'All Time') => void
  dateFilter: string
  setDateFilter: (date: string) => void
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
  timeFilter,
  setTimeFilter,
  dateFilter,
  setDateFilter,
  resultCount,
  isMobileFiltersOpen,
  setIsMobileFiltersOpen
}: OrderFiltersProps) {

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== '' || timeFilter !== 'All Time'

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('All')
    setPaymentFilter('All')
    setDateFilter('')
    setTimeFilter('All Time')
  }

  const FilterControls = () => (
    <>
      <div className="flex flex-col gap-1 w-full lg:w-40">
        <label className="text-[11px] font-semibold text-[#8C9196] uppercase tracking-wider">Date</label>
        <AdminDatePicker value={dateFilter} onChange={setDateFilter} placeholder="dd-mm-yyyy" />
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-40">
        <label className="text-[11px] font-semibold text-[#8C9196] uppercase tracking-wider">Order Status</label>
        <AdminSelect value={statusFilter} onChange={(v) => setStatusFilter(v as any)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </AdminSelect>
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-40">
        <label className="text-[11px] font-semibold text-[#8C9196] uppercase tracking-wider">Payment Status</label>
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
      <div className="w-full flex flex-col gap-4">
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
          <div className="lg:hidden pt-4 border-t border-ink/10 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <FilterControls />
          </div>
        )}

        {/* Time Pills & Results Count */}
        <div className="pt-4 border-t border-ink/5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm w-full gap-4">
          <div className="flex flex-wrap gap-2">
            {['Recent (24h)', 'In Process', 'All Time'].map(pill => (
              <button
                key={pill}
                onClick={() => setTimeFilter(pill as any)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                  timeFilter === pill 
                    ? 'bg-[#303030] text-white shadow-sm' 
                    : 'bg-transparent text-[#5C5F62] hover:bg-[#F4F6F8]'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
          <span className="text-ink/60 font-medium whitespace-nowrap">
            Showing <span className="text-ink font-semibold">{resultCount}</span> orders
          </span>
        </div>
      </div>
    </AdminFilterBar>
  )
}
