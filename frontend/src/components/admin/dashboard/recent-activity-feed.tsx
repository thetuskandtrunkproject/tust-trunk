import { Package, AlertTriangle, UserPlus, Truck, CreditCard } from 'lucide-react'
import { AdminCard } from '@/components/admin/ui/primitives'
import { useToast } from '@/context/toast-context'

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
      case 'order': return <Package className="w-4 h-4 text-[#005bd3]" />
      case 'alert': return <AlertTriangle className="w-4 h-4 text-[#D82C0D]" />
      case 'customer': return <UserPlus className="w-4 h-4 text-[#007F5F]" />
      case 'shipping': return <Truck className="w-4 h-4 text-[#5C5F62]" />
      case 'payment': return <CreditCard className="w-4 h-4 text-[#D82C0D]" />
      default: return <Package className="w-4 h-4 text-[#8C9196]" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-[#E1F3FA]'
      case 'alert': return 'bg-[#FFC4B0]'
      case 'customer': return 'bg-[#AEE9D1]'
      case 'shipping': return 'bg-[#F4F6F8]'
      case 'payment': return 'bg-[#FFC4B0]'
      default: return 'bg-[#F4F6F8]'
    }
  }

  const { showToast } = useToast()

  return (
    <AdminCard>
      <h3 className="font-semibold text-[14px] text-[#202223] mb-6">Recent Activity</h3>
      
      <div className="relative border-l-2 border-[#E3E3E3] ml-4 space-y-8 pb-4">
        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${getBgColor(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[#202223] leading-relaxed">{activity.message}</span>
              <span className="text-[12px] text-[#6D7175] mt-1">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => showToast('Full activity log coming soon!')}
        className="w-full mt-2 py-2.5 rounded-lg border border-[#C9CCCF] text-[13px] font-medium text-[#202223] bg-white hover:bg-[#F4F6F8] shadow-sm transition-colors"
      >
        View All Activity
      </button>
    </AdminCard>
  )
}
