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
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="font-fraunces text-2xl text-ink mb-8">Payment</h2>
      
      <div className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-12 text-center mb-8">
        <div className="w-16 h-16 bg-sky/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-sky" />
        </div>
        
        <h3 className="font-fraunces text-3xl text-ink mb-2">Razorpay Secure Checkout</h3>
        <p className="text-ink/60 mb-10 max-w-sm mx-auto">
          You will be redirected to the secure Razorpay portal to complete your payment of <strong className="text-ink">{formatPrice(totalAmount)}</strong>.
        </p>

        <button 
          onClick={() => handleMockPayment('success')}
          disabled={isProcessing}
          className="w-full max-w-sm mx-auto bg-[#3395FF] text-white py-4 rounded-xl font-medium shadow-xl hover:bg-[#2B80DB] transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 mb-12"
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            `Pay ${formatPrice(totalAmount)} with Razorpay`
          )}
        </button>

        {/* Dev Tools */}
        <div className="border-t border-dashed border-ink/20 pt-8 mt-8">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-4">Developer Tools (Mock Gateway)</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => handleMockPayment('success')}
              disabled={isProcessing}
              className="text-xs font-medium px-4 py-2 rounded border border-dashed border-sky text-sky hover:bg-sky/5 transition-colors disabled:opacity-50"
            >
              Simulate Success
            </button>
            <button 
              onClick={() => handleMockPayment('failure')}
              disabled={isProcessing}
              className="text-xs font-medium px-4 py-2 rounded border border-dashed border-rust text-rust hover:bg-rust/5 transition-colors disabled:opacity-50"
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
          className="text-ink/60 hover:text-ink font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </button>
      </div>
    </div>
  )
}
