import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { mockOrders } from '@/lib/mock-account'
import { mockProducts } from '@/lib/mock-products'
import { ChevronRight, Package, MapPin, Check, Truck, Clock, XCircle } from 'lucide-react'

export const Route = createFileRoute('/account/orders')({
  component: AccountOrdersPage,
})

function AccountOrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

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
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'Shipped': return 'bg-sky/10 text-sky border-sky/20'
      case 'Out for Delivery': return 'bg-sky/10 text-sky border-sky/20'
      case 'Processing': return 'bg-[#F2C94C]/20 text-[#B28A00] border-[#F2C94C]/30'
      case 'Cancelled': return 'bg-rust/10 text-rust border-rust/20'
      default: return 'bg-ink/5 text-ink border-ink/10'
    }
  }

  if (mockOrders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-ink/5 flex flex-col items-center">
        <Package className="w-16 h-16 text-ink/20 mb-6" />
        <h2 className="font-fraunces text-2xl text-ink mb-2">No orders yet</h2>
        <p className="text-ink/60 mb-8 max-w-sm">When you place an order, it will appear here so you can track its status.</p>
        <Link to="/shop" className="bg-ink text-cloud px-8 py-3 rounded-full font-medium hover:bg-sky-soft hover:text-ink transition-colors">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-fraunces text-ink mb-6">Order History</h2>
      
      <div className="flex flex-col gap-4">
        {mockOrders.map((order) => {
          const isExpanded = expandedOrder === order.orderNumber
          
          // Stepper logic
          const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered']
          const isCancelled = order.status === 'Cancelled'
          const currentStepIndex = steps.indexOf(order.status)

          return (
            <div key={order.orderNumber} className="bg-white border border-ink/10 rounded-2xl overflow-hidden transition-all duration-300">
              
              {/* Collapsed View / Header */}
              <div 
                onClick={() => toggleExpand(order.orderNumber)}
                className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-ink/[0.02] transition-colors gap-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-ink">Order #{order.orderNumber}</span>
                  <span className="text-sm text-ink/60">{formatDate(order.date)}</span>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-8 justify-between sm:justify-end">
                  <div className="flex flex-col sm:items-end gap-1">
                    <span className="font-medium text-ink">{formatPrice(order.total)}</span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2">
                    {/* Thumbnails preview */}
                    <div className="flex -space-x-2 mr-4">
                      {order.items.slice(0, 3).map((item, idx) => {
                        const product = mockProducts.find(p => p.id === item.productId)
                        if (!product) return null
                        return (
                          <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-cloud overflow-hidden z-10">
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
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
                <div className="border-t border-ink/10 bg-ink/[0.02] p-4 md:p-6 animate-in slide-in-from-top-2 duration-300">
                  
                  {/* Status Stepper */}
                  <div className="mb-10 max-w-2xl mx-auto pt-4">
                    {isCancelled ? (
                      <div className="flex flex-col items-center justify-center text-rust gap-2">
                        <XCircle className="w-10 h-10" />
                        <span className="font-medium">Order Cancelled</span>
                        <p className="text-sm text-ink/60 text-center mt-2 max-w-xs text-ink">We have cancelled this order as requested. No charges were made.</p>
                      </div>
                    ) : (
                      <div className="relative flex justify-between">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-ink/10 -translate-y-1/2 rounded-full"></div>
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-sky -translate-y-1/2 rounded-full transition-all duration-500"
                          style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                        ></div>
                        
                        {steps.map((step, idx) => {
                          const isCompleted = currentStepIndex >= idx
                          const isCurrent = currentStepIndex === idx
                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isCompleted ? 'bg-sky text-white' : 'bg-cloud border-2 border-ink/20 text-ink/40'
                              }`}>
                                {isCompleted ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 opacity-50" />}
                              </div>
                              <span className={`text-xs md:text-sm font-medium absolute top-10 whitespace-nowrap ${isCurrent ? 'text-ink' : 'text-ink/60'}`}>
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
                      <h4 className="font-medium text-ink mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-ink/50" /> Items in Order
                      </h4>
                      <div className="flex flex-col gap-4">
                        {order.items.map((item, idx) => {
                          const product = mockProducts.find(p => p.id === item.productId)
                          if (!product) return null
                          return (
                            <div key={idx} className="flex gap-4 bg-white p-3 rounded-xl border border-ink/5">
                              <div className="w-16 aspect-[3/4] bg-cloud rounded overflow-hidden shrink-0">
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col flex-1 py-1">
                                <div className="flex justify-between items-start gap-4 mb-1">
                                  <Link to={`/products/${product.slug}`} className="font-medium text-ink text-sm hover:text-sky transition-colors">{product.name}</Link>
                                  <span className="font-medium text-ink text-sm whitespace-nowrap">{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                                </div>
                                <div className="text-xs text-ink/60 mt-auto flex gap-3">
                                  <span>Size: {item.size}</span>
                                  <span className="flex items-center gap-1">Color: <span className="inline-block w-2.5 h-2.5 rounded-full border border-ink/20" style={{ backgroundColor: item.color }}></span></span>
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
                      <h4 className="font-medium text-ink mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-ink/50" /> Shipping Details
                      </h4>
                      <div className="bg-white p-5 rounded-xl border border-ink/5 text-sm text-ink/80 leading-relaxed">
                        <p className="font-medium text-ink mb-1">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                        
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
