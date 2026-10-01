import { useState, useRef } from 'react'
import { Download, FileText, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react'
import { fetchAdminOrders, type AdminOrderItem } from '@/lib/admin/orders-api'
// @ts-ignore
import html2pdf from 'html2pdf.js'

export function OrderReport() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [orders, setOrders] = useState<AdminOrderItem[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  
  const reportRef = useRef<HTMLDivElement>(null)

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

  const exportPDF = () => {
    if (!reportRef.current) return
    const opt = {
      margin:       0.5,
      filename:     `order-report-${startDate}-to-${endDate}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    }
    html2pdf().set(opt).from(reportRef.current).save()
  }

  const exportCSV = () => {
    if (orders.length === 0) return
    const headers = ['Order Number', 'Customer', 'Date', 'Status', 'Payment', 'Total (INR)']
    const csvContent = [
      headers.join(','),
      ...orders.map(o => {
        const customer = `"${(o.customer_name || 'Guest').replace(/"/g, '""')}"`
        const date = new Date(o.date).toLocaleDateString()
        const total = (o.total_paise / 100).toFixed(2)
        return `${o.order_number},${customer},${date},${o.status},${o.payment_status},${total}`
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
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

  return (
    <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-ink/5">
        <div>
          <h2 className="font-heading font-bold text-xl text-ink">Order Report</h2>
          <p className="text-ink/60 text-sm mt-1">Generate and export reports based on date ranges</p>
        </div>
        
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-bold text-ink/60 mb-1 uppercase tracking-wider">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-cloud border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink/60 mb-1 uppercase tracking-wider">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-cloud border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky/50"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-ink text-cloud px-5 py-2 rounded-lg font-bold hover:bg-sky hover:text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 h-[38px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-coral/10 text-coral p-4 rounded-xl flex items-start gap-3 mb-6">
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
            <button 
              onClick={exportCSV}
              className="px-4 py-2 text-sm font-bold text-ink/70 bg-cloud hover:text-ink hover:bg-ink/5 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={exportPDF}
              className="px-4 py-2 text-sm font-bold text-sky bg-sky/10 hover:bg-sky/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          <div ref={reportRef} className="bg-white p-6 rounded-xl border border-ink/10">
            <div className="text-center mb-8">
              <h1 className="font-heading font-bold text-2xl text-ink">Order Report</h1>
              <p className="text-ink/60 mt-1">Period: {startDate} to {endDate}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-cloud/50 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-ink">{totalOrders}</p>
              </div>
              <div className="bg-cloud/50 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-sky">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-cloud/50 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-1">Paid Orders</p>
                <p className="text-2xl font-bold text-forest">{paidCount}</p>
              </div>
              <div className="bg-cloud/50 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-1">Unpaid / Failed</p>
                <p className="text-2xl font-bold text-coral">{unpaidCount}</p>
              </div>
            </div>

            {orders.length > 0 ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/60 font-medium">
                    <th className="pb-3 pr-4">Order #</th>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Payment</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-ink/5">
                      <td className="py-3 pr-4 font-medium">{o.order_number}</td>
                      <td className="py-3 pr-4 text-ink/80">{o.customer_name || 'Guest'}</td>
                      <td className="py-3 pr-4 text-ink/60">{new Date(o.date).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">{o.status}</td>
                      <td className="py-3 pr-4">{o.payment_status}</td>
                      <td className="py-3 text-right font-medium text-sky">₹{(o.total_paise / 100).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-ink/50 font-medium">
                No orders found in this date range.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
