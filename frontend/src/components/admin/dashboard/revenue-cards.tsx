import { TrendingUp, TrendingDown, Package, AlertTriangle, IndianRupee } from 'lucide-react'

interface RevenueCardsProps {
  todayRevenue: number
  yesterdayRevenue: number
  totalOrdersMonth: number
  pendingOrders: number
  lowStockCount: number
}

export function RevenueCards({ 
  todayRevenue, 
  yesterdayRevenue, 
  totalOrdersMonth, 
  pendingOrders, 
  lowStockCount 
}: RevenueCardsProps) {
  
  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`
  
  const revenueChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
  const isRevenueUp = revenueChange >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Today's Revenue */}
      <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-ink/60">Today's Revenue</span>
          <div className="p-2 bg-sky/10 rounded-lg text-sky">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-2xl font-semibold text-ink">{formatPrice(todayRevenue)}</span>
          <span className={`flex items-center text-xs font-medium pb-1 ${isRevenueUp ? 'text-green-600' : 'text-rust'}`}>
            {isRevenueUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(revenueChange).toFixed(1)}% vs yesterday
          </span>
        </div>
      </div>

      {/* Orders This Month */}
      <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-ink/60">Orders (30 Days)</span>
          <div className="p-2 bg-ink/5 rounded-lg text-ink/70">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-2xl font-semibold text-ink">{totalOrdersMonth.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-ink/60">Pending Fulfillment</span>
          <div className="p-2 bg-butter/20 rounded-lg text-[#B28A00]">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-2xl font-semibold text-ink">{pendingOrders}</span>
          <span className="text-xs font-medium text-ink/60 pb-1">Need shipping</span>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-ink/60">Low Stock Items</span>
          <div className="p-2 bg-rust/10 rounded-lg text-rust">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-2xl font-semibold text-rust">{lowStockCount}</span>
          <span className="text-xs font-medium text-rust/80 pb-1">Require attention</span>
        </div>
      </div>

    </div>
  )
}
