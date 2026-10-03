import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useToast } from '@/context/toast-context'
import { api } from '@/lib/api'

interface StepReviewProps {
  onNext: () => void
  deliveryFee: number
  items: any[]
  subtotal: number
  couponCode?: string | null
  discountAmount?: number
  onApplyCoupon?: (code: string, discount: number, type: string) => void
}

export function StepReview({ onNext, deliveryFee, items, subtotal, couponCode, discountAmount = 0, onApplyCoupon }: StepReviewProps) {
  const [promoInput, setPromoInput] = useState(couponCode || '')
  const [isApplying, setIsApplying] = useState(false)
  const { showToast } = useToast()

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoInput.trim()) return
    setIsApplying(true)
    try {
      const res = await api.post('/api/v1/checkout/apply-coupon', {
        code: promoInput,
        items: items.map(i => ({ variant_id: i.variant_id, quantity: i.quantity }))
      })
      if (onApplyCoupon) {
        onApplyCoupon(res.data.code, res.data.discount_paise, res.data.discount_type)
      }
      showToast('Coupon applied successfully!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Invalid or expired coupon', 'error')
      setPromoInput('')
    } finally {
      setIsApplying(false)
    }
  }
  // Guest carts missing product data will be filtered out to avoid crashes,
  // but guests should be logged in to sync and render correctly.
  const cartDetails = items.filter(item => item.product !== undefined && item.variant !== undefined)

  const total = subtotal + deliveryFee - discountAmount

  const formatPrice = (price?: number) => ((price ?? 0) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  return (
    <div>
      <h2 className="font-heading font-bold text-4xl text-ink mb-8">Review your order</h2>
      
      <div className="bg-white border border-ink/10 rounded-[2rem] overflow-hidden mb-8 shadow-sm">
        <div className="p-6 lg:p-8 flex flex-col gap-6 border-b border-ink/10">
          {cartDetails.length === 0 ? (
            <p className="text-ink/60 font-medium">Your cart is empty.</p>
          ) : (
            cartDetails.map((item, idx) => (
              <div key={`${item.variant_id}-${idx}`} className={`flex gap-4 ${item.is_available === false ? 'opacity-50 grayscale' : ''}`}>
                <div className="w-20 aspect-[3/4] bg-cloud rounded-2xl overflow-hidden shrink-0">
                  <img src={item.product!.images[0]} alt={item.product!.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 py-1">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <span className="font-medium text-ink text-lg line-clamp-1">{item.product!.name}</span>
                    <span className="font-bold text-ink text-lg whitespace-nowrap">{formatPrice(item.variant!.price * item.quantity)}</span>
                  </div>
                  <div className="text-sm font-medium text-ink/60 mt-auto flex gap-4">
                    <span>Size: {item.variant!.size}</span>
                    <span>Qty: {item.quantity}</span>
                    {item.is_available === false && (
                      <span className="text-rust font-bold">No longer available</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code */}
        <div className="p-6 lg:p-8 border-b border-ink/10">
          <form onSubmit={handleApplyPromo} className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Promo code"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              disabled={!!couponCode || isApplying}
              className="flex-1 bg-white border border-ink/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-ink/30 focus:ring-1 focus:ring-ink/30 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!!couponCode || isApplying || !promoInput.trim()}
              className="bg-ink text-cloud px-6 py-3 rounded-lg text-sm font-bold hover:bg-sky-soft hover:text-ink transition-colors disabled:opacity-50"
            >
              {isApplying ? 'Applying...' : couponCode ? 'Applied' : 'Apply'}
            </button>
          </form>
          {couponCode && (
            <p className="text-xs text-sky mt-3 font-medium">Coupon '{couponCode}' applied!</p>
          )}
        </div>

        <div className="bg-sunshine/20 p-6 lg:p-8">
          <div className="flex flex-col gap-4 text-ink/80 mb-6 pb-6 border-b border-ink/10">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between font-bold text-sky">
                <span>Discount ({couponCode})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xl font-bold text-ink">
            <span>Total</span>
            <span className="font-heading text-3xl">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={onNext}
          disabled={cartDetails.length === 0 || cartDetails.some(item => item.is_available === false)}
          className="bg-cta text-white px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-cta/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
        >
          Proceed to Details <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

