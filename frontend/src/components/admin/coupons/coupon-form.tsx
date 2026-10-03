import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { type Coupon, type CouponType, type CouponScope } from '@/lib/admin/mock-coupons'
import { useToast } from '@/context/toast-context'

interface CouponFormProps {
  initialData?: Coupon
  onSubmit: (data: Partial<Coupon>) => void
}

export function CouponForm({ initialData, onSubmit }: CouponFormProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const isEditing = !!initialData
  
  const [code, setCode] = useState(initialData?.code || '')
  const [type, setType] = useState<CouponType>(initialData?.type || 'percent')
  const [value, setValue] = useState(initialData?.value?.toString() || '')
  const [minCartValue, setMinCartValue] = useState(initialData?.minCartValue?.toString() || '0')
  const [totalUsageLimit, setTotalUsageLimit] = useState(initialData?.totalUsageLimit?.toString() || '')
  const [perCustomerLimit, setPerCustomerLimit] = useState(initialData?.perCustomerLimit?.toString() || '')
  const [scope, setScope] = useState<CouponScope>(initialData?.scope || 'store_wide')
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!code.trim()) {
      showToast("Coupon code is required")
      return
    }
    if (type !== 'free_shipping' && (!value || Number(value) < 0)) {
      showToast("Please enter a valid discount amount")
      return
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
      showToast("End date cannot be before start date")
      return
    }
    
    const payload: Partial<Coupon> = {
      code: code.toUpperCase(),
      type,
      value: type === 'free_shipping' ? 0 : Number(value),
      minCartValue: Number(minCartValue),
      totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : null,
      perCustomerLimit: perCustomerLimit ? Number(perCustomerLimit) : null,
      scope,
      startDate,
      endDate: endDate || '2099-12-31' // Hack for unlimited if blank
    }
    
    onSubmit(payload)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate({ to: '/admin/coupons' })}
          className="p-2 text-ink/60 hover:text-ink hover:bg-cloud rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink">{isEditing ? 'Edit Coupon' : 'New Coupon'}</h1>
          <p className="text-sm text-ink/60">Configure discount rules and usage limits</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Coupon Details */}
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-6">
          <h2 className="text-lg font-bold text-ink mb-6 pb-4 border-b border-ink/5">Coupon Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER20"
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors uppercase"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CouponType)}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors appearance-none"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            {type !== 'free_shipping' && (
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Discount Amount {type === 'percent' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Minimum Cart Value (₹)</label>
              <input
                type="number"
                min="0"
                value={minCartValue}
                onChange={(e) => setMinCartValue(e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-6">
          <h2 className="text-lg font-bold text-ink mb-6 pb-4 border-b border-ink/5">Usage Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Total Usage Limit</label>
              <input
                type="number"
                min="1"
                value={totalUsageLimit}
                onChange={(e) => setTotalUsageLimit(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Per Customer Limit</label>
              <input
                type="number"
                min="1"
                value={perCustomerLimit}
                onChange={(e) => setPerCustomerLimit(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Scope & Validity */}
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 p-6">
          <h2 className="text-lg font-bold text-ink mb-6 pb-4 border-b border-ink/5">Scope & Validity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Apply To</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as CouponScope)}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors appearance-none"
              >
                <option value="store_wide">Entire Store</option>
                <option value="Kids">Kids Collection</option>
                <option value="Women">Women's Collection</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-sky focus:bg-white transition-colors"
              />
              <p className="text-xs text-ink/50 mt-1">Leave blank for no expiry</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/coupons' })}
            className="px-6 py-2.5 rounded-lg font-bold text-ink/60 hover:text-ink hover:bg-cloud transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-sky text-white px-8 py-2.5 rounded-lg font-bold hover:bg-sky/90 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  )
}

