import { ArrowRight } from 'lucide-react'

interface StepReviewProps {
  onNext: () => void
  deliveryFee: number
  items: any[]
  subtotal: number
}

export function StepReview({ onNext, deliveryFee, items, subtotal }: StepReviewProps) {
  // Guest carts missing product data will be filtered out to avoid crashes,
  // but guests should be logged in to sync and render correctly.
  const cartDetails = items.filter(item => item.product !== undefined && item.variant !== undefined)

  const total = subtotal + deliveryFee

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

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
          className="bg-coral text-white px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-coral/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
        >
          Proceed to Details <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
