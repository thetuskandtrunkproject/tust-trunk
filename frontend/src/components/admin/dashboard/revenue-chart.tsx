import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { AdminCard, AdminSelect } from '@/components/admin/ui/primitives'

interface RevenueChartProps {
  data: {
    date: string
    revenue: number
  }[]
  timeRange?: string
  onTimeRangeChange?: (val: string) => void
}

export function RevenueChart({ data, timeRange, onTimeRangeChange }: RevenueChartProps) {
  
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`
    }
    return `₹${value}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ink text-cloud px-4 py-3 rounded-lg shadow-xl text-sm border border-ink/10">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sky font-semibold">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <AdminCard className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-ink">Revenue</h3>
        <AdminSelect 
          value={timeRange || '30d'} 
          onChange={(val) => onTimeRangeChange?.(val)}
          className="!min-w-0 !text-xs !py-1.5 !px-3"
        >
          <option value="30d">Last 30 Days</option>
          <option value="7d">Last 7 Days</option>
          <option value="1y">This Year</option>
        </AdminSelect>
      </div>
      
      <div className="w-full h-[300px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={formatYAxis}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4A90E2" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, fill: '#4A90E2', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AdminCard>
  )
}
