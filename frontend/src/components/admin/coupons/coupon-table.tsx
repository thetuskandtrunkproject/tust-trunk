import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil, Trash, ChartBar } from 'lucide-react'
import { type Coupon, getCouponStatus } from '@/lib/admin/mock-coupons'

interface CouponTableProps {
  coupons: Coupon[]
  onToggleStatus: (id: string, currentStatus: boolean) => void
  onDelete: (id: string) => void
  onViewAnalytics: (coupon: Coupon) => void
}

export function CouponTable({ coupons, onToggleStatus, onDelete, onViewAnalytics }: CouponTableProps) {
  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-12 text-center">
        <h3 className="text-lg font-bold text-ink mb-2">No coupons found</h3>
        <p className="text-ink/60 mb-6">Create your first coupon to start offering discounts.</p>
        <Link 
          to="/admin/coupons/new"
          className="inline-flex items-center justify-center bg-coral text-white px-6 py-2.5 rounded-lg font-bold hover:bg-coral/90 transition-colors"
        >
          + New Coupon
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-cloud text-ink/60 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Min Cart</th>
              <th className="px-6 py-4">Usage</th>
              <th className="px-6 py-4">Scope</th>
              <th className="px-6 py-4">Valid Until</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon)
              return (
                <tr key={coupon.id} className="hover:bg-cloud/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-ink">{coupon.code}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-sky-soft text-sky text-xs font-bold uppercase tracking-wider">
                      {coupon.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink font-medium">
                    {coupon.type === 'free_shipping' 
                      ? '—' 
                      : coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td className="px-6 py-4 text-ink/60">
                    {coupon.minCartValue > 0 ? `₹${coupon.minCartValue}` : 'None'}
                  </td>
                  <td className="px-6 py-4 text-ink/60 whitespace-nowrap">
                    {coupon.usageCount} / {coupon.totalUsageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ink/5 text-ink text-xs font-medium">
                      {coupon.scope.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink/60 whitespace-nowrap">
                    {new Date(coupon.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      status === 'Active' ? 'bg-mint/20 text-mint' : 
                      status === 'Expired' ? 'bg-coral/10 text-coral' : 
                      'bg-ink/10 text-ink/60'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* Active Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer mr-2">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={coupon.isActive}
                          onChange={() => onToggleStatus(coupon.id, coupon.isActive)}
                        />
                        <div className="w-9 h-5 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mint"></div>
                      </label>

                      <button 
                        onClick={() => onViewAnalytics(coupon)}
                        className="text-ink/40 hover:text-sky transition-colors"
                        title="Analytics"
                      >
                        <ChartBar className="w-4 h-4" />
                      </button>
                      <Link 
                        to="/admin/coupons/$couponId"
                        params={{ couponId: coupon.id }}
                        className="text-ink/40 hover:text-ink transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => onDelete(coupon.id)}
                        className="text-ink/40 hover:text-coral transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
