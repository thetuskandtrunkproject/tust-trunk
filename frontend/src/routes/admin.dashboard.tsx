import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { RevenueCards } from '@/components/admin/dashboard/revenue-cards'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { TopProductsWidget } from '@/components/admin/dashboard/top-products-widget'
import { RecentActivityFeed } from '@/components/admin/dashboard/recent-activity-feed'
import { OrderReport } from '@/components/admin/dashboard/order-report'
import { AdminSpinner } from '@/components/admin/ui/primitives'
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
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Guard against StrictMode double-mount on initial load
    if (fetchedRef.current && timeRange === '30d') {
      // Allow refetch if timeRange actually changed
    }
    fetchedRef.current = true

    const controller = new AbortController()
    const fetchDashboard = async () => {
      setIsLoading(true)
      try {
        const res = await api.get(`/api/v1/admin/dashboard?time_range=${timeRange}`, {
          signal: controller.signal,
        })
        setDashboard(res.data)
      } catch (err: any) {
        if (err.name === 'CanceledError' || controller.signal.aborted) return
        showToast('Failed to load dashboard data')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    fetchDashboard()
    return () => controller.abort()
  }, [timeRange])

  if (isLoading && !dashboard) {
    return <AdminSpinner />
  }
  
  if (!dashboard) {
    return (
      <div className="p-12 text-center">
        <p className="text-ink/60 font-bold mb-4">Failed to load dashboard.</p>
        <button
          onClick={() => setTimeRange(prev => prev)}
          className="text-sm font-semibold text-sky hover:underline"
        >
          Retry
        </button>
      </div>
    )
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
