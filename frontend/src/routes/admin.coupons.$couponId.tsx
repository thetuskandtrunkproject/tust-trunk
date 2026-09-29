import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CouponForm } from '@/components/admin/coupons/coupon-form'
import { type Coupon, MOCK_COUPONS } from '@/lib/admin/mock-coupons'
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

  useEffect(() => {
    const found = MOCK_COUPONS.find(c => c.id === couponId)
    if (found) {
      setCoupon(found)
    } else {
      showToast("Coupon not found")
      navigate({ to: '/admin/coupons' })
    }
  }, [couponId, navigate, showToast])

  const handleSubmit = (data: Partial<Coupon>) => {
    // In a real app, this would be an API call
    const index = MOCK_COUPONS.findIndex(c => c.id === couponId)
    if (index !== -1) {
      MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], ...data }
    }
    
    showToast("Coupon updated successfully")
    navigate({ to: '/admin/coupons' })
  }

  if (!coupon) return null

  return (
    <div className="animate-in fade-in duration-500">
      <CouponForm initialData={coupon} onSubmit={handleSubmit} />
    </div>
  )
}
