import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { useRef, useState, useEffect } from 'react'
import { Download, Image as ImageIcon, FileText, X } from 'lucide-react'
import { AdminCard, AdminSelect, AdminDatePicker } from '@/components/admin/ui/primitives'

interface RevenueChartProps {
  data: {
    date: string
    revenue: number
  }[]
  timeRange?: string
  onTimeRangeChange?: (val: string) => void
  startDate?: string
  endDate?: string
  onStartDateChange?: (val: string) => void
  onEndDateChange?: (val: string) => void
}

export function RevenueChart({ 
  data, 
  timeRange, 
  onTimeRangeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: RevenueChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`
    }
    return `₹${value}`
  }

  const generateDashboardCanvas = async (): Promise<HTMLCanvasElement> => {
    const section = document.getElementById('revenue-section')
    if (!section) throw new Error('Revenue section element not found')

    const width = 1200
    const height = 650
    const scale = 2

    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context not available')

    ctx.scale(scale, scale)

    // Fill Outer Background (#F4F6F8)
    ctx.fillStyle = '#F4F6F8'
    ctx.fillRect(0, 0, width, height)

    // Header Title
    ctx.fillStyle = '#202223'
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.fillText('Revenue & Sales Summary', 32, 42)

    const labelMap: Record<string, string> = {
      '1d': 'Today',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '1y': 'This Year',
      'custom': 'Custom Range'
    }
    const rangeLabel = labelMap[timeRange || '30d'] || 'Last 30 Days'
    
    // Draw badge box
    ctx.fillStyle = '#E1E3E5'
    ctx.beginPath()
    ctx.roundRect(width - 170, 22, 138, 28, 6)
    ctx.fill()
    ctx.fillStyle = '#202223'
    ctx.font = '600 12px system-ui, -apple-system, sans-serif'
    ctx.fillText(rangeLabel, width - 156, 40)

    // Parse the 4 Stat Cards from DOM
    const cardNodes = Array.from(section.querySelectorAll('.grid > div'))
    const cardWidth = (width - 64 - 3 * 16) / 4
    const cardHeight = 110
    const startY = 65

    cardNodes.forEach((cardEl, idx) => {
      const x = 32 + idx * (cardWidth + 16)

      // Draw Card Background & Border
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(x, startY, cardWidth, cardHeight, 8)
      ctx.fill()
      ctx.strokeStyle = '#C9CCCF'
      ctx.lineWidth = 1
      ctx.stroke()

      // Extract Title & Value
      const spans = cardEl.querySelectorAll('span')
      let titleText = ''
      let valueText = ''

      spans.forEach(span => {
        const text = span.textContent?.trim() || ''
        if (text.includes('Revenue') || text.includes('Orders') || text.includes('Value')) {
          titleText = text
        } else if (text.startsWith('₹') || /^\d+$/.test(text)) {
          if (!valueText) valueText = text
        }
      })

      if (!titleText) {
        const defaultTitles = ['Total Revenue', 'Avg Daily Revenue', 'Total Orders', 'Avg Order Value']
        titleText = defaultTitles[idx] || 'Stat'
      }

      // Title
      ctx.fillStyle = '#5C5F62'
      ctx.font = '500 13px system-ui, -apple-system, sans-serif'
      ctx.fillText(titleText, x + 16, startY + 32)

      // Value
      ctx.fillStyle = '#202223'
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.fillText(valueText || '0', x + 16, startY + 75)
    })

    // Draw Chart Container
    const chartY = startY + cardHeight + 20
    const chartHeight = height - chartY - 32
    const chartWidth = width - 64

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.roundRect(32, chartY, chartWidth, chartHeight, 8)
    ctx.fill()
    ctx.strokeStyle = '#C9CCCF'
    ctx.lineWidth = 1
    ctx.stroke()

    // Chart Card Title
    ctx.fillStyle = '#202223'
    ctx.font = '600 15px system-ui, -apple-system, sans-serif'
    ctx.fillText('Revenue Trend', 52, chartY + 36)

    // Render Recharts SVG onto Canvas
    const svgEl = section.querySelector('svg.recharts-surface')
    if (svgEl) {
      try {
        const svgClone = svgEl.cloneNode(true) as SVGElement
        const drawWidth = chartWidth - 40
        const drawHeight = chartHeight - 60
        svgClone.setAttribute('width', `${drawWidth}`)
        svgClone.setAttribute('height', `${drawHeight}`)

        const svgString = new XMLSerializer().serializeToString(svgClone)
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        const img = new Image()
        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => {
            URL.revokeObjectURL(url)
            resolve()
          }, 1000)

          img.onload = () => {
            clearTimeout(timer)
            ctx.drawImage(img, 52, chartY + 50, drawWidth, drawHeight)
            URL.revokeObjectURL(url)
            resolve()
          }
          img.onerror = () => {
            clearTimeout(timer)
            URL.revokeObjectURL(url)
            resolve()
          }
          img.src = url
        })
      } catch (err) {
        console.warn('SVG rendering warning:', err)
      }
    }

    return canvas
  }

  const downloadChartImage = async () => {
    setIsExporting(true)
    try {
      const canvas = await generateDashboardCanvas()
      const downloadLink = document.createElement('a')
      downloadLink.download = `revenue-report-${timeRange || '30d'}.png`
      downloadLink.href = canvas.toDataURL('image/png')
      downloadLink.click()
    } catch (e) {
      console.error('Image export failed:', e)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadChartPDF = async () => {
    setIsExporting(true)
    try {
      const canvas = await generateDashboardCanvas()
      const imgData = canvas.toDataURL('image/png')

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Revenue Report - ${timeRange || '30d'}</title>
              <style>
                @page { size: landscape; margin: 0; }
                body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #F4F6F8; }
                img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              </style>
            </head>
            <body>
              <img src="${imgData}" onload="setTimeout(() => { window.print(); window.close(); }, 250);" />
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    } catch (e) {
      console.error('PDF export failed:', e)
    } finally {
      setIsExporting(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#202223] text-white px-3 py-2 rounded-[4px] shadow-sm text-[12px] border border-[#303030]">
          <p className="font-medium text-[#A6A8AB] mb-0.5">{label}</p>
          <p className="font-semibold text-white">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <AdminCard className="h-full flex flex-col" ref={chartRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-[14px] text-[#202223]">Revenue</h3>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {timeRange === 'custom' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <AdminDatePicker 
                  value={startDate || ''}
                  onChange={(val) => onStartDateChange?.(val)}
                  placeholder="Start Date"
                />
                <span className="text-ink/40 text-sm font-medium">to</span>
                <AdminDatePicker 
                  value={endDate || ''}
                  onChange={(val) => onEndDateChange?.(val)}
                  placeholder="End Date"
                />
              </div>
            )}
            <AdminSelect 
              value={timeRange || '30d'} 
              onChange={(val) => onTimeRangeChange?.(val)}
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 Days (Week)</option>
              <option value="30d">Last 30 Days (Month)</option>
              <option value="1y">This Year</option>
              <option value="custom">Custom Range</option>
            </AdminSelect>
          </div>
          
          <div className="relative" ref={menuRef} data-html2canvas-ignore="true">
            <button 
              disabled={isExporting}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-[6px] border border-[#C9CCCF] rounded-[4px] text-[13px] font-medium text-[#202223] hover:bg-[#F4F6F8] transition-colors h-[32px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#5C5F62] border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#5C5F62]" />
                  <span>Export</span>
                </>
              )}
            </button>
            {showExportMenu && !isExporting && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#C9CCCF] rounded-[4px] shadow-sm z-10 py-1">
                <button 
                  onClick={() => {
                    setShowExportMenu(false)
                    setTimeout(() => downloadChartImage(), 100)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] text-[#202223] hover:bg-[#F4F6F8]"
                >
                  <ImageIcon className="w-4 h-4 text-[#5C5F62]" />
                  Save as Image
                </button>
                <button 
                  onClick={() => {
                    setShowExportMenu(false)
                    setTimeout(() => downloadChartPDF(), 100)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] text-[#202223] hover:bg-[#F4F6F8]"
                >
                  <FileText className="w-4 h-4 text-[#5C5F62]" />
                  Save as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="w-full h-[300px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#005bd3" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#005bd3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6D7175' }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6D7175' }}
              tickFormatter={formatYAxis}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#C9CCCF', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#005bd3" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 4, fill: '#005bd3', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AdminCard>
  )
}
