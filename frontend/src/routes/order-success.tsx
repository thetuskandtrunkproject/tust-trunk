import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { CheckCircle2, Package, MapPin, Truck } from 'lucide-react'
import { mockProducts } from '@/lib/mock-products'

export const Route = createFileRoute('/order-success')({
  component: OrderSuccessPage,
})

function OrderSuccessPage() {
  const location = useLocation()
  const state = location.state as any
  const order = state?.order

  // Friendly Fallback
  if (!order) {
    return (
      <div className="min-h-[70vh] bg-cloud flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-ink/20 mb-6" />
        <h1 className="font-heading font-bold text-4xl text-ink mb-4">No recent order found</h1>
        <p className="text-ink/60 font-medium mb-8 text-center max-w-md">
          We couldn't find details for your most recent order. If you placed an order, please check your email for the confirmation.
        </p>
        <Link 
          to="/shop" 
          className="bg-coral text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:shadow-2xl hover:bg-coral/90 transition-all"
        >
          Return to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cloud pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-mint/60 rounded-full flex items-center justify-center mb-8 animate-in zoom-in spin-in-12 duration-500 ease-out fill-mode-both">
            <CheckCircle2 className="w-12 h-12 text-ink" />
          </div>
          <h1 className="font-heading font-bold text-5xl text-ink mb-4">Order Confirmed</h1>
          <p className="text-ink/60 font-medium text-lg">Thank you for your purchase!</p>
          <p className="text-sm font-bold text-ink mt-6 bg-ink/5 border border-ink/10 px-6 py-2 rounded-full">
            Order #{order.orderNumber}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-ink/10 overflow-hidden mb-8">
          
          <div className="p-6 md:p-8 border-b border-ink/10">
            <h3 className="font-bold text-lg text-ink mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-ink/50" />
              Items Ordered
            </h3>
            <div className="flex flex-col gap-6">
              {order.items.map((item: any, idx: number) => {
                const product = mockProducts.find(p => p.id === item.productId)
                if (!product) return null
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 aspect-[3/4] bg-cloud rounded-xl overflow-hidden shrink-0">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink line-clamp-1">{product.name}</p>
                      <p className="text-sm text-ink/60 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-ink/10">
            <h3 className="font-bold text-lg text-ink mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ink/50" />
              Delivery Address
            </h3>
            <div className="text-sm text-ink/80 leading-relaxed font-medium">
              <p className="font-bold text-ink">{order.shipping.name}</p>
              <p>{order.shipping.address1}</p>
              {order.shipping.address2 && <p>{order.shipping.address2}</p>}
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-sky-soft/20">
            <h3 className="font-bold text-lg text-ink mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-ink/50" />
              Payment Summary
            </h3>
            <div className="flex flex-col gap-2 text-sm text-ink/80 font-medium">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{(order.items.reduce((sum: number, item: any) => sum + ((mockProducts.find(p => p.id === item.productId)?.price || 0) * item.quantity), 0)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{order.items.reduce((sum: number, item: any) => sum + ((mockProducts.find(p => p.id === item.productId)?.price || 0) * item.quantity), 0) >= 3000 ? <span className="text-mint font-bold">Free</span> : '₹60'}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-ink/10">
                <span className="font-bold text-ink">Total Paid:</span>
                <span className="font-bold text-ink">₹{order.totalPaid?.toLocaleString('en-IN') || '0'}</span>
              </div>
              <p className="text-xs text-ink/50 mt-2">Paid securely via Razorpay</p>
              <p className="text-xs text-ink/50">Estimated Delivery: Arriving in 5–7 business days</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-center">
          <Link 
            to="/shop" 
            className="bg-ink text-cloud px-10 py-4 rounded-xl font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  )
}
