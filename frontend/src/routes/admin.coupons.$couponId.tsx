import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CouponForm } from '@/components/admin/coupons/coupon-form'
import { type Coupon } from '@/lib/admin/mock-coupons'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/admin/coupons/$couponId')({
  component: AdminEditCouponPage,
})

function AdminEditCouponPage() {
  const { couponId } = Route.useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await api.get('/api/v1/admin/coupons')
        const found = res.data.find((c: any) => c.id === couponId)
        if (found) {
          setCoupon({
            id: found.id,
            code: found.code,
            type: found.discount_type,
            value: found.discount_type === 'flat' ? found.discount_value / 100 : found.discount_value,
            minCartValue: found.min_cart_value_paise ? found.min_cart_value_paise / 100 : 0,
            totalUsageLimit: found.total_usage_limit,
            perCustomerLimit: found.per_user_limit,
            usageCount: found.usage_count,
            scope: found.scope,
            startDate: found.valid_from ? found.valid_from.split('T')[0] : '',
            endDate: found.valid_until && found.valid_until !== '2099-12-31T00:00:00Z' ? found.valid_until.split('T')[0] : '',
            isActive: found.is_active
          })
        } else {
          showToast("Coupon not found", "error")
          navigate({ to: '/admin/coupons' })
        }
      } catch (err) {
        showToast("Failed to load coupon", "error")
        navigate({ to: '/admin/coupons' })
      } finally {
        setLoading(false)
      }
    }
    fetchCoupon()
  }, [couponId, navigate, showToast])

  const handleSubmit = async (data: Partial<Coupon>) => {
    try {
      await api.patch(`/api/v1/admin/coupons/${couponId}`, {
        code: data.code,
        discount_type: data.type,
        discount_value: data.type === 'flat' ? Number(data.value) * 100 : Number(data.value),
        min_cart_value_paise: data.minCartValue ? Number(data.minCartValue) * 100 : null,
        total_usage_limit: data.totalUsageLimit,
        per_user_limit: data.perCustomerLimit,
        valid_from: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        valid_until: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        scope: data.scope,
      })
      showToast("Coupon updated successfully", "success")
      navigate({ to: '/admin/coupons' })
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to update coupon", "error")
    }
  }

  if (loading) return <div>Loading...</div>
  if (!coupon) return null

  return (
    <div className="animate-in fade-in duration-500">
      <CouponForm initialData={coupon} onSubmit={handleSubmit} />
    </div>
  )
}

