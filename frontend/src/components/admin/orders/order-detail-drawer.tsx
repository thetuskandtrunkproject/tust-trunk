import { useEffect } from 'react'
import { X, Mail, Phone, MapPin, Package, IndianRupee, Copy, Check, CreditCard, User, Calendar, ExternalLink } from 'lucide-react'
import type { AdminOrder, OrderStatus } from '@/lib/admin/mock-orders'
import { OrderStatusBadge } from './order-status-badge'
import { OrderStatusStepper } from './order-status-stepper'

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
        className={`fixed inset-0 bg-[#202223]/40 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[560px] bg-[#F4F6F8] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-[#C9CCCF] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-[#E1E3E5] shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F4F6F8] rounded-lg text-[#202223] border border-[#E1E3E5]">
              <Package className="w-5 h-5 text-[#5C5F62]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg text-[#202223]">Order #{order.order_number}</h2>
              </div>
              <p className="text-xs text-[#6D7175] flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(order.date)}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-[#5C5F62] hover:text-[#202223] hover:bg-[#F4F6F8] rounded-lg transition-colors border border-transparent hover:border-[#E1E3E5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Status Lifecycle Stepper Card */}
          <div className="bg-white p-5 rounded-xl border border-[#E1E3E5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F2F4]">
              <span className="text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Fulfillment Status</span>
              <OrderStatusBadge type="order" status={order.status} />
            </div>
            <OrderStatusStepper 
              status={order.status} 
              onStatusChange={(newStatus) => onUpdateStatus(order.id, newStatus)} 
            />
          </div>

          {/* Customer & Shipping Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Details */}
            <div className="bg-white p-4 rounded-xl border border-[#E1E3E5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F1F2F4]">
                  <User className="w-4 h-4 text-[#5C5F62]" />
                  <h3 className="text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Customer Info</h3>
                </div>
                <div className="space-y-2.5 text-xs text-[#202223]">
                  <p className="font-semibold text-sm text-[#202223]">{order.customer_name}</p>
                  <div className="flex items-center gap-2 text-[#5C5F62]">
                    <Mail className="w-3.5 h-3.5 text-[#8C9196] shrink-0" />
                    <a href={`mailto:${order.customer_email}`} className="hover:text-[#005bd3] truncate">{order.customer_email}</a>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center gap-2 text-[#5C5F62]">
                      <Phone className="w-3.5 h-3.5 text-[#8C9196] shrink-0" />
                      <a href={`tel:${order.customer_phone}`} className="hover:text-[#005bd3]">{order.customer_phone}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-4 rounded-xl border border-[#E1E3E5] shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F1F2F4]">
                <MapPin className="w-4 h-4 text-[#5C5F62]" />
                <h3 className="text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Shipping Address</h3>
              </div>
              <div className="text-xs text-[#5C5F62] leading-relaxed space-y-0.5">
                <p className="font-semibold text-[#202223] text-sm mb-1">{order.shipping_address?.name}</p>
                <p>{order.shipping_address?.address1}</p>
                {order.shipping_address?.address2 && <p>{order.shipping_address.address2}</p>}
                <p className="font-medium text-[#202223] pt-0.5">
                  {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                </p>
              </div>
            </div>

          </div>

          {/* Payment Method Details */}
          <div className="bg-white p-4 rounded-xl border border-[#E1E3E5] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F4F6F8] rounded-lg border border-[#E1E3E5]">
                <CreditCard className="w-4 h-4 text-[#5C5F62]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Payment Method</p>
                <p className="text-xs font-medium text-[#202223] mt-0.5">{order.payment_method || 'Razorpay Gateway'}</p>
              </div>
            </div>
            <OrderStatusBadge type="payment" status={order.payment_status} />
          </div>

          {/* Order Items List */}
          <div className="bg-white rounded-xl border border-[#E1E3E5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#F1F2F4] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Items ({order.items.length})</h3>
              <span className="text-xs font-medium text-[#6D7175]">Price</span>
            </div>
            
            <div className="divide-y divide-[#F1F2F4]">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex gap-3.5 items-center">
                  <div className="w-12 h-14 bg-[#F4F6F8] border border-[#E1E3E5] rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-[#8C9196]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-[#202223] truncate">{item.product_name_snapshot}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#6D7175] mt-1">
                      <span>Size: <strong className="text-[#202223]">{item.size_snapshot}</strong></span>
                      <span>Qty: <strong className="text-[#202223]">{item.quantity}</strong></span>
                      <span>Rate: <strong className="text-[#202223]">{formatPrice(item.price_at_purchase / 100)}</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-xs text-[#202223]">
                      {formatPrice((item.price_at_purchase * item.quantity) / 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Financial Summary Sticky Footer */}
        <div className="p-5 bg-white border-t border-[#E1E3E5] shrink-0 space-y-3 shadow-lg">
          <div className="space-y-1.5 text-xs text-[#6D7175]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-[#202223]">{formatPrice(order.subtotal_paise / 100)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Delivery</span>
              <span className="font-medium text-[#202223]">{order.delivery_fee_paise === 0 ? 'Free' : formatPrice(order.delivery_fee_paise / 100)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#E1E3E5]">
            <span className="font-semibold text-sm text-[#202223]">Total Paid</span>
            <span className="font-bold text-xl text-[#202223]">{formatPrice(order.total_paise / 100)}</span>
          </div>
        </div>

      </div>
    </>
  )
}

