import { Link } from '@tanstack/react-router'
import { Pencil, Trash, ChartBar } from 'lucide-react'
import { type Coupon, getCouponStatus } from '@/lib/admin/mock-coupons'
import { AdminTableShell, AdminTh, AdminTd, StatusBadge, AdminButton } from '@/components/admin/ui/primitives'

interface CouponTableProps {
  coupons: Coupon[]
  onToggleStatus: (id: string, currentStatus: boolean) => void
  onDelete: (id: string) => void
  onViewAnalytics: (coupon: Coupon) => void
}

export function CouponTable({ coupons, onToggleStatus, onDelete, onViewAnalytics }: CouponTableProps) {
  
  const formatValue = (coupon: Coupon) => {
    if (coupon.type === 'free_shipping') return 'Free Shipping'
    if (coupon.type === 'percent') return `${coupon.value}% off`
    return `₹${coupon.value} off`
  }

  const formatUsage = (coupon: Coupon) => {
    if (coupon.totalUsageLimit) {
      return `${coupon.usageCount} / ${coupon.totalUsageLimit}`
    }
    return `${coupon.usageCount} (unlimited)`
  }

  return (
    <AdminTableShell isEmpty={coupons.length === 0} emptyMessage="No coupons found. Create your first coupon to start offering discounts.">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cloud/50 border-b border-ink/10">
            <AdminTh>Code</AdminTh>
            <AdminTh>Type</AdminTh>
            <AdminTh>Value</AdminTh>
            <AdminTh>Min Cart</AdminTh>
            <AdminTh>Usage</AdminTh>
            <AdminTh>Scope</AdminTh>
            <AdminTh>Valid Until</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </tr>
        </thead>
        <tbody className="text-sm">
          {coupons.map((coupon) => {
            const status = getCouponStatus(coupon)
            return (
              <tr key={coupon.id} className="border-b border-ink/5 hover:bg-ink/[0.02] transition-colors">
                <AdminTd className="font-mono font-bold text-ink">{coupon.code}</AdminTd>
                <AdminTd className="capitalize text-ink/70">{coupon.type.replace('_', ' ')}</AdminTd>
                <AdminTd className="font-semibold text-ink">{formatValue(coupon)}</AdminTd>
                <AdminTd className="text-ink/70">
                  {coupon.minCartValue ? `₹${coupon.minCartValue}` : 'None'}
                </AdminTd>
                <AdminTd className="text-ink/70">{formatUsage(coupon)}</AdminTd>
                <AdminTd className="text-ink/70 capitalize">
                  {coupon.scope === 'store_wide' ? 'Store-wide' : coupon.scope.replace('_', ' ')}
                </AdminTd>
                <AdminTd className="text-ink/70">
                  {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('en-IN', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  }) : 'Forever'}
                </AdminTd>
                <AdminTd>
                  <StatusBadge status={status} />
                </AdminTd>
                <AdminTd className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <AdminButton 
                      variant="ghost" 
                      icon={<ChartBar className="w-4 h-4" />}
                      onClick={() => onViewAnalytics(coupon)}
                      title="View Analytics"
                    />
                    <Link 
                      to="/admin/coupons/$couponId"
                      params={{ couponId: coupon.id }}
                      title="Edit Coupon"
                    >
                      <AdminButton variant="ghost" icon={<Pencil className="w-4 h-4" />} />
                    </Link>
                    <AdminButton 
                      variant="danger" 
                      icon={<Trash className="w-4 h-4" />}
                      onClick={() => onDelete(coupon.id)}
                      title="Delete Coupon"
                    />
                  </div>
                </AdminTd>
              </tr>
            )
          })}
        </tbody>
      </table>
    </AdminTableShell>
  )
}

