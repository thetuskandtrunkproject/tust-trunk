import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Package, MapPin, Truck, AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export const Route = createFileRoute('/order-success')({
  component: OrderSuccessPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      order_id: search.order_id as string | undefined,
      order_number: search.order_number as string | undefined,
      guest_email: search.guest_email as string | undefined,
      requires_review: search.requires_review as boolean | string | undefined,
    }
  }
})

function OrderSuccessPage() {
  const search: any = useSearch({ from: '/order-success' })
  const { user } = useAuth()
  
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!search.order_id && !search.order_number) {
        setIsLoading(false)
        return
      }

      try {
        let res
        if (user && search.order_id) {
          res = await api.get(`/api/v1/orders/${search.order_id}`)
          // API returns an order object directly for GET /orders/{order_id}?
          // Wait, Module 7's router usually returns the order object
          setOrder(res.data)
        } else if (search.order_number && search.guest_email) {
          res = await api.get(`/api/v1/orders/guest/${search.order_number}?email=${encodeURIComponent(search.guest_email)}`)
          setOrder(res.data)
        } else {
          setIsLoading(false)
          return
        }
      } catch (err) {
        console.error("Failed to load order data", err)
        setError("Could not load your order details. Please check your email for confirmation.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [search, user])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cloud">
        <Loader2 className="w-10 h-10 animate-spin text-cta" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] bg-cloud flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-ink/20 mb-6" />
        <h1 className="font-heading font-bold text-4xl text-ink mb-4">Order Details Not Found</h1>
        <p className="text-ink/60 font-medium mb-8 text-center max-w-md">
          {error || "We couldn't find details for your most recent order. If you placed an order, please check your email for the confirmation."}
        </p>
        <Link 
          to="/shop" 
          className="bg-cta text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:shadow-2xl hover:bg-cta/90 transition-all"
        >
          Return to Shop
        </Link>
      </div>
    )
  }

  const isRequiresReview = search.requires_review === true || search.requires_review === 'true'

  return (
    <div className="min-h-screen bg-cloud pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          {isRequiresReview ? (
            <>
              <div className="w-24 h-24 bg-rust/10 rounded-full flex items-center justify-center mb-8 animate-in zoom-in spin-in-12 duration-500 ease-out fill-mode-both">
                <AlertTriangle className="w-12 h-12 text-rust" />
              </div>
              <h1 className="font-heading font-bold text-5xl text-ink mb-4">Order Review Required</h1>
              <p className="text-rust font-bold text-lg max-w-md mb-2">
                Your payment was received but we couldn't complete your order due to stock issues.
              </p>
              <p className="text-ink/60 font-medium text-lg max-w-md">
                You'll receive a full refund within 5-7 business days.
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-mint/60 rounded-full flex items-center justify-center mb-8 animate-in zoom-in spin-in-12 duration-500 ease-out fill-mode-both">
                <CheckCircle2 className="w-12 h-12 text-ink" />
              </div>
              <h1 className="font-heading font-bold text-5xl text-ink mb-4">Order Confirmed</h1>
              <p className="text-ink/60 font-medium text-lg">Thank you for your purchase!</p>
            </>
          )}
          <p className="text-sm font-bold text-ink mt-6 bg-ink/5 border border-ink/10 px-6 py-2 rounded-full">
            Order #{order.order_number || order.orderNumber}
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
              {order.items.length === 0 ? (
                <p className="text-ink/60">No items available.</p>
              ) : (
                order.items.map((item: any, idx: number) => {
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 aspect-[3/4] bg-cloud rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-ink/20" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-ink line-clamp-1">{item.product_name_snapshot}</p>
                        <p className="text-sm text-ink/60 mt-1">Size: {item.size_snapshot} | Qty: {item.quantity}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-ink/10">
            <h3 className="font-bold text-lg text-ink mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ink/50" />
              Delivery Address
            </h3>
            <div className="text-sm text-ink/80 leading-relaxed font-medium">
              <p className="font-bold text-ink">{order.shipping_address.name}</p>
              <p>{order.shipping_address.address1}</p>
              {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
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
                <span>₹{(order.subtotal_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{order.delivery_fee_paise === 0 ? <span className="text-mint font-bold">Free</span> : `₹${(order.delivery_fee_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-ink/10">
                <span className="font-bold text-ink">Total Paid:</span>
                <span className="font-bold text-ink">₹{(order.total_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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

