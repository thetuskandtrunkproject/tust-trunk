import { X } from 'lucide-react'
import { type Coupon, type CouponRedemption } from '@/lib/admin/mock-coupons'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Link } from '@tanstack/react-router'

interface CouponAnalyticsDrawerProps {
  coupon: Coupon | null
  redemptions: CouponRedemption[]
  isOpen: boolean
  onClose: () => void
}

export function CouponAnalyticsDrawer({ coupon, redemptions, isOpen, onClose }: CouponAnalyticsDrawerProps) {
  if (!isOpen || !coupon) return null

  const couponRedemptions = redemptions.filter(r => r.couponId === coupon.id)
  
  const totalDiscount = couponRedemptions.reduce((acc, r) => acc + r.discountAmount, 0)
  const remainingUses = coupon.totalUsageLimit ? Math.max(0, coupon.totalUsageLimit - coupon.usageCount) : 'Unlimited'

  // Mock charting data by grouping redemptions by date
  const chartDataMap: Record<string, number> = {}
  couponRedemptions.forEach(r => {
    chartDataMap[r.date] = (chartDataMap[r.date] || 0) + 1
  })
  const chartData = Object.keys(chartDataMap).sort().map(date => ({
    date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    count: chartDataMap[date]
  }))

  // Fill in some dummy dates if not enough data
  if (chartData.length < 5) {
    chartData.push({ date: 'Oct 5', count: 0 }, { date: 'Oct 6', count: Math.floor(Math.random() * 3) })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink/5">
          <div>
            <h2 className="text-xl font-bold text-ink">Coupon Analytics</h2>
            <p className="text-sm text-ink/60 font-mono mt-1">{coupon.code}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-ink/40 hover:text-ink hover:bg-cloud rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-sky-soft rounded-xl p-4">
              <p className="text-xs font-bold text-sky uppercase tracking-wider mb-1">Total Uses</p>
              <p className="text-2xl font-black text-ink">{coupon.usageCount}</p>
            </div>
            <div className="bg-coral/10 rounded-xl p-4">
              <p className="text-xs font-bold text-coral uppercase tracking-wider mb-1">Total Discount</p>
              <p className="text-2xl font-black text-ink">₹{totalDiscount.toLocaleString()}</p>
            </div>
            <div className="bg-mint/20 rounded-xl p-4">
              <p className="text-xs font-bold text-mint uppercase tracking-wider mb-1">Remaining</p>
              <p className="text-2xl font-black text-ink">{remainingUses}</p>
            </div>
          </div>

          {/* Chart */}
          <div>
            <h3 className="text-sm font-bold text-ink mb-4">Redemptions Over Time</h3>
            <div className="h-64 w-full bg-white border border-ink/5 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Redemptions Table */}
          <div>
            <h3 className="text-sm font-bold text-ink mb-4">Recent Redemptions</h3>
            <div className="border border-ink/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-cloud text-ink/60 font-bold text-xs">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {couponRedemptions.length > 0 ? (
                    couponRedemptions.map(r => (
                      <tr key={r.id}>
                        <td className="px-4 py-3">
                          <Link to="/admin/orders" className="text-sky hover:underline font-medium">
                            {r.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-ink/60">{new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric'})}</td>
                        <td className="px-4 py-3 text-ink">{r.customer}</td>
                        <td className="px-4 py-3 text-right text-coral font-medium">-₹{r.discountAmount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-ink/50">No redemptions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
