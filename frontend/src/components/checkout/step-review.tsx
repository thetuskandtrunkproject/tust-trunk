import { useCart } from '@/context/cart-context'
import { mockProducts } from '@/lib/mock-products'
import { ArrowRight } from 'lucide-react'

interface StepReviewProps {
  onNext: () => void
  deliveryFee: number
}

export function StepReview({ onNext, deliveryFee }: StepReviewProps) {
  const { items } = useCart()

  const cartDetails = items.map(item => {
    const product = mockProducts.find(p => p.id === item.productId)
    return { ...item, product }
  }).filter(item => item.product !== undefined)

  const subtotal = cartDetails.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0)
  const total = subtotal + deliveryFee

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="font-fraunces text-2xl text-ink mb-8">Review your order</h2>
      
      <div className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8 mb-8">
        <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-ink/10">
          {cartDetails.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-20 aspect-[3/4] bg-cloud rounded-lg overflow-hidden shrink-0">
                <img src={item.product!.images[0]} alt={item.product!.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1 py-1">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <span className="font-medium text-ink text-lg line-clamp-1">{item.product!.name}</span>
                  <span className="font-medium text-ink text-lg whitespace-nowrap">{formatPrice(item.product!.price * item.quantity)}</span>
                </div>
                <div className="text-sm text-ink/60 mt-auto flex gap-4">
                  <span>Size: {item.size}</span>
                  <span>Color: <span className="inline-block w-3 h-3 rounded-full align-middle ml-1 border border-ink/20" style={{ backgroundColor: item.color }}></span></span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 text-ink/80 mb-8 pb-8 border-b border-ink/10">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xl font-medium text-ink">
          <span>Total</span>
          <span className="font-fraunces text-3xl">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={onNext}
          className="bg-ink text-cloud px-10 py-4 rounded-xl font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors flex items-center gap-2"
        >
          Proceed to Details <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
