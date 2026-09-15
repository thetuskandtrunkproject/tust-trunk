import { Archive, Trash2, X } from 'lucide-react'
import type { ProductStatus } from '@/lib/admin/mock-admin-products'

interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkUpdateStatus: (status: ProductStatus) => void
  onBulkDelete: () => void
}

export function BulkActionsBar({ selectedCount, onClearSelection, onBulkUpdateStatus, onBulkDelete }: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-ink text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 whitespace-nowrap">
        
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-sm font-medium">selected</span>
        </div>

        <div className="w-px h-6 bg-white/20"></div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <button 
            onClick={() => onBulkUpdateStatus('Active')}
            className="hover:text-sky transition-colors"
          >
            Mark Active
          </button>
          <button 
            onClick={() => onBulkUpdateStatus('Draft')}
            className="hover:text-[#F2C94C] transition-colors"
          >
            Mark Draft
          </button>
          <button 
            onClick={() => onBulkUpdateStatus('Archived')}
            className="flex items-center gap-1.5 hover:text-cloud transition-colors text-white/70"
          >
            <Archive className="w-4 h-4" /> Archive
          </button>
          <button 
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 hover:text-rust transition-colors text-white/70 ml-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>

        <div className="w-px h-6 bg-white/20"></div>

        <button 
          onClick={onClearSelection}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
    </div>
  )
}
