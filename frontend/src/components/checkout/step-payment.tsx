import { useState } from 'react'
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react'

interface StepPaymentProps {
  onBack: () => void
  onSuccess: () => void
  onFailure: () => void
  totalAmount: number
}

export function StepPayment({ onBack, onSuccess, onFailure, totalAmount }: StepPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMockPayment = (outcome: 'success' | 'failure') => {
    setIsProcessing(true)
    
    // Simulate gateway delay
    setTimeout(() => {
      setIsProcessing(false)
      if (outcome === 'success') {
        onSuccess()
      } else {
        onFailure()
      }
    }, 1500)
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div>
      <h2 className="font-heading font-bold text-4xl text-ink mb-8">Payment</h2>
      
      <div className="bg-white border border-ink/10 rounded-[2rem] p-6 lg:p-12 text-center mb-8 shadow-sm">
        <div className="w-20 h-20 bg-sky/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-sky" />
        </div>
        
        <h3 className="font-heading font-bold text-3xl text-ink mb-4">Razorpay Secure Checkout</h3>
        <p className="text-ink/60 font-medium mb-10 max-w-sm mx-auto">
          You will be redirected to the secure Razorpay portal to complete your payment of <strong className="text-ink">{formatPrice(totalAmount)}</strong>.
        </p>

        <button 
          onClick={() => handleMockPayment('success')}
          disabled={isProcessing}
          className="w-full max-w-sm mx-auto bg-coral text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-coral/90 transition-all disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100 flex items-center justify-center gap-2 mb-12"
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            `Pay ${formatPrice(totalAmount)} with Razorpay`
          )}
        </button>

        {/* Dev Tools */}
        <div className="border-t border-dashed border-ink/20 pt-8 mt-8">
          <p className="text-xs uppercase font-bold tracking-widest text-ink/40 mb-4">Developer Tools (Mock Gateway)</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => handleMockPayment('success')}
              disabled={isProcessing}
              className="text-xs font-bold px-6 py-2.5 rounded-full border border-dashed border-sky text-sky hover:bg-sky/10 transition-colors disabled:opacity-50"
            >
              Simulate Success
            </button>
            <button 
              onClick={() => handleMockPayment('failure')}
              disabled={isProcessing}
              className="text-xs font-bold px-6 py-2.5 rounded-full border border-dashed border-rust text-rust hover:bg-rust/10 transition-colors disabled:opacity-50"
            >
              Simulate Failure
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center pt-4">
        <button 
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="text-ink/60 hover:text-ink font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Details
        </button>
      </div>
    </div>
  )
}
