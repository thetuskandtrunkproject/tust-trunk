import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { ChevronRight, Package, MapPin, Check, Truck, Clock, XCircle, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/account/orders')({
  component: AccountOrdersPage,
})

function AccountOrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/v1/orders')
        setOrders(res.data.orders)
      } catch (err) {
        console.error("Failed to fetch orders", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-IN', options)
  }

  const toggleExpand = (orderNumber: string) => {
    setExpandedOrder(expandedOrder === orderNumber ? null : orderNumber)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-mint/50 text-ink border-mint/20 font-bold'
      case 'Shipped': return 'bg-sky/20 text-ink border-sky/20 font-bold'
      case 'Out for Delivery': return 'bg-sky/20 text-ink border-sky/20 font-bold'
      case 'Processing': return 'bg-sunshine/50 text-ink border-sunshine/30 font-bold'
      case 'Cancelled': return 'bg-rust/20 text-rust border-rust/20 font-bold'
      case 'requires_review': return 'bg-rust/50 text-ink border-rust/30 font-bold'
      default: return 'bg-ink/5 text-ink border-ink/10 font-bold'
    }
  }

  if (isLoading) {
    return <div className="p-12 text-center text-ink/60 font-bold animate-pulse">Loading orders...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center border border-ink/10 shadow-sm flex flex-col items-center">
        <Package className="w-20 h-20 text-ink/20 mb-6" />
        <h2 className="font-heading font-bold text-4xl text-ink mb-4">No orders yet</h2>
        <p className="text-ink/60 font-medium mb-8 max-w-sm">When you place an order, it will appear here so you can track its status.</p>
        <Link to="/shop" className="bg-coral text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-coral/90 transition-all">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-4xl font-heading font-bold text-ink mb-8">Order History</h2>
      
      <div className="flex flex-col gap-6">
        {orders.map((order, idx) => {
          const isExpanded = expandedOrder === order.order_number
          
          // Stepper logic
          const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered']
          const isCancelled = order.status === 'Cancelled'
          const isRequiresReview = order.status === 'requires_review'
          const currentStepIndex = steps.indexOf(order.status)

          return (
            <div 
              key={order.order_number} 
              className="bg-white border border-ink/10 rounded-[2rem] shadow-sm overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${Math.min(idx * 100, 500)}ms` }}
            >
              
              {/* Collapsed View / Header */}
              <div 
                onClick={() => toggleExpand(order.order_number)}
                className="p-5 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-ink/[0.02] transition-colors gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-lg text-ink">Order #{order.order_number}</span>
                  <span className="text-sm font-medium text-ink/60">{formatDate(order.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-8 justify-between sm:justify-end">
                  <div className="flex flex-col sm:items-end gap-1.5">
                    <span className="font-bold text-lg text-ink">{formatPrice(order.total_paise / 100)}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status === 'requires_review' ? 'Action Required' : order.status}
                    </span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2">
                    {/* Thumbnails preview */}
                    <div className="flex -space-x-2 mr-4">
                      {order.items.slice(0, 3).map((item: any, idx: number) => {
                        return (
                          <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-cloud overflow-hidden z-10 flex items-center justify-center">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-ink/20" />
                            )}
                          </div>
                        )
                      })}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-ink/5 flex items-center justify-center text-xs font-medium text-ink/60 z-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <ChevronRight className={`w-5 h-5 text-ink/40 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-ink/10 bg-ink/[0.02] p-5 md:p-8 animate-in slide-in-from-top-4 duration-500">
                  
                  {/* Status Stepper */}
                  <div className="mb-12 max-w-2xl mx-auto pt-6">
                    {isCancelled ? (
                      <div className="flex flex-col items-center justify-center text-rust gap-2">
                        <XCircle className="w-12 h-12" />
                        <span className="font-bold text-lg">Order Cancelled</span>
                        <p className="text-sm text-ink/60 text-center mt-2 max-w-xs font-medium">We have cancelled this order as requested. No charges were made.</p>
                      </div>
                    ) : isRequiresReview ? (
                      <div className="flex flex-col items-center justify-center text-rust gap-2">
                        <AlertTriangle className="w-12 h-12" />
                        <span className="font-bold text-lg">Review Required</span>
                        <p className="text-sm text-ink/60 text-center mt-2 max-w-sm font-medium">
                          Your payment was received but we couldn't complete your order due to stock issues. 
                          You'll receive a full refund within 5-7 business days.
                        </p>
                      </div>
                    ) : (
                      <div className="relative flex justify-between">
                        <div className="absolute top-1/2 left-0 w-full h-2 bg-ink/10 -translate-y-1/2 rounded-full"></div>
                        <div 
                          className="absolute top-1/2 left-0 h-2 bg-coral -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                        ></div>
                        
                        {steps.map((step, idx) => {
                          const isCompleted = currentStepIndex >= idx
                          const isCurrent = currentStepIndex === idx
                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 border-4 ${
                                isCompleted ? 'bg-coral border-white text-white' : 'bg-cloud border-white text-ink/40'
                              }`}>
                                {isCompleted ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5 opacity-50" />}
                              </div>
                              <span className={`text-xs md:text-sm font-bold absolute top-12 whitespace-nowrap ${isCurrent ? 'text-ink' : 'text-ink/60'}`}>
                                {step}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    {/* Items List */}
                    <div className="md:col-span-2">
                      <h4 className="font-bold text-lg text-ink mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-ink/50" /> Items in Order
                      </h4>
                      <div className="flex flex-col gap-4">
                        {order.items.map((item: any, idx: number) => {
                          return (
                            <div key={idx} className="flex gap-4 bg-white p-4 rounded-2xl border border-ink/10 shadow-sm">
                              <div className="w-16 aspect-[3/4] bg-cloud rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-6 h-6 text-ink/20" />
                                )}
                              </div>
                              <div className="flex flex-col flex-1 py-1">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                  <span className="font-bold text-ink text-sm transition-colors">{item.product_name_snapshot}</span>
                                  <span className="font-bold text-ink text-sm whitespace-nowrap">{formatPrice((item.price_at_purchase * item.quantity) / 100)}</span>
                                </div>
                                <div className="text-xs font-medium text-ink/60 mt-auto flex gap-3">
                                  <span>Size: {item.size_snapshot}</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-bold text-lg text-ink mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-ink/50" /> Shipping Details
                      </h4>
                      <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm text-sm text-ink/80 font-medium leading-relaxed">
                        <p className="font-bold text-ink text-base mb-2">{order.shipping_address.name}</p>
                        <p>{order.shipping_address.address1}</p>
                        {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                        <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                        
                        <div className="mt-4 pt-4 border-t border-ink/5">
                          <p className="flex items-center gap-2 text-ink/60">
                            <Truck className="w-4 h-4" /> Standard Delivery
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
