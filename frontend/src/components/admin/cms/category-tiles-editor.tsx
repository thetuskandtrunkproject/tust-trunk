import { useState, useRef } from 'react'
import { Save, Image as ImageIcon, Upload } from 'lucide-react'
import { mockCmsData } from '@/lib/admin/mock-cms'

export function CategoryTilesEditor() {
  const [data, setData] = useState(mockCmsData.categoryTiles)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  
  const fileInputRefs = {
    women: useRef<HTMLInputElement>(null),
    kids: useRef<HTMLInputElement>(null)
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }, 600)
  }

  const handleImageUpload = (category: keyof typeof data) => {
    // Mock upload - just using an alert for now, in a real app this would upload to storage and return a URL
    alert('This would open the file picker and upload the image to storage.')
  }

  const handleLabelChange = (category: keyof typeof data, value: string) => {
    setData({
      ...data,
      [category]: { ...data[category], label: value }
    })
  }

  return (
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden relative">
      <div className="p-6 border-b border-ink/10 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-ink">Category Tiles</h3>
          <p className="text-sm text-ink/60">Edit the three main category links on the homepage</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-ink text-cloud px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-soft hover:text-ink transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(data) as Array<keyof typeof data>).map((category) => (
            <div key={category} className="space-y-4 bg-cloud/50 p-4 rounded-xl border border-ink/5">
              <h4 className="font-medium text-ink capitalize">{category} Tile</h4>
              
              {/* Image Preview/Upload */}
              <div className="relative aspect-[3/4] bg-ink/5 rounded-lg overflow-hidden group">
                <img 
                  src={data[category].image} 
                  alt={data[category].label} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button 
                    onClick={() => handleImageUpload(category)}
                    className="bg-cloud text-ink px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Replace Image
                  </button>
                </div>
              </div>

              {/* Label Edit */}
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1 uppercase tracking-wider">Button Label</label>
                <input
                  type="text"
                  value={data[category].label}
                  onChange={(e) => handleLabelChange(category, e.target.value)}
                  className="w-full bg-white border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cloud text-xs px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-bottom-2">
          Saved successfully
        </div>
      )}
    </div>
  )
}
