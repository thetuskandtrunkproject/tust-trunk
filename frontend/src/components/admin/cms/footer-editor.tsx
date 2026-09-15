import { useState } from 'react'
import { Save } from 'lucide-react'
import { mockCmsData } from '@/lib/admin/mock-cms'

export function FooterEditor() {
  const [data, setData] = useState(mockCmsData.footer)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }, 600)
  }

  const handleSocialChange = (platform: keyof typeof data.socialLinks, value: string) => {
    setData({
      ...data,
      socialLinks: { ...data.socialLinks, [platform]: value }
    })
  }

  return (
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden relative">
      <div className="p-6 border-b border-ink/10 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-ink">Footer Settings</h3>
          <p className="text-sm text-ink/60">Edit the global site footer</p>
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

      <div className="p-6 space-y-8 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1">Brand Tagline</label>
          <textarea
            value={data.tagline}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
            rows={2}
            className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
          />
          <p className="text-xs text-ink/50 mt-1">Appears below the logo in the footer.</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-ink mb-4 pb-2 border-b border-ink/10">Social Links</h4>
          <div className="space-y-4">
            {(Object.keys(data.socialLinks) as Array<keyof typeof data.socialLinks>).map(platform => (
              <div key={platform} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-24 text-sm font-medium text-ink/80 capitalize">{platform}</label>
                <input
                  type="url"
                  value={data.socialLinks[platform]}
                  onChange={(e) => handleSocialChange(platform, e.target.value)}
                  placeholder={`https://${platform}.com/...`}
                  className="flex-1 bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>
            ))}
          </div>
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
