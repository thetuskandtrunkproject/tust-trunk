import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CouponForm } from '@/components/admin/coupons/coupon-form'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/coupons/new')({
  component: AdminNewCouponPage,
})

function AdminNewCouponPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (data: any) => {
    try {
      await api.post('/api/v1/admin/coupons', {
        code: data.code,
        discount_type: data.type,
        discount_value: data.value,
        min_cart_value_paise: data.minCartValue ? Number(data.minCartValue) * 100 : null,
        total_usage_limit: data.totalUsageLimit,
        per_user_limit: data.perCustomerLimit,
        valid_from: new Date(data.startDate).toISOString(),
        valid_until: data.endDate === '2099-12-31' ? new Date('2099-12-31').toISOString() : new Date(data.endDate).toISOString(),
      })
      showToast("Coupon created successfully", "success")
      navigate({ to: '/admin/coupons' })
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create coupon", "error")
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <CouponForm onSubmit={handleSubmit} />
    </div>
  )
}

