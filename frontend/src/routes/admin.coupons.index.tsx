import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CouponTable } from '@/components/admin/coupons/coupon-table'
import { CouponAnalyticsDrawer } from '@/components/admin/coupons/coupon-analytics-drawer'
import { type Coupon, MOCK_COUPONS, MOCK_REDEMPTIONS, getCouponStatus } from '@/lib/admin/mock-coupons'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/coupons/')({
  component: AdminCouponsPage,
})

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [selectedAnalyticsCoupon, setSelectedAnalyticsCoupon] = useState<Coupon | null>(null)
  const { showToast } = useToast()

  const activeCount = coupons.filter(c => getCouponStatus(c) === 'Active').length
  const expiredCount = coupons.filter(c => getCouponStatus(c) === 'Expired').length

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setCoupons(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !currentStatus } : c
    ))
    showToast(`Coupon marked as ${!currentStatus ? 'Active' : 'Inactive'}`)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(prev => prev.filter(c => c.id !== id))
      showToast("Coupon deleted successfully")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">Coupons</h1>
          <p className="text-ink/60 font-medium">
            Active: {activeCount} · Expired: {expiredCount}
          </p>
        </div>
      </div>

      {/* Table */}
      <CouponTable 
        coupons={coupons}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onViewAnalytics={setSelectedAnalyticsCoupon}
      />

      {/* Analytics Drawer */}
      <CouponAnalyticsDrawer 
        coupon={selectedAnalyticsCoupon}
        redemptions={MOCK_REDEMPTIONS}
        isOpen={!!selectedAnalyticsCoupon}
        onClose={() => setSelectedAnalyticsCoupon(null)}
      />

    </div>
  )
}
