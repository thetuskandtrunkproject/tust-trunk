import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { RevenueCards } from '@/components/admin/dashboard/revenue-cards'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { TopProductsWidget } from '@/components/admin/dashboard/top-products-widget'
import { RecentActivityFeed } from '@/components/admin/dashboard/recent-activity-feed'
import { OrderReport } from '@/components/admin/dashboard/order-report'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      try {
        const res = await api.get(`/api/v1/admin/dashboard?time_range=${timeRange}`)
        setDashboard(res.data)
      } catch (err: any) {
        showToast('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [timeRange])

  if (isLoading && !dashboard) {
    return <div className="p-12 text-center text-ink/60 font-bold animate-pulse">Loading dashboard...</div>
  }
  
  if (!dashboard) {
    return <div className="p-12 text-center text-ink/60 font-bold">Failed to load dashboard.</div>
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-24">
      
      {/* Top Stat Cards */}
      <RevenueCards 
        todayRevenue={dashboard.todayRevenue / 100}
        yesterdayRevenue={dashboard.yesterdayRevenue / 100}
        totalOrdersMonth={dashboard.totalOrdersMonth}
        pendingOrders={dashboard.pendingOrders}
        lowStockCount={dashboard.lowStockCount}
      />

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area (takes up 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <RevenueChart 
            data={dashboard.revenueData.map((d: any) => ({ ...d, revenue: d.revenue / 100 }))} 
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
        
        {/* Top Products (takes up 1 column on desktop) */}
        <div className="lg:col-span-1">
          <TopProductsWidget products={dashboard.topProducts.map((p: any) => ({ ...p, revenue: p.revenue / 100 }))} />
        </div>
        
      </div>

      {/* Bottom Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderReport />
        </div>
        
        <div className="lg:col-span-1">
          <RecentActivityFeed activities={dashboard.recentActivity} />
        </div>
      </div>

    </div>
  )
}
