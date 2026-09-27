import { useState } from 'react'
import { Save } from 'lucide-react'
import { mockCmsData } from '@/lib/admin/mock-cms'

export function HeroBannerEditor() {
  const [data, setData] = useState(mockCmsData.hero)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }, 600)
  }

  return (
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Editor Form */}
      <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-ink/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-medium text-ink">Hero Banner</h3>
            <p className="text-sm text-ink/60">Edit the main homepage banner</p>
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Headline</label>
            <input
              type="text"
              value={data.headline}
              onChange={(e) => setData({ ...data, headline: e.target.value })}
              className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Subheadline</label>
            <textarea
              value={data.subheadline}
              onChange={(e) => setData({ ...data, subheadline: e.target.value })}
              rows={2}
              className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">CTA Text</label>
              <input
                type="text"
                value={data.ctaText}
                onChange={(e) => setData({ ...data, ctaText: e.target.value })}
                className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">CTA Link</label>
              <input
                type="text"
                value={data.ctaLink}
                onChange={(e) => setData({ ...data, ctaLink: e.target.value })}
                className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Promo Ribbon Text</label>
            <input
              type="text"
              value={data.promoRibbonText}
              onChange={(e) => setData({ ...data, promoRibbonText: e.target.value })}
              className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="w-full md:w-80 bg-cloud/50 p-6 flex flex-col relative">
        <h4 className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-4">Preview</h4>
        
        {/* Mock Promo Ribbon */}
        <div className="bg-sand text-ink text-[10px] text-center py-1 font-medium truncate mb-2">
          {data.promoRibbonText || 'Promo Ribbon'}
        </div>

        {/* Mock Hero Image/Content */}
        <div className="flex-1 min-h-[200px] bg-ink/5 rounded flex flex-col items-center justify-center p-4 text-center border border-ink/10 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="font-heading font-bold text-lg text-ink mb-2 leading-tight">{data.headline || 'Headline'}</h1>
            <p className="text-xs text-ink/70 mb-4 max-w-[200px] mx-auto">{data.subheadline || 'Subheadline'}</p>
            <span className="inline-block bg-ink text-cloud text-[10px] px-3 py-1.5 rounded-full font-medium">
              {data.ctaText || 'Button'}
            </span>
          </div>
        </div>

        {/* Toast */}
        {showToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink text-cloud text-xs px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-bottom-2">
            Saved successfully
          </div>
        )}
      </div>
    </div>
  )
}
