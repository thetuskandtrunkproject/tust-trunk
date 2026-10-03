import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { Link, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-context'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, cartCount, serverSubtotal } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  if (!isOpen) return null

  // Since guest users don't have product details from the backend,
  // we filter out items missing product data to avoid crashes,
  // but this means the guest cart will not display correctly until resolved.
  const cartDetails = items.filter(item => item.product !== undefined && item.variant !== undefined)

  // Use serverSubtotal if logged in, otherwise local computation (which will be 0 for guests without mock data)
  const subtotal = user ? serverSubtotal : cartDetails.reduce((sum, item) => sum + (item.variant!.price * item.quantity), 0)
  
  const formatPrice = (price?: number) => (price ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-cloud h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out fill-mode-both">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink/10 bg-white/50 shrink-0">
          <h2 className="font-heading font-bold text-3xl text-ink">Your Cart ({cartCount})</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-ink/60 hover:text-ink transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 bg-mint/40 rounded-[3rem] p-8 m-4">
              <p className="text-ink/60 font-medium">Your cart is currently empty.</p>
              <button 
                onClick={onClose}
                className="bg-cta text-white px-8 py-4 rounded-full font-bold shadow-md hover:scale-105 hover:shadow-lg transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartDetails.map((item, idx) => (
              <div key={`${item.variant_id}-${idx}`} className={`flex gap-4 group ${item.is_available === false ? 'opacity-50 grayscale' : ''}`}>
                <div className="w-24 aspect-[3/4] bg-ink/5 rounded-2xl overflow-hidden shrink-0">
                  <img src={item.product!.images[0]} alt={item.product!.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col flex-1 py-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <Link 
                      to="/products/$slug" 
                      params={{ slug: item.product!.slug }}
                      onClick={onClose}
                      className="font-medium text-ink hover:text-sky transition-colors line-clamp-1"
                    >
                      {item.product!.name}
                    </Link>
                    <span className="font-medium text-ink">{formatPrice(item.variant!.price)}</span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs text-ink/60 bg-ink/5 px-2 py-1 rounded-md mr-2">
                      Size: {item.variant!.size}
                    </span>
                    {item.is_available === false && (
                      <span className="text-xs text-rust font-bold bg-rust/10 px-2 py-1 rounded-md">
                        No longer available
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between border-2 border-ink/20 rounded-full px-3 py-1.5 w-28">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.variant_id, item.quantity - 1)
                          }
                        }} 
                        className="text-ink/60 hover:text-ink disabled:opacity-50"
                        disabled={item.quantity <= 1 || item.is_available === false}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-ink">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)} 
                        className="text-ink/60 hover:text-ink disabled:opacity-50"
                        disabled={item.is_available === false}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.variant_id)}
                      className="text-ink/40 hover:text-watermelon hover:scale-110 transition-all p-2"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartDetails.length > 0 && (
          <div className="border-t border-ink/10 p-6 bg-sunshine/20 shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-ink font-medium">Subtotal</span>
              <span className="text-xl font-bold text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-ink font-medium">Delivery</span>
              <span className="text-xl font-bold text-ink">
                {subtotal >= 3000 ? <span className="text-mint">Free</span> : '₹60'}
              </span>
            </div>
            <button 
              onClick={() => {
                onClose()
                router.navigate({ to: '/checkout' })
              }}
              disabled={cartDetails.some(item => item.is_available === false)}
              className="w-full bg-cta text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-cta/90 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

