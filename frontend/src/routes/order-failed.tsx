import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/order-failed')({
  component: OrderFailedPage,
})

function OrderFailedPage() {
  return (
    <div className="min-h-[70vh] bg-cloud flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 bg-rust/20 rounded-full flex items-center justify-center mb-8 animate-in zoom-in spin-in-12 duration-500 ease-out fill-mode-both">
        <AlertCircle className="w-12 h-12 text-rust" />
      </div>
      <h1 className="font-heading font-bold text-4xl text-ink mb-4 text-center">Payment couldn't be completed</h1>
      <p className="text-ink/60 font-medium mb-10 text-center max-w-md text-lg">
        Your cart is safely saved and nothing was charged. Please try again with a different payment method.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          to="/checkout" 
          className="bg-ink text-white px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-ink/90 transition-all text-center"
        >
          Try Again
        </Link>
        <Link 
          to="/shop" 
          className="bg-transparent border-2 border-ink/20 text-ink px-10 py-4 rounded-full font-bold hover:scale-105 hover:bg-ink/5 transition-all text-center"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}

