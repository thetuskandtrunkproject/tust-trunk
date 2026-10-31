import { useState, useRef, useEffect, useMemo } from 'react'
import { Printer, X, Scissors, Phone, Mail } from 'lucide-react'
import logoImg from '@/assets/New_logo.png'
import type { ShopSettings } from '@/lib/admin/mock-shop-settings'
import { MOCK_SHOP_SETTINGS } from '@/lib/admin/mock-shop-settings'

interface OrderShippingInvoiceProps {
  orders: any[]
  shopSettings?: Partial<ShopSettings> | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Barcode Generator: Renders clean Code128-style barcode bars for order numbers
 */
function SimpleBarcode({ value }: { value: string }) {
  const bars = []
  let seed = 0
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) % 1000
  }

  for (let i = 0; i < 48; i++) {
    const isThick = (seed + i * 17) % 3 === 0
    const isGap = (seed + i * 7) % 4 === 1 && i > 2 && i < 46
    if (!isGap) {
      bars.push(isThick ? 2.5 : 1.2)
    } else {
      bars.push(0)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg className="h-8 w-40" viewBox="0 0 160 32">
        <rect x="0" y="0" width="160" height="32" fill="#ffffff" />
        {bars.map((w, idx) => {
          if (w === 0) return null
          const x = idx * 3.2 + 4
          return <rect key={idx} x={x} y={1} width={w} height={30} fill="#000000" />
        })}
      </svg>
      <span className="font-mono text-[9px] tracking-widest text-black font-bold">
        *{value.toUpperCase()}*
      </span>
    </div>
  )
}

export function OrderShippingInvoice({
  orders,
  shopSettings,
  isOpen,
  onClose,
}: OrderShippingInvoiceProps) {
  const [printFormat, setPrintFormat] = useState<'label' | 'invoice'>('label')
  const containerRef = useRef<HTMLDivElement>(null)

  // Merge real shop settings with defaults
  const settings: ShopSettings = {
    ...MOCK_SHOP_SETTINGS,
    ...(shopSettings || {}),
    companyName: shopSettings?.companyName || 'The Tusk & Trunk',
    supportEmail: shopSettings?.supportEmail || 'support@thetuskandtrunk.com',
    primaryPhone: shopSettings?.primaryPhone || '+91 97894 51323',
    whatsappNumber: shopSettings?.whatsappNumber || shopSettings?.primaryPhone || '+91 97894 51323',
    gstNumber: shopSettings?.gstNumber || '33AAACT1234F1Z5',
    addressLine: shopSettings?.addressLine || '14/2, Avinashi Main Road, Gandhi Nagar',
    city: shopSettings?.city || 'Tirupur',
    state: shopSettings?.state || 'Tamil Nadu',
    country: shopSettings?.country || 'India',
    pincode: shopSettings?.pincode || '641603',
  }

  // Deduplicate orders so each order is rendered strictly once
  const uniqueOrders = useMemo(() => {
    const seen = new Set<string>()
    const list: any[] = []
    for (const o of orders) {
      const key = o.id || o.order_number
      if (key && !seen.has(key)) {
        seen.add(key)
        list.push(o)
      }
    }
    return list
  }, [orders])

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || uniqueOrders.length === 0) return null

  const formatPrice = (paise: number) => `₹${((paise || 0) / 100).toLocaleString('en-IN')}`
  const formatDate = (dateStr: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-IN')
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePrint = () => {
    if (containerRef.current) {
      containerRef.current.classList.add('print-active-target')
    }
    window.print()
    if (containerRef.current) {
      containerRef.current.classList.remove('print-active-target')
    }
  }

  return (
    <>
      {/* Scoped Print Styles: Eliminates browser headers (date/time/title) and footers (URL/page numbers) */}
      <style>{`
        @media print {
          @page {
            size: ${printFormat === 'label' ? '100mm 150mm' : 'A4 portrait'};
            margin: 0mm !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          .print-shipping-container,
          .print-shipping-container * {
            visibility: visible !important;
          }
          .print-shipping-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: ${printFormat === 'label' ? '4mm' : '8mm'} !important;
            background: #ffffff !important;
            display: block !important;
          }
          .print-shipping-card {
            box-shadow: none !important;
            border: 1.5px solid #000000 !important;
            border-radius: 4px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 0 !important;
            width: 100% !important;
            max-width: ${printFormat === 'label' ? '96mm' : '190mm'} !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex flex-col items-center justify-start py-6 px-4 print:p-0 print:bg-transparent print:static">
        {/* Top Floating Control Bar (Hidden in Print) */}
        <div className="sticky top-2 z-50 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-ink/10 px-5 py-3 mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky/10 text-sky flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-sm sm:text-base">
                Courier Box Invoice & Shipping Slips
              </h3>
              <p className="text-xs text-ink/60">
                Ready to paste on parcel box • {uniqueOrders.length} order{uniqueOrders.length > 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          {/* Format Selector: Courier Box Label (4x6) vs Standard A4 Tax Invoice */}
          <div className="flex items-center gap-2 bg-cloud p-1 rounded-xl border border-ink/10">
            <button
              type="button"
              onClick={() => setPrintFormat('label')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printFormat === 'label'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              📦 Courier Box Label (4×6")
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('invoice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printFormat === 'invoice'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              📄 Standard A4 Tax Invoice
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cta text-white font-bold text-xs hover:bg-cta/90 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-ink/60 hover:text-ink hover:bg-ink/5 rounded-xl transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Container */}
        <div
          ref={containerRef}
          className={`print-shipping-container w-full flex flex-col items-center gap-6 print:gap-0 print:block ${
            printFormat === 'label' ? 'max-w-[460px]' : 'max-w-[760px]'
          }`}
        >
          {uniqueOrders.map((order, orderIdx) => {
            const shipping = order.shipping_address || {}
            const items = order.items || []
            const recipientName = shipping.name || order.customer_name || 'Customer'
            const recipientPhone = shipping.phone || order.customer_phone || ''
            const recipientEmail = order.customer_email || ''
            const trackingNo = shipping.tracking_number || order.order_number
            const carrier = shipping.carrier || 'ST Courier / Surface'
            const isPaid = order.payment_status === 'Paid' || Boolean(order.razorpay_payment_id)

            const subtotalPaise = order.subtotal_paise || order.total_paise
            const deliveryPaise = order.delivery_fee_paise || 0
            const discountPaise = order.discount_paise || 0
            const totalPaise = order.total_paise

            // Calculate GST breakdown
            const isGstEnabled = Boolean(settings.gstEnabled || (order.gst_paise || 0) > 0)
            const gstPaise =
              order.gst_paise ||
              Math.max(0, totalPaise - (subtotalPaise + deliveryPaise - discountPaise))

            const isLast = orderIdx === uniqueOrders.length - 1

            return (
              <div
                key={order.id || orderIdx}
                className={`print-shipping-card bg-white text-black border border-black shadow-lg w-full ${
                  printFormat === 'label'
                    ? 'max-w-[460px] p-3 text-[10px] rounded-lg border-2'
                    : 'max-w-[760px] p-5 text-xs rounded-xl border-2'
                }`}
                style={{
                  pageBreakAfter: isLast ? 'auto' : 'always',
                  breakAfter: isLast ? 'auto' : 'page',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* TOP HEADER: Branding & Document Type (Amazon / Flipkart Style) */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <img
                      src={logoImg}
                      alt="The Tusk & Trunk"
                      className="h-8 sm:h-10 w-auto object-contain mix-blend-multiply"
                    />
                    <div>
                      <h1 className="font-extrabold text-xs sm:text-sm tracking-tight uppercase leading-none">
                        {settings.companyName}
                      </h1>
                      <p className="text-[8px] sm:text-[9px] text-gray-700 font-semibold uppercase tracking-wider mt-0.5">
                        Premium Kidswear • thetuskandtrunk.com
                      </p>
                      <p className="text-[8px] text-gray-600">
                        GSTIN: <span className="font-bold text-black">{settings.gstNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="bg-black text-white px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-xs">
                      {printFormat === 'label' ? 'COURIER PACKING SLIP' : 'TAX INVOICE & SHIPPING SLIP'}
                    </span>
                    <p className="font-mono font-bold text-xs sm:text-sm mt-0.5 text-black">
                      {order.order_number}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-gray-600">
                      {formatDate(order.date)}
                    </p>
                  </div>
                </div>

                {/* COURIER DISPATCH & BARCODE STRIP (Amazon / Flipkart Parcel Box Style) */}
                <div className="grid grid-cols-2 gap-2 py-1.5 px-2 bg-gray-50 border-b-2 border-black items-center">
                  <div>
                    <div className="text-[8px] uppercase font-bold text-gray-500">Shipping Partner / Mode</div>
                    <div className="font-extrabold text-[11px] text-black uppercase tracking-wide">
                      {carrier} • Express
                    </div>
                    <div className="text-[8px] text-gray-600 font-mono">
                      AWB: <span className="font-bold text-black">{trackingNo}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <SimpleBarcode value={order.order_number} />
                  </div>
                </div>

                {/* ADDRESS GRID (High Contrast for Courier Delivery Executive) */}
                <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-black divide-y md:divide-y-0 md:divide-x-2 divide-black">
                  {/* DELIVER TO / SHIPPING ADDRESS */}
                  <div className="p-2.5 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-black uppercase tracking-wider bg-gray-200 px-1 py-0.5 rounded text-black">
                        DELIVER TO (SHIPPING ADDRESS)
                      </span>
                      <span className="text-[8px] font-bold text-gray-600">PREPAID</span>
                    </div>
                    <p className="font-black text-xs sm:text-sm uppercase text-black tracking-wide leading-tight">
                      {recipientName}
                    </p>
                    <p className="text-[10px] sm:text-[11px] leading-tight text-gray-900 mt-1">
                      {shipping.address1}
                    </p>
                    {shipping.address2 && (
                      <p className="text-[10px] sm:text-[11px] leading-tight text-gray-900">
                        {shipping.address2}
                      </p>
                    )}
                    <p className="text-[10px] sm:text-[11px] font-semibold text-black mt-0.5">
                      {shipping.city}, {shipping.state}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded text-[11px] font-black tracking-wider">
                      PIN: {shipping.pincode || '641603'}
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-gray-200 space-y-0.5">
                      {recipientPhone && (
                        <p className="font-bold text-[10px] sm:text-[11px] text-black flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-black" />
                          Ph: {recipientPhone}
                        </p>
                      )}
                      {recipientEmail && (
                        <p className="text-[9px] text-gray-600 flex items-center gap-1 truncate">
                          <Mail className="w-2 h-2 text-gray-500" />
                          {recipientEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SOLD BY & SHOP SUPPORT DETAILS */}
                  <div className="p-2.5 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wider bg-gray-200 px-1 py-0.5 rounded text-black">
                        SOLD BY / DISPATCH ORIGIN
                      </span>
                      <p className="font-bold text-[11px] uppercase text-black mt-1 leading-tight">
                        {settings.companyName}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-gray-700 leading-tight mt-0.5">
                        {settings.addressLine}, {settings.city}, {settings.state} - {settings.pincode}
                      </p>
                      <p className="text-[9px] text-gray-700 mt-0.5">
                        State Code: <strong>33</strong> (Tamil Nadu)
                      </p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-gray-300">
                      <p className="text-[8px] uppercase font-bold text-gray-500 tracking-wider">
                        Shop Support & Inquiries:
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-black flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        {settings.primaryPhone}
                      </p>
                      <p className="text-[9px] text-gray-700 flex items-center gap-1 truncate">
                        <Mail className="w-2 h-2" />
                        {settings.supportEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ITEM DETAILS TABLE (Clear Amazon / Flipkart itemized list) */}
                <div className="border-b-2 border-black">
                  <div className="bg-gray-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-black border-b border-black flex justify-between items-center">
                    <span>Order Items ({items.length})</span>
                    <span>Invoice Details</span>
                  </div>
                  <table className="w-full text-left border-collapse text-[9px] sm:text-[10px]">
                    <thead>
                      <tr className="border-b border-black bg-gray-50 font-bold text-gray-700">
                        <th className="py-1 px-1.5 w-6 text-center">#</th>
                        <th className="py-1 px-1.5">Item Description</th>
                        <th className="py-1 px-1.5 text-center w-10">Size</th>
                        <th className="py-1 px-1.5 text-center w-8">Qty</th>
                        <th className="py-1 px-1.5 text-right w-14">Price</th>
                        <th className="py-1 px-1.5 text-right w-14">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item: any, i: number) => {
                        const qty = item.quantity || 1
                        const price = item.price_at_purchase || 0
                        const itemTotal = price * qty
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-0.5 px-1.5 text-center font-mono text-gray-500">{i + 1}</td>
                            <td className="py-0.5 px-1.5">
                              <span className="font-bold text-black block leading-tight">
                                {item.product_name_snapshot}
                              </span>
                              <span className="text-[8px] text-gray-500">
                                SKU: TT-{item.size_snapshot || 'STD'}-{(order.id || '').substring(0, 4)}
                              </span>
                            </td>
                            <td className="py-0.5 px-1.5 text-center font-bold text-black">
                              {item.size_snapshot || 'Free'}
                            </td>
                            <td className="py-0.5 px-1.5 text-center font-black text-black">
                              {qty}
                            </td>
                            <td className="py-0.5 px-1.5 text-right font-mono text-gray-700">
                              {formatPrice(price)}
                            </td>
                            <td className="py-0.5 px-1.5 text-right font-mono font-bold text-black">
                              {formatPrice(itemTotal)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* FINANCIAL SUMMARY & PAYMENT VERIFICATION */}
                <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black">
                  {/* Payment Badge Stamp */}
                  <div className="p-2 flex flex-col justify-between">
                    <div>
                      <div className="text-[8px] uppercase font-bold text-gray-500">Payment Details</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                              : 'bg-amber-50 text-amber-800 border-amber-600'
                          }`}
                        >
                          {isPaid ? 'PAID ONLINE (PREPAID)' : 'PAYMENT PENDING'}
                        </span>
                      </div>
                      <p className="text-[8px] text-gray-600 mt-0.5 font-mono">
                        Gate: Razorpay Secure Gateway
                      </p>
                      {order.razorpay_payment_id && (
                        <p className="text-[8px] text-gray-600 font-mono truncate">
                          Ref: {order.razorpay_payment_id}
                        </p>
                      )}
                    </div>
                    <p className="text-[7.5px] text-gray-500 italic mt-1">
                      * Computer generated invoice. No signature required.
                    </p>
                  </div>

                  {/* Amount Totals */}
                  <div className="p-2 space-y-0.5 bg-gray-50 text-[9px] sm:text-[10px]">
                    <div className="flex justify-between text-gray-700">
                      <span>Items Subtotal:</span>
                      <span className="font-mono font-semibold">{formatPrice(subtotalPaise)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping Charges:</span>
                      <span className="font-mono font-semibold">
                        {deliveryPaise === 0 ? 'FREE' : formatPrice(deliveryPaise)}
                      </span>
                    </div>
                    {discountPaise > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Discount / Coupon:</span>
                        <span className="font-mono">- {formatPrice(discountPaise)}</span>
                      </div>
                    )}
                    {isGstEnabled && (
                      <div className="flex justify-between text-gray-600 text-[8px] pt-0.5">
                        <span>Included GST ({settings.gstPercentage || 5}%):</span>
                        <span className="font-mono">{formatPrice(gstPaise)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t-2 border-black font-black text-xs text-black">
                      <span className="uppercase tracking-wider">Grand Total:</span>
                      <span className="font-mono text-xs sm:text-sm bg-black text-white px-2 py-0.5 rounded">
                        {formatPrice(totalPaise)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* COURIER BOX CUT OR FOLD GUIDE */}
                <div className="pt-1.5 flex items-center justify-between text-[8px] text-gray-500 border-t border-dashed border-gray-400 mt-1.5">
                  <span className="flex items-center gap-1 font-semibold">
                    <Scissors className="w-2.5 h-2.5 text-gray-600" />
                    Fold or place in courier parcel sleeve / paste on box
                  </span>
                  <span className="font-semibold text-black">
                    Tusk & Trunk Customer Care: {settings.primaryPhone}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
