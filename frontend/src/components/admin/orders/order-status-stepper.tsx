import { useState, useEffect } from 'react'
import { Check, Clock, XCircle, Truck } from 'lucide-react'
import type { OrderStatus } from '@/lib/admin/mock-orders'

interface OrderStatusStepperProps {
  status: OrderStatus
  initialTrackingNumber?: string
  onStatusChange: (newStatus: OrderStatus, trackingNumber?: string) => void
}

export function OrderStatusStepper({ status, initialTrackingNumber = '', onStatusChange }: OrderStatusStepperProps) {
  const steps: OrderStatus[] = ['Pending', 'Processing', 'Shipped']
  const isCancelled = status === 'Cancelled'
  const currentStepIndex = steps.indexOf(status)

  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber)
  const [trackingError, setTrackingError] = useState<string | null>(null)

  useEffect(() => {
    setTrackingNumber(initialTrackingNumber || '')
  }, [initialTrackingNumber])

  if (isCancelled) {
    return (
      <div className="bg-rust/5 border border-rust/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-10 h-10 text-rust mb-3" />
        <h4 className="font-medium text-rust text-lg mb-1">Order Cancelled</h4>
        <p className="text-sm text-rust/70 mb-4 max-w-xs">This order has been cancelled and cannot be processed further.</p>
        
        <button 
          onClick={() => onStatusChange('Processing')}
          className="text-sm font-medium text-ink bg-white border border-ink/10 px-4 py-2 rounded-lg hover:bg-ink/5 transition-colors"
        >
          Restore to Pending
        </button>
      </div>
    )
  }

  const handleStatusClick = (step: OrderStatus) => {
    if (step === 'Shipped') {
      if (!trackingNumber.trim()) {
        setTrackingError('Please enter ST Courier Tracking Number before marking as Shipped')
        return
      }
      setTrackingError(null)
      onStatusChange('Shipped', trackingNumber.trim())
    } else {
      setTrackingError(null)
      onStatusChange(step, trackingNumber.trim() || undefined)
    }
  }

  return (
    <div className="bg-cloud border border-ink/5 rounded-2xl p-6">
      
      {/* Visual Stepper */}
      <div className="relative flex justify-between mb-8 max-w-xs mx-auto pt-2">
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
              <span className={`absolute top-9 text-[10px] font-medium uppercase tracking-wider ${isCurrent ? 'text-ink font-bold' : 'text-ink/50'}`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* ST Courier Tracking Number Input */}
      <div className="mt-8 pt-5 border-t border-ink/10">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-ink/80 flex items-center gap-1.5 uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-sky" />
            ST Courier Tracking Number
            <span className="text-rust">*</span>
          </label>
          {initialTrackingNumber && (
            <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Saved</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => {
              setTrackingNumber(e.target.value)
              if (trackingError) setTrackingError(null)
            }}
            placeholder="Enter ST Courier tracking no (e.g. ST123456789)"
            className="flex-1 bg-white border border-ink/20 rounded-lg px-3 py-2 text-xs font-mono text-ink placeholder:text-ink/30 focus:border-sky focus:ring-1 focus:ring-sky outline-none transition-colors"
          />
          {status === 'Shipped' && (
            <button
              type="button"
              onClick={() => {
                if (!trackingNumber.trim()) {
                  setTrackingError('Tracking number cannot be empty')
                  return
                }
                setTrackingError(null)
                onStatusChange('Shipped', trackingNumber.trim())
              }}
              className="px-3 py-2 bg-ink text-white rounded-lg text-xs font-medium hover:bg-ink/90 transition-colors shrink-0"
            >
              Update
            </button>
          )}
        </div>
        {trackingError && (
          <p className="text-[11px] text-rust font-semibold mt-1.5">{trackingError}</p>
        )}
        <p className="text-[11px] text-ink/50 mt-1">
          Tracking number will be sent in WhatsApp delivery notification to the customer.
        </p>
      </div>

      {/* Admin Controls */}
      <div className="flex flex-col items-center mt-6 pt-5 border-t border-ink/10">
        <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-3">Update Status</p>
        <div className="flex flex-wrap justify-center gap-2">
          {steps.map((step) => (
            <button
              key={step}
              onClick={() => handleStatusClick(step)}
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


