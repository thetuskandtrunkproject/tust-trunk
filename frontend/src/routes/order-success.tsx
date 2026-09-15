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
        <h1 className="font-fraunces text-3xl text-ink mb-2">No recent order found</h1>
        <p className="text-ink/60 mb-8 text-center max-w-md">
          We couldn't find details for your most recent order. If you placed an order, please check your email for the confirmation.
        </p>
        <Link 
          to="/shop" 
          className="bg-ink text-cloud px-8 py-3 rounded-full font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors"
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
          <div className="w-20 h-20 bg-sky/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-sky" />
          </div>
          <h1 className="font-fraunces text-4xl text-ink mb-2">Order Confirmed</h1>
          <p className="text-ink/60">Thank you for your purchase!</p>
          <p className="text-sm font-medium text-ink mt-4 bg-ink/5 px-4 py-1.5 rounded-full">
            Order #{order.orderNumber}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-ink/5 overflow-hidden mb-8">
          
          <div className="p-6 md:p-8 border-b border-ink/5">
            <h3 className="font-medium text-ink mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-ink/50" />
              Items Ordered
            </h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item: any, idx: number) => {
                const product = mockProducts.find(p => p.id === item.productId)
                if (!product) return null
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 aspect-[3/4] bg-ink/5 rounded overflow-hidden shrink-0">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink line-clamp-1">{product.name}</p>
                      <p className="text-xs text-ink/60">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-ink/5">
            <h3 className="font-medium text-ink mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ink/50" />
              Delivery Address
            </h3>
            <div className="text-sm text-ink/80 leading-relaxed">
              <p className="font-medium">{order.shipping.name}</p>
              <p>{order.shipping.address1}</p>
              {order.shipping.address2 && <p>{order.shipping.address2}</p>}
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-ink/5">
            <h3 className="font-medium text-ink mb-2 flex items-center gap-2">
              <Truck className="w-5 h-5 text-ink/50" />
              Delivery & Payment
            </h3>
            <div className="flex flex-col gap-1 text-sm text-ink/80">
              <p>Estimated Delivery: <span className="font-medium text-ink">Arriving in 5–7 business days</span></p>
              <p>Total Paid: <span className="font-medium text-ink">₹{order.totalPaid?.toLocaleString('en-IN') || '0'}</span> via Razorpay</p>
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
