import { useEffect } from 'react'
import { X, Mail, Phone, MapPin, Package, IndianRupee } from 'lucide-react'
import type { AdminOrder, OrderStatus } from '@/lib/admin/mock-orders'
import { OrderStatusBadge } from './order-status-badge'
import { OrderStatusStepper } from './order-status-stepper'
import { mockProducts } from '@/lib/mock-products'

interface OrderDetailDrawerProps {
  order: AdminOrder | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void
}

export function OrderDetailDrawer({ order, isOpen, onClose, onUpdateStatus }: OrderDetailDrawerProps) {
  
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!order) return null

  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit' 
    }
    return new Date(dateString).toLocaleDateString('en-IN', options)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink/10 shrink-0">
          <div>
            <h2 className="font-heading font-bold text-xl text-ink">Order #{order.orderNumber}</h2>
            <p className="text-sm text-ink/60 mt-1">{formatDate(order.date)}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-ink/40 hover:text-ink hover:bg-ink/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-ink">Order Status</h3>
              <OrderStatusBadge type="order" status={order.status} />
            </div>
            <OrderStatusStepper 
              status={order.status} 
              onStatusChange={(newStatus) => onUpdateStatus(order.id, newStatus)} 
            />
          </section>

          {/* Customer Details */}
          <section className="bg-cloud p-5 rounded-2xl border border-ink/5">
            <h3 className="font-medium text-ink mb-4">Customer Details</h3>
            <div className="space-y-3 text-sm text-ink/80">
              <div className="flex items-center gap-3 font-medium text-ink">
                <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center text-ink">
                  {order.customerName.charAt(0)}
                </div>
                {order.customerName}
              </div>
              <div className="flex items-center gap-3 pl-1">
                <Mail className="w-4 h-4 text-ink/40" />
                <a href={`mailto:${order.customerEmail}`} className="hover:text-sky transition-colors">{order.customerEmail}</a>
              </div>
              <div className="flex items-center gap-3 pl-1">
                <Phone className="w-4 h-4 text-ink/40" />
                <a href={`tel:${order.customerPhone}`} className="hover:text-sky transition-colors">{order.customerPhone}</a>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <section>
              <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ink/40" /> Shipping
              </h3>
              <div className="text-sm text-ink/70 leading-relaxed border-l-2 border-ink/10 pl-3 ml-1">
                <p className="font-medium text-ink">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              </div>
            </section>

            {/* Payment Details */}
            <section>
              <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-ink/40" /> Payment
              </h3>
              <div className="text-sm text-ink/70 space-y-2 border-l-2 border-ink/10 pl-3 ml-1">
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  <OrderStatusBadge type="payment" status={order.paymentStatus} />
                </div>
                <p>Method: <span className="font-medium text-ink">{order.paymentMethod}</span></p>
              </div>
            </section>
          </div>

          {/* Line Items */}
          <section>
            <h3 className="font-medium text-ink mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-ink/40" /> Order Items ({order.items.length})
            </h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => {
                const product = mockProducts.find(p => p.id === item.productId)
                if (!product) return null
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 aspect-[3/4] bg-cloud border border-ink/5 rounded-lg overflow-hidden shrink-0">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <span className="font-medium text-ink text-sm leading-tight">{product.name}</span>
                        <span className="font-medium text-ink text-sm whitespace-nowrap">{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                      </div>
                      <div className="text-xs text-ink/60 mt-auto flex flex-wrap gap-x-4 gap-y-1">
                        <span>Size: {item.size}</span>
                        <span>Qty: {item.quantity}</span>
                        <span className="w-full text-ink/40">{formatPrice(item.priceAtPurchase)} each</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

        </div>

        {/* Financial Summary Sticky Footer */}
        <div className="p-6 bg-cloud border-t border-ink/10 shrink-0">
          <div className="space-y-2 text-sm text-ink/70 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-ink">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-medium text-ink">{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-ink/10">
            <span className="font-medium text-ink">Total</span>
            <span className="font-heading font-bold text-2xl text-ink">{formatPrice(order.total)}</span>
          </div>
        </div>

      </div>
    </>
  )
}
