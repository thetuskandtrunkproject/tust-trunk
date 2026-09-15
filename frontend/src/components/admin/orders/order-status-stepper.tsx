import { Check, Clock, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/lib/admin/mock-orders'

interface OrderStatusStepperProps {
  status: OrderStatus
  onStatusChange: (newStatus: OrderStatus) => void
}

export function OrderStatusStepper({ status, onStatusChange }: OrderStatusStepperProps) {
  const steps: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered']
  const isCancelled = status === 'Cancelled'
  const currentStepIndex = steps.indexOf(status)

  if (isCancelled) {
    return (
      <div className="bg-rust/5 border border-rust/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-10 h-10 text-rust mb-3" />
        <h4 className="font-medium text-rust text-lg mb-1">Order Cancelled</h4>
        <p className="text-sm text-rust/70 mb-4 max-w-xs">This order has been cancelled and cannot be processed further.</p>
        
        <button 
          onClick={() => onStatusChange('Pending')}
          className="text-sm font-medium text-ink bg-white border border-ink/10 px-4 py-2 rounded-lg hover:bg-ink/5 transition-colors"
        >
          Restore to Pending
        </button>
      </div>
    )
  }

  return (
    <div className="bg-cloud border border-ink/5 rounded-2xl p-6">
      
      {/* Visual Stepper */}
      <div className="relative flex justify-between mb-8 max-w-sm mx-auto pt-2">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-ink/10 -translate-y-1/2 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-sky -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, idx) => {
          const isCompleted = currentStepIndex >= idx
          const isCurrent = currentStepIndex === idx
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2 group">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  isCompleted ? 'bg-sky text-white' : 'bg-white border border-ink/20 text-ink/30'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <span className={`absolute top-9 text-[10px] font-medium uppercase tracking-wider ${isCurrent ? 'text-ink' : 'text-ink/50'}`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Admin Controls */}
      <div className="flex flex-col items-center mt-10 pt-6 border-t border-ink/10">
        <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-3">Update Status</p>
        <div className="flex flex-wrap justify-center gap-2">
          {steps.map((step) => (
            <button
              key={step}
              onClick={() => onStatusChange(step)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                status === step 
                  ? 'bg-ink text-cloud' 
                  : 'bg-white border border-ink/10 text-ink/70 hover:bg-ink/5 hover:text-ink'
              }`}
            >
              Mark as {step}
            </button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 w-full border-t border-ink/10 flex justify-center">
          <button 
            onClick={() => onStatusChange('Cancelled')}
            className="text-xs font-medium text-rust hover:underline"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  )
}
