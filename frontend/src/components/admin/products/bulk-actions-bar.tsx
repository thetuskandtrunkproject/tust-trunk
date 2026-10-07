import { useState, useRef, useEffect } from 'react'
import { Trash2, Archive, Play, FolderInput, X } from 'lucide-react'
import { AdminSelect } from '../ui/primitives'
import type { Category } from '@/lib/admin/categories-api'

interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkUpdateStatus: (status: string) => void
  onBulkDelete: () => void
  onBulkMoveCategory?: (categoryId: string) => void
  categories?: Category[]
}

export function BulkActionsBar({ 
  selectedCount, 
  onClearSelection, 
  onBulkUpdateStatus, 
  onBulkDelete,
  onBulkMoveCategory,
  categories = []
}: BulkActionsBarProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E3E3E3] p-1.5 flex items-center gap-1.5 z-50 animate-in slide-in-from-bottom-8">
      
      <div className="px-3 flex items-center gap-3 border-r border-[#E3E3E3]">
        <div className="w-5 h-5 rounded bg-[#005bd3] text-white flex items-center justify-center text-[11px] font-bold">
          {selectedCount}
        </div>
        <span className="text-[13px] font-medium text-[#202223] mr-2">selected</span>
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#F4F6F8] rounded-lg transition-colors"
        >
          <FolderInput className="w-4 h-4 text-[#5C5F62]" />
          Category
        </button>
        {showCategoryDropdown && categories.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-[#E3E3E3] rounded-lg shadow-lg py-1 z-50 max-h-[200px] overflow-y-auto">
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => {
                  onBulkMoveCategory?.(cat.id)
                  setShowCategoryDropdown(false)
                }}
                className="w-full text-left px-3 py-2 text-[13px] text-[#202223] hover:bg-[#E1F3FA] hover:text-[#005bd3] transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-[#E3E3E3] mx-1" />

      <button onClick={() => onBulkUpdateStatus('Active')} className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#F4F6F8] rounded-lg transition-colors">
        <Play className="w-4 h-4 text-[#007F5F]" />
        Active
      </button>
      
      <button onClick={() => onBulkUpdateStatus('Draft')} className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#F4F6F8] rounded-lg transition-colors">
        <FolderInput className="w-4 h-4 text-[#5C5F62]" />
        Draft
      </button>
      
      <button onClick={() => onBulkUpdateStatus('Archived')} className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#F4F6F8] rounded-lg transition-colors">
        <Archive className="w-4 h-4 text-[#5C5F62]" />
        Archive
      </button>

      <div className="h-4 w-px bg-[#E3E3E3] mx-1" />

      <button onClick={onBulkDelete} className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#D82C0D] hover:bg-[#FEECEB] rounded-lg transition-colors">
        <Trash2 className="w-4 h-4" />
        Delete
      </button>

      <div className="h-4 w-px bg-[#E3E3E3] mx-1" />
      
      <button onClick={onClearSelection} className="p-1.5 text-[#5C5F62] hover:bg-[#F4F6F8] rounded-lg transition-colors mr-1">
        <X className="w-4 h-4" />
      </button>

    </div>
  )
}

