import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/order-failed')({
  component: OrderFailedPage,
})

function OrderFailedPage() {
  return (
    <div className="min-h-[70vh] bg-cloud flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-rust/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-rust" />
      </div>
      <h1 className="font-fraunces text-3xl text-ink mb-2">Payment couldn't be completed</h1>
      <p className="text-ink/60 mb-8 text-center max-w-md">
        Your cart is safely saved and nothing was charged. Please try again with a different payment method.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/checkout" 
          className="bg-ink text-cloud px-8 py-3 rounded-full font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors text-center"
        >
          Try Again
        </Link>
        <Link 
          to="/shop" 
          className="bg-transparent border border-ink/20 text-ink px-8 py-3 rounded-full font-medium hover:bg-ink/5 transition-colors text-center"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}
