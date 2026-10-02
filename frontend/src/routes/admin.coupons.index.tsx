import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { CouponTable } from '@/components/admin/coupons/coupon-table'
import { CouponAnalyticsDrawer } from '@/components/admin/coupons/coupon-analytics-drawer'
import { type Coupon, MOCK_COUPONS, MOCK_REDEMPTIONS, getCouponStatus } from '@/lib/admin/mock-coupons'
import { useToast } from '@/context/toast-context'
import { AdminPageHeader, AdminButton, ConfirmModal } from '@/components/admin/ui/primitives'

export const Route = createFileRoute('/admin/coupons/')({
  component: AdminCouponsPage,
})

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [selectedAnalyticsCoupon, setSelectedAnalyticsCoupon] = useState<Coupon | null>(null)
  const { showToast } = useToast()

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: '' })

  const activeCount = coupons.filter(c => getCouponStatus(c) === 'Active').length
  const expiredCount = coupons.filter(c => getCouponStatus(c) === 'Expired').length

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setCoupons(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !currentStatus } : c
    ))
    showToast(`Coupon marked as ${!currentStatus ? 'Active' : 'Inactive'}`)
  }

  const handleDelete = (id: string) => {
    setConfirmModal({ isOpen: true, id })
  }

  const confirmDelete = () => {
    setCoupons(prev => prev.filter(c => c.id !== confirmModal.id))
    showToast("Coupon deleted successfully")
    setConfirmModal({ isOpen: false, id: '' })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      <AdminPageHeader 
        title="Coupons"
        description={`Active: ${activeCount} · Expired: ${expiredCount}`}
        actions={
          <AdminButton icon={<Plus className="w-4 h-4" />}>
            <Link to="/admin/coupons/new">New Coupon</Link>
          </AdminButton>
        }
      />

      <CouponTable 
        coupons={coupons}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onViewAnalytics={setSelectedAnalyticsCoupon}
      />

      <CouponAnalyticsDrawer 
        coupon={selectedAnalyticsCoupon}
        redemptions={MOCK_REDEMPTIONS}
        isOpen={!!selectedAnalyticsCoupon}
        onClose={() => setSelectedAnalyticsCoupon(null)}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: '' })}
        onConfirm={confirmDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}
