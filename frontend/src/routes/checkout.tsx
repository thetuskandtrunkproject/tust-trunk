import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/cart-context'
import { api } from '@/lib/api'
import { StepReview } from '@/components/checkout/step-review'
import { StepDetails } from '@/components/checkout/step-details'
import { StepPayment } from '@/components/checkout/step-payment'
import { useAuth } from '@/context/auth-context'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
  validateSearch: (search: Record<string, unknown>): { buyNow?: string; qty?: number } => {
    return {
      buyNow: search.buyNow as string | undefined,
      qty: search.qty ? Number(search.qty) : undefined,
    }
  }
})

function CheckoutPage() {
  const { buyNow, qty } = Route.useSearch()
  const { items: cartItems, serverSubtotal: cartSubtotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If cart is empty AND we are not in a buy-now flow, redirect to shop
    if (cartItems.length === 0 && !buyNow) {
      navigate({ to: '/shop', replace: true })
    }
  }, [cartItems.length, buyNow, navigate])

  const [buyNowItem, setBuyNowItem] = useState<any>(null)
  const [isLoadingBuyNow, setIsLoadingBuyNow] = useState(!!buyNow)

  useEffect(() => {
    if (buyNow && qty) {
      const fetchBuyNow = async () => {
        try {
          const res = await api.get(`/public/variants/resolve?ids=${buyNow}`)
          const item = res.data.items.find((i: any) => i.variant.id === buyNow)
          if (item) {
            setBuyNowItem({
              variant_id: item.variant.id,
              quantity: qty,
              product: item.product,
              variant: item.variant,
              is_available: item.is_available
            })
          }
        } catch(e) {
          console.error("Failed to load buy now item", e)
        } finally {
          setIsLoadingBuyNow(false)
        }
      }
      fetchBuyNow()
    } else {
      setIsLoadingBuyNow(false)
    }
  }, [buyNow, qty])

  const [savedAddresses, setSavedAddresses] = useState<any[]>([])

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return
      
      // Auto-fill email and phone from user profile immediately
      setContact(prev => ({ ...prev, email: user.email || '', phone: user.phone || '' }))
      
      try {
        const res = await api.get('/api/v1/addresses')
        setSavedAddresses(res.data)
        const def = res.data.find((a: any) => a.is_default) || res.data[0]
        if (def) {
          setShipping({
            name: def.name || '',
            address1: def.address1 || '',
            address2: def.address2 || '',
            city: def.city || '',
            state: def.state || '',
            pincode: def.pincode || '',
            phone: def.phone || ''
          })
        }
      } catch (err) {
        console.error("Failed to load saved addresses")
      }
    }
    fetchAddresses()
  }, [user])

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  
  // Shared Checkout State
  const [contact, setContact] = useState({ email: '', phone: '' })
  const [shipping, setShipping] = useState({ name: '', address1: '', address2: '', city: '', state: '', pincode: '', phone: '' })
  const [saveDefault, setSaveDefault] = useState(false)
  
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [couponType, setCouponType] = useState<string | null>(null)
  const [discountPaise, setDiscountPaise] = useState(0)
  
  // Filter out items missing product data to avoid crashes (guest cart limitation)
  const items = buyNowItem ? [buyNowItem] : cartItems
  const isBuyNowFlow = !!buyNowItem

  const cartDetails = items.filter(item => item.product !== undefined && item.variant !== undefined)

  let subtotal = 0
  if (isBuyNowFlow && buyNowItem) {
    subtotal = buyNowItem.variant.price * buyNowItem.quantity
  } else {
    subtotal = user ? cartSubtotal : cartDetails.reduce((sum, item) => sum + (item.variant!.price * item.quantity), 0)
  }
  
  const isFreeShipping = couponType === 'free_shipping'
  const deliveryFee = (subtotal >= 300000 || isFreeShipping) ? 0 : 6000 // Free shipping over ₹3000, else ₹60
  const discountAmount = discountPaise
  const totalAmount = subtotal + deliveryFee - discountAmount


  const handleNextToDetails = () => setCurrentStep(2)
  const handleBackToReview = () => setCurrentStep(1)
  
  const handleNextToPayment = (newContact: any, newShipping: any, newSaveDefault: boolean) => {
    setContact(newContact)
    setShipping(newShipping)
    setSaveDefault(newSaveDefault)
    setCurrentStep(3)
  }
  const handleBackToDetails = () => setCurrentStep(2)

  if (isLoadingBuyNow) {
    return <div className="min-h-screen bg-cloud pt-24 text-center">Loading checkout...</div>
  }

  if (items.length === 0 && !buyNow) return null

  return (
    <div className="min-h-screen bg-cloud pt-8 pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-ink/10 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-coral transition-all duration-500 -z-10 -translate-y-1/2 rounded-full" style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}></div>
          
          <div className="flex flex-col items-center gap-2 bg-cloud px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 shadow-sm ${currentStep >= 1 ? 'bg-cta text-white scale-110' : 'bg-ink/10 text-ink/40'}`}>1</div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 1 ? 'text-cta' : 'text-ink/40'}`}>Review</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cloud px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 shadow-sm ${currentStep >= 2 ? 'bg-cta text-white scale-110' : 'bg-ink/10 text-ink/40'}`}>2</div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 2 ? 'text-cta' : 'text-ink/40'}`}>Details</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cloud px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 shadow-sm ${currentStep >= 3 ? 'bg-cta text-white scale-110' : 'bg-ink/10 text-ink/40'}`}>3</div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 3 ? 'text-cta' : 'text-ink/40'}`}>Payment</span>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="overflow-hidden">
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right fade-in duration-500 ease-out fill-mode-both">
              <StepReview 
                onNext={handleNextToDetails} 
                deliveryFee={deliveryFee} 
                items={items} 
                subtotal={subtotal} 
                couponCode={couponCode}
                discountAmount={discountAmount}
                onApplyCoupon={(code, discount, type) => {
                  setCouponCode(code)
                  setDiscountPaise(discount)
                  setCouponType(type)
                }}
                onRemoveCoupon={() => {
                  setCouponCode(null)
                  setDiscountPaise(0)
                  setCouponType(null)
                }}
              />
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="animate-in slide-in-from-right fade-in duration-500 ease-out fill-mode-both">
              <StepDetails 
                onNext={handleNextToPayment} 
                onBack={handleBackToReview}
                initialContact={contact}
                initialShipping={shipping}
                initialSaveDefault={saveDefault}
                deliveryFee={deliveryFee}
                savedAddresses={savedAddresses}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right fade-in duration-500 ease-out fill-mode-both">
              <StepPayment 
                onBack={handleBackToDetails}
                contact={contact}
                shipping={shipping}
                totalAmount={totalAmount}
                items={items}
                isBuyNowFlow={isBuyNowFlow}
                couponCode={couponCode}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

