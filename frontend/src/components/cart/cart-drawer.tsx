import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { mockProducts } from '@/lib/mock-products'
import { Link, useRouter } from '@tanstack/react-router'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, cartCount } = useCart()
  const router = useRouter()

  if (!isOpen) return null

  // Resolve product details for each cart item
  const cartDetails = items.map(item => {
    const product = mockProducts.find(p => p.id === item.productId)
    return {
      ...item,
      product
    }
  }).filter(item => item.product !== undefined) // filter out if somehow not found

  const subtotal = cartDetails.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0)
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-cloud h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink/10 bg-white/50 shrink-0">
          <h2 className="font-fraunces text-2xl text-ink">Your Cart ({cartCount})</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-ink/60 hover:text-ink transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
          {cartDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <p className="text-ink/60">Your cart is currently empty.</p>
              <button 
                onClick={onClose}
                className="bg-ink text-cloud px-8 py-3 rounded-full font-medium hover:bg-sky-soft hover:text-ink transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartDetails.map((item, idx) => (
              <div key={`${item.productId}-${item.size}-${idx}`} className="flex gap-4 group">
                <div className="w-24 aspect-[3/4] bg-ink/5 rounded-lg overflow-hidden shrink-0">
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
                    <span className="font-medium text-ink">{formatPrice(item.product!.price)}</span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs text-ink/60 bg-ink/5 px-2 py-1 rounded-md">
                      Size: {item.size}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between border border-ink/20 rounded-md px-2 py-1.5 w-24">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                        }} 
                        className="text-ink/60 hover:text-ink disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-ink">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} 
                        className="text-ink/60 hover:text-ink"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-ink/40 hover:text-blush transition-colors p-2"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartDetails.length > 0 && (
          <div className="border-t border-ink/10 p-6 bg-white/80 backdrop-blur-md shrink-0">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-ink font-medium">Subtotal</span>
              <span className="text-xl font-fraunces text-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-ink/50 mb-4 text-center">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={() => {
                onClose()
                router.navigate({ to: '/checkout' })
              }}
              className="w-full bg-ink text-cloud py-4 rounded-lg font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
