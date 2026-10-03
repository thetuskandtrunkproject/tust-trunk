import { useState } from 'react'
import { useCart } from '@/context/cart-context'
import { useToast } from '@/context/toast-context'
import { useAuth } from '@/context/auth-context'

interface OrderSummaryProps {
  deliveryFee: number
  onDiscountChange: (discount: number) => void
}

export function OrderSummary({ deliveryFee, onDiscountChange }: OrderSummaryProps) {
  const { items, serverSubtotal } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [promoCode, setPromoCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  // Filter out items missing product data to avoid crashes (guest cart limitation)
  const cartDetails = items.filter(item => item.product !== undefined && item.variant !== undefined)

  const subtotal = user ? serverSubtotal : cartDetails.reduce((sum, item) => sum + (item.variant!.price * item.quantity), 0)
  
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    setIsApplying(true)
    
    // Simulate network request
    setTimeout(() => {
      setIsApplying(false)
      if (promoCode.toUpperCase() === 'TUSK10') {
        const discountAmount = subtotal * 0.10
        setAppliedPromo(promoCode.toUpperCase())
        onDiscountChange(discountAmount)
        showToast('Promo code applied successfully!')
      } else {
        showToast('Invalid or expired promo code')
        setPromoCode('')
      }
    }, 600)
  }

  const formatPrice = (price?: number) => (price ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="bg-ink/5 rounded-2xl p-6 lg:p-8 sticky top-24">
      <h2 className="font-fraunces text-2xl text-ink mb-6">Order Summary</h2>

      {/* Line Items */}
      <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-ink/10 max-h-[40vh] overflow-y-auto hide-scrollbar">
        {cartDetails.length === 0 ? (
           <p className="text-ink/60 text-sm font-medium">Your cart is empty.</p>
        ) : (
          cartDetails.map((item, idx) => (
            <div key={`${item.variant_id}-${idx}`} className={`flex gap-4 ${item.is_available === false ? 'opacity-50 grayscale' : ''}`}>
              <div className="w-16 aspect-[3/4] bg-white rounded-md overflow-hidden shrink-0">
                <img src={item.product!.images[0]} alt={item.product!.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1 py-0.5">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-medium text-ink text-sm line-clamp-1">{item.product!.name}</span>
                  <span className="font-medium text-ink text-sm">{formatPrice(item.variant!.price * item.quantity)}</span>
                </div>
                <div className="text-xs text-ink/60 mt-auto flex flex-col gap-0.5">
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
      <div className="mb-6 pb-6 border-b border-ink/10">
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <input
            type="text"
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            disabled={appliedPromo !== null || isApplying}
            className="flex-1 bg-white border border-ink/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-ink/30 focus:ring-1 focus:ring-ink/30 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={appliedPromo !== null || isApplying || !promoCode.trim()}
            className="bg-ink text-cloud px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-soft hover:text-ink transition-colors disabled:opacity-50"
          >
            {isApplying ? 'Applying...' : appliedPromo ? 'Applied' : 'Apply'}
          </button>
        </form>
        {appliedPromo && (
          <p className="text-xs text-sky mt-2 font-medium">10% off ({appliedPromo}) applied</p>
        )}
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-3 text-sm text-ink/80 mb-6 pb-6 border-b border-ink/10">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between text-sky font-medium">
            <span>Discount (10%)</span>
            <span>-{formatPrice(subtotal * 0.10)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-lg font-medium text-ink">
        <span>Total</span>
        <span className="font-fraunces text-2xl">{formatPrice(subtotal + deliveryFee - (appliedPromo ? subtotal * 0.10 : 0))}</span>
      </div>
    </div>
  )
}

