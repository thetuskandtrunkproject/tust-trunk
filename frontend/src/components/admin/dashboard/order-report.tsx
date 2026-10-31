import { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react'
import { fetchAdminOrders, type AdminOrderItem } from '@/lib/admin/orders-api'
import { cmsApi } from '@/lib/admin/cms-api'
import { AdminCard, AdminButton, AdminDatePicker } from '@/components/admin/ui/primitives'

export function OrderReport() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [orders, setOrders] = useState<AdminOrderItem[]>([])
  const [shopSettings, setShopSettings] = useState<any>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cmsApi.getShopSettings()
      .then(res => setShopSettings(res))
      .catch(err => console.error("Could not fetch shop settings:", err))
  }, [])

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.")
      return
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.")
      return
    }

    setLoading(true)
    setError(null)
    setHasGenerated(false)
    
    try {
      const res = await fetchAdminOrders(startDate, endDate)
      setOrders(res.orders || [])
      setHasGenerated(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isGstEnabled = Boolean(shopSettings?.gstEnabled || orders.some(o => (o.gst_paise || 0) > 0))
  const gstRate = Number(shopSettings?.gstPercentage || 5)

  const getOrderCalculations = (o: AdminOrderItem) => {
    const subtotal = o.subtotal_paise ?? o.total_paise
    const delivery = o.delivery_fee_paise ?? 0
    const discount = o.discount_paise ?? 0
    const total = o.total_paise

    let gstPaise = o.gst_paise ?? 0
    if (gstPaise <= 0 && isGstEnabled && subtotal > 0) {
      const diff = total - (subtotal + delivery - discount)
      if (diff > 0) {
        gstPaise = diff
      } else {
        const taxable = Math.max(0, subtotal - discount)
        gstPaise = Math.round(taxable * (gstRate / 100))
      }
    }

    const items = (o.items && o.items.length > 0) ? o.items : [
      {
        product_name_snapshot: 'Product Item',
        size_snapshot: '',
        quantity: 1,
        price_at_purchase: subtotal,
      }
    ]

    return {
      subtotal,
      delivery,
      discount,
      gstPaise,
      total,
      items
    }
  }

  const exportPDF = () => {
    setIsPdfGenerating(true)
    document.body.classList.add('has-print-target')
    if (reportRef.current) {
      reportRef.current.classList.add('print-active-target')
    }
    setTimeout(() => {
      window.print()
      document.body.classList.remove('has-print-target')
      if (reportRef.current) {
        reportRef.current.classList.remove('print-active-target')
      }
      setIsPdfGenerating(false)
    }, 100)
  }

  const exportCSV = () => {
    if (orders.length === 0) return
    const headers = ['Order Number', 'Row Type', 'Description', 'Quantity', 'Customer', 'Date', 'Status', 'Payment', 'Amount (INR)']
    const csvRows: string[] = [headers.join(',')]

    orders.forEach(o => {
      const customer = `"${(o.customer_name || 'Guest').replace(/"/g, '""')}"`
      const date = new Date(o.date).toLocaleDateString()
      const { items, delivery, discount, gstPaise, total } = getOrderCalculations(o)

      // 1. Product Row(s)
      items.forEach(item => {
        const desc = `"${(item.product_name_snapshot + (item.size_snapshot ? ` (Size: ${item.size_snapshot})` : '')).replace(/"/g, '""')}"`
        const itemAmount = ((item.price_at_purchase * item.quantity) / 100).toFixed(2)
        csvRows.push(`${o.order_number},Product,${desc},${item.quantity},${customer},${date},${o.status},${o.payment_status},${itemAmount}`)
      })

      // 2. GST Row
      if (isGstEnabled || gstPaise > 0) {
        csvRows.push(`${o.order_number},GST,"GST (${gstRate}%)",-,${customer},${date},${o.status},${o.payment_status},${(gstPaise / 100).toFixed(2)}`)
      }

      // 3. Delivery / Shipping Row
      if (delivery > 0) {
        csvRows.push(`${o.order_number},Shipping,"Delivery Fee",-,${customer},${date},${o.status},${o.payment_status},${(delivery / 100).toFixed(2)}`)
      }

      // 4. Discount Row
      if (discount > 0) {
        csvRows.push(`${o.order_number},Discount,"Discount",-,${customer},${date},${o.status},${o.payment_status},-${(discount / 100).toFixed(2)}`)
      }

      // 5. Total Row
      const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
      csvRows.push(`${o.order_number},Total,"Order Total",${totalQty},${customer},${date},${o.status},${o.payment_status},${(total / 100).toFixed(2)}`)
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `order-report-${startDate}-to-${endDate}.csv`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Derived Stats
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_paise, 0) / 100
  const paidCount = orders.filter(o => o.payment_status === 'Paid').length
  const unpaidCount = totalOrders - paidCount
  const totalGstCollected = orders.reduce((sum, o) => {
    const { gstPaise } = getOrderCalculations(o)
    return sum + gstPaise
  }, 0) / 100

  return (
    <AdminCard className="h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-[#E3E3E3]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-[18px] text-[#202223]">Order Report</h2>
            {isGstEnabled && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF0E6] text-[#D82C0D] border border-[#F4A88E]">
                GST Active ({gstRate}%)
              </span>
            )}
          </div>
          <p className="text-[#6D7175] text-[13px] mt-1">Generate and export itemized reports with Product, GST, and Total rows</p>
        </div>
        
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-[#5C5F62] mb-1">Start Date</label>
            <AdminDatePicker 
              value={startDate}
              onChange={setStartDate}
              placeholder="dd-mm-yyyy"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5C5F62] mb-1">End Date</label>
            <AdminDatePicker 
              value={endDate}
              onChange={setEndDate}
              placeholder="dd-mm-yyyy"
            />
          </div>
          <AdminButton 
            onClick={handleGenerate}
            disabled={loading}
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          >
            Generate
          </AdminButton>
        </div>
      </div>

      {error && (
        <div className="bg-coral/10 text-cta p-4 rounded-xl flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error generating report</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {hasGenerated && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-end gap-3 mb-4">
            <AdminButton variant="secondary" onClick={exportCSV} icon={<FileSpreadsheet className="w-4 h-4" />}>
              Export CSV
            </AdminButton>
            <AdminButton 
              variant="secondary" 
              onClick={exportPDF} 
              disabled={isPdfGenerating}
              icon={isPdfGenerating ? <Loader2 className="w-4 h-4 animate-spin text-[#005bd3]" /> : <Download className="w-4 h-4 text-[#005bd3]" />}
            >
              {isPdfGenerating ? 'Generating...' : 'Download PDF'}
            </AdminButton>
          </div>

          <div ref={reportRef} className="bg-white p-6 rounded-xl border border-[#E3E3E3]">
            <div className="text-center mb-8">
              <h1 className="font-semibold text-[22px] text-[#202223]">Order Report</h1>
              <p className="text-[#6D7175] text-[14px] mt-1">Period: {startDate} to {endDate}</p>
              {isGstEnabled && (
                <p className="text-[12px] font-medium text-[#6D7175] mt-1">
                  Tax Breakdown Included &bull; GST Rate: {gstRate}% {shopSettings?.gstNumber ? `(GSTIN: ${shopSettings.gstNumber})` : ''}
                </p>
              )}
            </div>
            
            <div className={`grid grid-cols-2 ${isGstEnabled ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-8`}>
              <div className="bg-[#F4F6F8] p-4 rounded-xl text-center border border-[#E3E3E3]">
                <p className="text-[12px] font-semibold text-[#5C5F62] mb-1">Total Orders</p>
                <p className="text-[20px] font-semibold text-[#202223]">{totalOrders}</p>
              </div>
              <div className="bg-[#F4F6F8] p-4 rounded-xl text-center border border-[#E3E3E3]">
                <p className="text-[12px] font-semibold text-[#5C5F62] mb-1">Total Revenue</p>
                <p className="text-[20px] font-semibold text-[#005bd3]">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              {isGstEnabled && (
                <div className="bg-[#FFF0E6] p-4 rounded-xl text-center border border-[#F4A88E]">
                  <p className="text-[12px] font-semibold text-[#D82C0D] mb-1">Total GST ({gstRate}%)</p>
                  <p className="text-[20px] font-semibold text-[#D82C0D]">₹{totalGstCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              <div className="bg-[#E1F3FA] p-4 rounded-xl text-center border border-[#B3E1F7]">
                <p className="text-[12px] font-semibold text-[#006E8B] mb-1">Paid Orders</p>
                <p className="text-[20px] font-semibold text-[#006E8B]">{paidCount}</p>
              </div>
              <div className="bg-[#FFC4B0] p-4 rounded-xl text-center border border-[#F4A88E]">
                <p className="text-[12px] font-semibold text-[#D82C0D] mb-1">Unpaid / Failed</p>
                <p className="text-[20px] font-semibold text-[#D82C0D]">{unpaidCount}</p>
              </div>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#D2D5D8] text-[#5C5F62] text-[12px] uppercase tracking-wider">
                      <th className="py-3 px-3 font-semibold w-[130px]">Order #</th>
                      <th className="py-3 px-3 font-semibold">Row Type &bull; Details</th>
                      <th className="py-3 px-3 font-semibold">Customer</th>
                      <th className="py-3 px-3 font-semibold">Date</th>
                      <th className="py-3 px-3 font-semibold">Status / Payment</th>
                      <th className="py-3 px-3 font-semibold text-center w-[60px]">Qty</th>
                      <th className="py-3 px-3 font-semibold text-right w-[110px]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const { items, delivery, discount, gstPaise, total } = getOrderCalculations(o)
                      const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)

                      return (
                        <tr key={o.id} className="border-b border-[#E3E3E3]">
                          <td colSpan={7} className="p-0">
                            <table className="w-full text-left border-collapse text-[13px]">
                              <tbody>
                                {/* 1. Product Row(s) */}
                                {items.map((item, itemIdx) => (
                                  <tr 
                                    key={`item-${o.id}-${itemIdx}`} 
                                    className="bg-white hover:bg-[#F9FAFB] transition-colors"
                                  >
                                    <td className="py-2.5 px-3 font-medium text-[#202223] w-[130px] align-top">
                                      {itemIdx === 0 ? (
                                        <span className="font-bold text-[#005bd3]">{o.order_number}</span>
                                      ) : null}
                                    </td>
                                    <td className="py-2.5 px-3 text-[#202223] align-top">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#E4E5E7] text-[#202223]">
                                          Product
                                        </span>
                                        <span className="font-medium text-[#202223]">
                                          {item.product_name_snapshot}
                                          {item.size_snapshot ? ` (Size: ${item.size_snapshot})` : ''}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-[#6D7175] align-top">
                                      {itemIdx === 0 ? (o.customer_name || 'Guest') : ''}
                                    </td>
                                    <td className="py-2.5 px-3 text-[#6D7175] align-top">
                                      {itemIdx === 0 ? new Date(o.date).toLocaleDateString('en-IN') : ''}
                                    </td>
                                    <td className="py-2.5 px-3 align-top">
                                      {itemIdx === 0 ? (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E4F8ED] text-[#007F5F]">
                                            {o.status}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                            o.payment_status === 'Paid' 
                                              ? 'bg-[#EBF5FB] text-[#005bd3]' 
                                              : 'bg-[#FFF0E6] text-[#D82C0D]'
                                          }`}>
                                            {o.payment_status}
                                          </span>
                                        </div>
                                      ) : null}
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-[#5C5F62] w-[60px] align-top font-medium">
                                      {item.quantity}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-medium text-[#202223] w-[110px] align-top">
                                      ₹{((item.price_at_purchase * item.quantity) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                ))}

                                {/* 2. GST Row */}
                                {(isGstEnabled || gstPaise > 0) && (
                                  <tr className="bg-[#FFFDFB] hover:bg-[#FFF8F2] transition-colors border-t border-dashed border-[#F4A88E]/40">
                                    <td className="py-2 px-3 text-[#6D7175] text-[11px] font-mono pl-4 w-[130px]">
                                      ↳ GST
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#FFF0E6] text-[#D82C0D] border border-[#F4A88E]">
                                          GST
                                        </span>
                                        <span className="text-[#5C5F62] font-medium">
                                          Goods & Services Tax ({gstRate}%)
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-2 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-2 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-2 px-3 text-center text-[#A0A4A8] w-[60px]">-</td>
                                    <td className="py-2 px-3 text-right font-medium text-[#D82C0D] w-[110px]">
                                      ₹{(gstPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}

                                {/* 3. Delivery Fee Row (if applicable) */}
                                {delivery > 0 && (
                                  <tr className="bg-[#FBFBFC] hover:bg-[#F4F6F8] transition-colors border-t border-dashed border-[#E3E3E3]">
                                    <td className="py-1.5 px-3 text-[#6D7175] text-[11px] font-mono pl-4 w-[130px]">
                                      ↳ Ship
                                    </td>
                                    <td className="py-1.5 px-3">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F2F4] text-[#5C5F62]">
                                          Shipping
                                        </span>
                                        <span className="text-[#5C5F62]">Delivery Fee</span>
                                      </div>
                                    </td>
                                    <td className="py-1.5 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-1.5 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-1.5 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-1.5 px-3 text-center text-[#A0A4A8] w-[60px]">-</td>
                                    <td className="py-1.5 px-3 text-right text-[#5C5F62] w-[110px]">
                                      ₹{(delivery / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}

                                {/* 4. Discount Row (if applicable) */}
                                {discount > 0 && (
                                  <tr className="bg-[#FBFBFC] hover:bg-[#F4F6F8] transition-colors border-t border-dashed border-[#E3E3E3]">
                                    <td className="py-1.5 px-3 text-[#6D7175] text-[11px] font-mono pl-4 w-[130px]">
                                      ↳ Disc
                                    </td>
                                    <td className="py-1.5 px-3">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#E4F8ED] text-[#007F5F]">
                                          Discount
                                        </span>
                                        <span className="text-[#5C5F62]">Coupon Discount</span>
                                      </div>
                                    </td>
                                    <td className="py-1.5 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-1.5 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-1.5 px-3 text-[#A0A4A8]">-</td>
                                    <td className="py-1.5 px-3 text-center text-[#A0A4A8] w-[60px]">-</td>
                                    <td className="py-1.5 px-3 text-right text-[#007F5F] font-medium w-[110px]">
                                      -₹{(discount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}

                                {/* 5. Total Row */}
                                <tr className="bg-[#F4F6F8]/80 font-semibold border-t border-b border-[#D2D5D8]">
                                  <td className="py-2.5 px-3 text-[11px] uppercase tracking-wider text-[#5C5F62] w-[130px]">
                                    Total
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#E8F0FE] text-[#005bd3]">
                                        Total
                                      </span>
                                      <span className="font-semibold text-[#202223]">Net Order Total</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-[#6D7175] text-[12px]">
                                    {o.customer_name || 'Guest'}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#6D7175] text-[12px]">
                                    {new Date(o.date).toLocaleDateString('en-IN')}
                                  </td>
                                  <td className="py-2.5 px-3 text-[12px] text-[#202223]">
                                    {o.payment_status}
                                  </td>
                                  <td className="py-2.5 px-3 text-center text-[#202223] w-[60px] font-bold">
                                    {totalQty}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-[#005bd3] text-[14px] w-[110px]">
                                    ₹{(total / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-[#6D7175] font-medium text-[13px]">
                No orders found in this date range.
              </div>
            )}
          </div>
        </div>
      )}
    </AdminCard>
  )
}
