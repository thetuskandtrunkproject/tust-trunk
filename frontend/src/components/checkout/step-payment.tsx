import { useState } from 'react'
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useCart } from '@/context/cart-context'
import { useNavigate } from '@tanstack/react-router'
import { handleResendVerification } from '@/lib/auth-actions'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/context/toast-context'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface StepPaymentProps {
  onBack: () => void
  contact: any
  shipping: any
  totalAmount: number
  items: any[]
  isBuyNowFlow?: boolean
  couponCode?: string | null
}

export function StepPayment({ onBack, contact, shipping, totalAmount, items, isBuyNowFlow, couponCode }: StepPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const { user } = useAuth()
  
  const { clearCart } = useCart()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handlePayment = async () => {
    setIsProcessing(true)
    setErrorMsg(null)
    setNeedsVerification(false)
    
    try {
      // 1. Create order
      const createRes = await api.post('/api/v1/checkout/create-order', {
        items: items.map(i => ({ variant_id: i.variant_id, quantity: i.quantity })),
        contact,
        shipping,
        coupon_code: couponCode
      })
      
      const { razorpay_order_id, amount_paise, currency, key_id } = createRes.data
      
      // 2. Init Razorpay
      const options = {
        key: key_id,
        amount: amount_paise,
        currency: currency,
        name: "The Tusk & Trunk",
        description: "Order Payment",
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/api/v1/checkout/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
            
            // Success or requires_review
            if (!isBuyNowFlow) {
              await clearCart()
            }
            navigate({
              to: '/order-success',
              search: { 
                order_id: verifyRes.data.order_id,
                order_number: verifyRes.data.order_number,
                guest_email: user ? undefined : contact.email,
                requires_review: verifyRes.data.requires_review
              }
            })
          } catch (err: any) {
            console.error(err)
            navigate({ to: '/order-failed' })
          }
        },
        prefill: {
          name: shipping.name,
          email: contact.email,
          contact: contact.phone
        },
        theme: {
          color: "#F4715A" // coral
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false)
          }
        }
      }
      
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', async function (response: any) {
        console.error(response.error)

        // Step 5 fallback: Razorpay's SDK can fire 'payment.failed' even in
        // cases where the bank DID deduct money (common in UPI/netbanking flows
        // where the app event and the actual settlement race). Before giving up,
        // we ask our backend to check Razorpay's API directly.
        //
        // We wait 2 s first to give the server-to-server webhook a head start —
        // if the webhook already committed the order, the check-payment endpoint
        // will return the committed order via the fast DB path (no Razorpay API call).
        try {
          await new Promise<void>(resolve => setTimeout(resolve, 2000))
          const checkRes = await api.get(`/api/v1/checkout/check-payment/${razorpay_order_id}`)
          if (checkRes.data.committed) {
            if (!isBuyNowFlow) await clearCart()
            navigate({
              to: '/order-success',
              search: {
                order_id: checkRes.data.order_id,
                order_number: checkRes.data.order_number,
                guest_email: user ? undefined : contact.email,
                requires_review: checkRes.data.requires_review ?? false,
              }
            })
            return
          }
        } catch (checkErr) {
          // Best-effort only — if the check itself fails (e.g. gateway 502),
          // fall through to /order-failed rather than leaving the user stuck.
          console.error('Payment status check failed:', checkErr)
        }

        navigate({ to: '/order-failed' })
      })
      rzp.open()
      
    } catch (err: any) {
      console.error(err)
      setIsProcessing(false)
      
      if (err.response) {
        if (err.response.status === 403) {
          setNeedsVerification(true)
          setErrorMsg("Your email is not verified. Please verify your email to continue.")
        } else if (err.response.status === 400) {
          setErrorMsg(`Checkout failed: ${err.response.data.detail || 'Insufficient stock or invalid items in cart. Please review your cart.'}`)
        } else {
          setErrorMsg("Failed to initiate checkout. Please try again.")
        }
      } else {
        setErrorMsg("Network error. Please try again.")
      }
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    const res = await handleResendVerification()
    if (res.success) {
      showToast("Verification email sent! Please check your inbox.")
    } else {
      showToast(res.error || "Failed to resend verification email.")
    }
    setIsResending(false)
  }

  const formatPrice = (price?: number) => (price ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

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

        {errorMsg && (
          <div className="mb-8 p-4 bg-rust/10 text-rust font-bold rounded-xl max-w-sm mx-auto text-left">
            <p>{errorMsg}</p>
            {needsVerification && (
              <button 
                onClick={handleResend}
                disabled={isResending}
                className="mt-4 px-6 py-2 bg-rust text-white rounded-full hover:bg-rust/90 transition-colors disabled:opacity-50 text-sm"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        )}

        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full max-w-sm mx-auto bg-coral text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-coral/90 transition-all disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100 flex items-center justify-center gap-2 mb-12"
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            `Pay ${formatPrice(totalAmount)} with Razorpay`
          )}
        </button>

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
