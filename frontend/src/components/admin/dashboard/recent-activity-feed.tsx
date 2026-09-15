import { Package, AlertTriangle, UserPlus, Truck, CreditCard } from 'lucide-react'

interface ActivityItem {
  id: number
  type: string
  message: string
  time: string
}

interface RecentActivityFeedProps {
  activities: ActivityItem[]
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4 text-sky" />
      case 'alert': return <AlertTriangle className="w-4 h-4 text-rust" />
      case 'customer': return <UserPlus className="w-4 h-4 text-green-600" />
      case 'shipping': return <Truck className="w-4 h-4 text-ink/60" />
      case 'payment': return <CreditCard className="w-4 h-4 text-rust" />
      default: return <Package className="w-4 h-4 text-ink/50" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-sky/10'
      case 'alert': return 'bg-rust/10'
      case 'customer': return 'bg-green-100'
      case 'shipping': return 'bg-ink/5'
      case 'payment': return 'bg-rust/10'
      default: return 'bg-ink/5'
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
      <h3 className="font-medium text-ink mb-6">Recent Activity</h3>
      
      <div className="relative border-l-2 border-ink/5 ml-4 space-y-8 pb-4">
        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${getBgColor(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-ink/90 leading-relaxed">{activity.message}</span>
              <span className="text-xs text-ink/50 mt-1">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-2 py-3 rounded-xl border border-ink/10 text-sm font-medium text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors">
        View All Activity
      </button>
    </div>
  )
}
