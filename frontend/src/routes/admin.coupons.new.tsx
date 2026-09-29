import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CouponForm } from '@/components/admin/coupons/coupon-form'
import { type Coupon, MOCK_COUPONS } from '@/lib/admin/mock-coupons'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/coupons/new')({
  component: AdminNewCouponPage,
})

function AdminNewCouponPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = (data: Partial<Coupon>) => {
    // In a real app, this would be an API call
    const newCoupon: Coupon = {
      ...data as Coupon,
      id: `c${Date.now()}`,
      usageCount: 0,
      isActive: true,
    }
    
    // Simulate updating mock data (this won't persist across reloads without context/store, but works for UI demo)
    MOCK_COUPONS.push(newCoupon)
    
    showToast("Coupon created successfully")
    navigate({ to: '/admin/coupons' })
  }

  return (
    <div className="animate-in fade-in duration-500">
      <CouponForm onSubmit={handleSubmit} />
    </div>
  )
}
