import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#007F5F]" />
      case 'error': return <AlertCircle className="w-5 h-5 text-[#D82C0D]" />
      case 'info': return <Info className="w-5 h-5 text-[#005bd3]" />
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="pointer-events-auto bg-white border border-[#E3E3E3] text-[#202223] px-4 py-3 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 min-w-[300px] max-w-md w-full"
          >
            {getIcon(toast.type)}
            <span className="text-[14px] font-medium flex-1 pr-4">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-[#8C9196] hover:text-[#202223] transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within a ToastProvider")
  return context
}
