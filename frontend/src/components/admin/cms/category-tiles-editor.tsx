import { useState, useEffect } from 'react'
import { Save, Image as ImageIcon } from 'lucide-react'
import { AdminCard, AdminButton } from '@/components/admin/ui/primitives'
import { cmsApi } from '@/lib/admin/cms-api'
import { api } from '@/lib/api'

export function CategoryTilesEditor() {
  const [data, setData] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cmsRes, catRes] = await Promise.all([
        cmsApi.getCategoryTiles(),
        api.get('/public/categories')
      ])
      setData(cmsRes || {
        title: '', titleAccent: '', subtitle: '', textColor: '#2D283E',
        waveColor1: '#70A6FF', waveColor2: '#845EC2', waveColor3: '#FFD93D',
        tiles: []
      })
      setCategories(catRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await cmsApi.updateCategoryTiles(data)
      setShowToast('Changes saved successfully!')
      setTimeout(() => setShowToast(''), 3000)
    } catch (e) {
      console.error(e)
      setShowToast('Failed to save.')
      setTimeout(() => setShowToast(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateTile = (index: number, updates: any) => {
    if (!data) return
    const newTiles = [...data.tiles]
    newTiles[index] = { ...newTiles[index], ...updates }
    setData({ ...data, tiles: newTiles })
  }

  if (isLoading || !data) {
    return <div className="p-8 text-center text-ink/60">Loading CMS Data...</div>
  }

  return (
    <AdminCard padding={false} className="flex flex-col relative">
      <div className="p-6 border-b border-ink/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-ink text-lg">Category Tiles</h3>
          <p className="text-sm text-ink/60">Manage the playful category section</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton onClick={handleSave} disabled={isSaving} icon={<Save className="w-4 h-4" />}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </AdminButton>
        </div>
      </div>

      <div className="p-6 space-y-8 bg-cloud/30">
        {/* Global Settings */}
        <div className="bg-white p-6 rounded-xl border border-ink/5 shadow-sm space-y-6">
          <h4 className="font-medium text-ink flex items-center gap-2 border-b border-ink/5 pb-2">
            Section Text & Background Animation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Heading Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Heading Accent (Bold)</label>
              <input
                type="text"
                value={data.titleAccent}
                onChange={(e) => setData({ ...data, titleAccent: e.target.value })}
                className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Subtitle</label>
            <textarea
              value={data.subtitle}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
              rows={2}
              className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.textColor} onChange={(e) => setData({ ...data, textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                <span className="text-xs text-ink/60">{data.textColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Bottom Wave 1 (Back)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.waveColor1} onChange={(e) => setData({ ...data, waveColor1: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Bottom Wave 2 (Mid)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.waveColor2} onChange={(e) => setData({ ...data, waveColor2: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Bottom Wave 3 (Front)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.waveColor3} onChange={(e) => setData({ ...data, waveColor3: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Tiles Management */}
        <div className="bg-white p-6 rounded-xl border border-ink/5 shadow-sm space-y-6">
          <h4 className="font-medium text-ink flex items-center gap-2 border-b border-ink/5 pb-2">
            Category Tiles
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.tiles.map((tile: any, idx: number) => (
              <div key={idx} className="space-y-4 bg-cloud/50 p-4 rounded-xl border border-ink/5">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-ink capitalize">Tile {idx + 1}</h5>
                </div>
                
                {/* Image Preview/Upload */}
                <div className="relative aspect-[4/5] bg-ink/5 rounded-lg overflow-hidden group border border-ink/10">
                  <img src={tile.image} alt={tile.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <label className="bg-cloud text-ink px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white transition-colors cursor-pointer shadow-md">
                      <ImageIcon className="w-4 h-4" />
                      Upload 4:5 .webp
                      <input
                        type="file"
                        accept="image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              updateTile(idx, { image: event.target?.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Content Edit */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-ink/80 mb-1">Button Name</label>
                    <input
                      type="text"
                      value={tile.label}
                      onChange={(e) => updateTile(idx, { label: e.target.value })}
                      className="w-full bg-white border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/80 mb-1">Button Navigation</label>
                    <select
                      value={tile.link}
                      onChange={(e) => updateTile(idx, { link: e.target.value })}
                      className="w-full bg-white border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                    >
                      <option value="">Select a category...</option>
                      <option value="/shop?sort=newest">New Arrivals</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={`/shop?category=${c.slug}`}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cloud text-sm px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 z-50">
          {showToast}
        </div>
      )}
    </AdminCard>
  )
}
