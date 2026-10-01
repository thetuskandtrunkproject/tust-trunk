import { TrendingUp, TrendingDown, Package, AlertTriangle, IndianRupee } from 'lucide-react'
import { AdminCard } from '@/components/admin/ui/primitives'

interface RevenueCardsProps {
  todayRevenue: number
  yesterdayRevenue: number
  thisWeekRevenue: number
  thisMonthRevenue: number
  thisYearRevenue: number
  totalOrdersMonth?: number
  pendingOrders?: number
  lowStockCount?: number
}

export function RevenueCards({ 
  todayRevenue, 
  yesterdayRevenue, 
  thisWeekRevenue,
  thisMonthRevenue,
  thisYearRevenue
}: RevenueCardsProps) {
  
  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`
  
  const revenueChange = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    : 0
  const isRevenueUp = revenueChange >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Today's Revenue */}
      <AdminCard className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[13px] font-medium text-[#5C5F62]">Today's Revenue</span>
          <div className="p-1.5 bg-[#F4F6F8] rounded-md text-[#5C5F62]">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-[24px] font-semibold text-[#202223] tracking-tight">{formatPrice(todayRevenue)}</span>
          {yesterdayRevenue > 0 && (
            <span className={`flex items-center text-[12px] font-medium pb-1 ${isRevenueUp ? 'text-[#007F5F]' : 'text-[#D82C0D]'}`}>
              {isRevenueUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(revenueChange).toFixed(1)}% from prior day
            </span>
          )}
        </div>
      </AdminCard>

      {/* This Week */}
      <AdminCard className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[13px] font-medium text-[#5C5F62]">This Week</span>
          <div className="p-1.5 bg-[#F4F6F8] rounded-md text-[#5C5F62]">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-[24px] font-semibold text-[#202223] tracking-tight">{formatPrice(thisWeekRevenue)}</span>
        </div>
      </AdminCard>

      {/* This Month */}
      <AdminCard className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[13px] font-medium text-[#5C5F62]">This Month</span>
          <div className="p-1.5 bg-[#F4F6F8] rounded-md text-[#5C5F62]">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-[24px] font-semibold text-[#202223] tracking-tight">{formatPrice(thisMonthRevenue)}</span>
        </div>
      </AdminCard>

      {/* This Year */}
      <AdminCard className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[13px] font-medium text-[#5C5F62]">This Year</span>
          <div className="p-1.5 bg-[#F4F6F8] rounded-md text-[#D82C0D]">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-auto pt-4">
          <span className="text-[24px] font-semibold text-[#202223] tracking-tight">{formatPrice(thisYearRevenue)}</span>
        </div>
      </AdminCard>

    </div>
  )
}
