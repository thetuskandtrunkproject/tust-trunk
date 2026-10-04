import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { CouponTable } from '@/components/admin/coupons/coupon-table'
import { CouponAnalyticsDrawer } from '@/components/admin/coupons/coupon-analytics-drawer'
import { type Coupon, MOCK_REDEMPTIONS, getCouponStatus } from '@/lib/admin/mock-coupons'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'
import { AdminPageHeader, AdminButton, ConfirmModal } from '@/components/admin/ui/primitives'

export const Route = createFileRoute('/admin/coupons/')({
  component: AdminCouponsPage,
})

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnalyticsCoupon, setSelectedAnalyticsCoupon] = useState<Coupon | null>(null)
  const { showToast } = useToast()

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: '' })

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/admin/coupons')
      const mapped = res.data.map((c: any) => ({
        id: c.id,
        code: c.code,
        type: c.discount_type,
        value: c.discount_type === 'flat' ? c.discount_value / 100 : c.discount_value,
        minCartValue: c.min_cart_value_paise ? c.min_cart_value_paise / 100 : 0,
        totalUsageLimit: c.total_usage_limit,
        perCustomerLimit: c.per_user_limit,
        usageCount: c.usage_count,
        scope: c.scope,
        startDate: c.valid_from,
        endDate: c.valid_until,
        isActive: c.is_active
      }))
      setCoupons(mapped)
    } catch (err) {
      showToast('Failed to load coupons', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const activeCount = coupons.filter(c => getCouponStatus(c) === 'Active').length
  const expiredCount = coupons.filter(c => getCouponStatus(c) === 'Expired').length

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/v1/admin/coupons/${id}`, { is_active: !currentStatus })
      showToast(`Coupon marked as ${!currentStatus ? 'Active' : 'Inactive'}`, 'success')
      fetchCoupons()
    } catch (err) {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = (id: string) => {
    setConfirmModal({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/v1/admin/coupons/${confirmModal.id}`)
      showToast("Coupon deleted successfully", "success")
      setConfirmModal({ isOpen: false, id: '' })
      fetchCoupons()
    } catch (err) {
      showToast("Failed to delete coupon", "error")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      <AdminPageHeader 
        title="Coupons"
        description={`Active: ${activeCount} · Expired: ${expiredCount}`}
        actions={
          <Link to="/admin/coupons/new">
            <AdminButton icon={<Plus className="w-4 h-4" />}>
              New Coupon
            </AdminButton>
          </Link>
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

