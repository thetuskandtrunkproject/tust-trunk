import { createFileRoute } from '@tanstack/react-router'
import { RevenueCards } from '@/components/admin/dashboard/revenue-cards'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { TopProductsWidget } from '@/components/admin/dashboard/top-products-widget'
import { RecentActivityFeed } from '@/components/admin/dashboard/recent-activity-feed'
import { mockDashboard } from '@/lib/admin/mock-dashboard'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Top Stat Cards */}
      <RevenueCards 
        todayRevenue={mockDashboard.todayRevenue}
        yesterdayRevenue={mockDashboard.yesterdayRevenue}
        totalOrdersMonth={mockDashboard.totalOrdersMonth}
        pendingOrders={mockDashboard.pendingOrders}
        lowStockCount={mockDashboard.lowStockCount}
      />

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area (takes up 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <RevenueChart data={mockDashboard.revenueData30Days} />
        </div>
        
        {/* Top Products (takes up 1 column on desktop) */}
        <div className="lg:col-span-1">
          <TopProductsWidget products={mockDashboard.topProducts} />
        </div>
        
      </div>

      {/* Bottom Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* We'll leave this empty for now, or it could hold an Orders table later */}
        </div>
        
        <div className="lg:col-span-1">
          <RecentActivityFeed activities={mockDashboard.recentActivity} />
        </div>
      </div>

    </div>
  )
}
