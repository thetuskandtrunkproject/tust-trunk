import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { RevenueCards } from '@/components/admin/dashboard/revenue-cards'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { RecentActivityFeed } from '@/components/admin/dashboard/recent-activity-feed'
import { OrderReport } from '@/components/admin/dashboard/order-report'
import { AdminSpinner, AdminPageHeader } from '@/components/admin/ui/primitives'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()
  const cacheRef = useRef<Record<string, any>>({})
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const cacheKey = timeRange === 'custom' ? `custom:${startDate}:${endDate}` : timeRange

    // INSTANT DISPLAY FROM CACHE (0ms delay)
    if (cacheRef.current[cacheKey]) {
      setDashboard(cacheRef.current[cacheKey])
      setIsLoading(false)
    } else if (!dashboard) {
      setIsLoading(true)
    }

    const fetchDashboard = async () => {
      try {
        let url = `/api/v1/admin/dashboard?time_range=${timeRange}`
        if (timeRange === 'custom') {
          if (!startDate || !endDate) return
          url += `&start_date=${startDate}&end_date=${endDate}`
        }
        
        const res = await api.get(url, {
          signal: controller.signal,
        })
        cacheRef.current[cacheKey] = res.data
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
  }, [timeRange, startDate, endDate, retryCount])

  if (isLoading && !dashboard) {
    return <AdminSpinner />
  }
  
  if (!dashboard) {
    return (
      <div className="p-12 text-center">
        <p className="text-ink/60 font-bold mb-4">Failed to load dashboard.</p>
        <button
          onClick={() => setRetryCount(prev => prev + 1)}
          className="text-sm font-semibold text-sky hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      
      <AdminPageHeader 
        title="Dashboard" 
        description="Here's what's happening with your store today."
      />

      <div id="revenue-section" className="flex flex-col gap-6">
        {/* Top Stat Cards */}
        <RevenueCards 
          periodRevenue={dashboard.periodRevenue / 100}
          previousPeriodRevenue={dashboard.previousPeriodRevenue / 100}
          avgDailyRevenue={dashboard.avgDailyRevenue / 100}
          totalOrders={dashboard.totalOrders}
          avgOrderValue={dashboard.avgOrderValue / 100}
          todayRevenue={(dashboard.todayRevenue || 0) / 100}
          weekRevenue={(dashboard.weekRevenue || 0) / 100}
          monthRevenue={(dashboard.monthRevenue || 0) / 100}
          yearRevenue={(dashboard.yearRevenue || 0) / 100}
          timeRange={timeRange}
        />

        {/* Main Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Area (takes up full width) */}
          <div className="lg:col-span-3">
            <RevenueChart 
              data={dashboard.revenueData.map((d: any) => ({ ...d, revenue: d.revenue / 100 }))} 
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
          
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
