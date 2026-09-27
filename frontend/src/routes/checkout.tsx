import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/cart-context'
import { StepReview } from '@/components/checkout/step-review'
import { StepDetails } from '@/components/checkout/step-details'
import { StepPayment } from '@/components/checkout/step-payment'
import { mockProducts } from '@/lib/mock-products'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  const { items, clearCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    // If cart is empty, redirect to shop
    if (items.length === 0) {
      navigate({ to: '/shop', replace: true })
    }
  }, [items, navigate])

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  
  // Shared Checkout State
  const [contact, setContact] = useState({ email: '', phone: '' })
  const [shipping, setShipping] = useState({ name: '', address1: '', address2: '', city: '', state: '', pincode: '' })
  const [saveDefault, setSaveDefault] = useState(false)
  
  const deliveryFee = subtotal >= 3000 ? 0 : 60 // Free shipping over ₹3000, else ₹60

  const handleNextToDetails = () => setCurrentStep(2)
  const handleBackToReview = () => setCurrentStep(1)
  
  const handleNextToPayment = (newContact: any, newShipping: any, newSaveDefault: boolean) => {
    setContact(newContact)
    setShipping(newShipping)
    setSaveDefault(newSaveDefault)
    setCurrentStep(3)
  }
  const handleBackToDetails = () => setCurrentStep(2)

  // Calculate total for payment step
  const subtotal = items.reduce((sum, item) => {
    const product = mockProducts.find(p => p.id === item.productId)
    return sum + ((product?.price || 0) * item.quantity)
  }, 0)
  const totalAmount = subtotal + deliveryFee

  const handlePaymentSuccess = () => {
    const orderNumber = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    const orderData = {
      orderNumber,
      items,
      shipping,
      deliveryMethod: 'standard', // static now
      paymentMethod: 'razorpay',
      totalPaid: totalAmount,
    }

    clearCart()
    navigate({
      to: '/order-success',
      state: { order: orderData }
    })
  }

  const handlePaymentFailure = () => {
    navigate({ to: '/order-failed' })
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-cloud pt-8 pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-ink/10 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-coral transition-all duration-500 -z-10 -translate-y-1/2 rounded-full" style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}></div>
          
          <div className="flex flex-col items-center gap-2 bg-cloud px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 shadow-sm ${currentStep >= 1 ? 'bg-coral text-white scale-110' : 'bg-ink/10 text-ink/40'}`}>1</div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 1 ? 'text-coral' : 'text-ink/40'}`}>Review</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cloud px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 shadow-sm ${currentStep >= 2 ? 'bg-coral text-white scale-110' : 'bg-ink/10 text-ink/40'}`}>2</div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 2 ? 'text-coral' : 'text-ink/40'}`}>Details</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cloud px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 shadow-sm ${currentStep >= 3 ? 'bg-coral text-white scale-110' : 'bg-ink/10 text-ink/40'}`}>3</div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 3 ? 'text-coral' : 'text-ink/40'}`}>Payment</span>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="overflow-hidden">
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right fade-in duration-500 ease-out fill-mode-both">
              <StepReview onNext={handleNextToDetails} deliveryFee={deliveryFee} />
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
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right fade-in duration-500 ease-out fill-mode-both">
              <StepPayment 
                onBack={handleBackToDetails}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                totalAmount={totalAmount}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
