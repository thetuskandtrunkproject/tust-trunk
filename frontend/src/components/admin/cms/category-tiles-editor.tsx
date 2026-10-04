import { useState, useEffect } from 'react'
import { Save, Image as ImageIcon, Plus, Trash2, Bookmark, RefreshCw } from 'lucide-react'
import { AdminCard, AdminButton, ConfirmModal } from '@/components/admin/ui/primitives'
import { cmsApi } from '@/lib/admin/cms-api'
import { api } from '@/lib/api'

export function CategoryTilesEditor() {
  const [data, setData] = useState<any>(null)
  const [originalData, setOriginalData] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState('')
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  })

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
      const initial = cmsRes || {
        title: '', titleAccent: '', subtitle: '', textColor: '#2D283E',
        sweepTextColor: '#FFFFFF', baseBgColor: '#FAF7F9', sweepBgColor: '#FF6B8B',
        waveColor1: '#70A6FF', waveColor2: '#845EC2', waveColor3: '#FFD93D',
        buttonText: 'View Complete Collection', buttonLink: '/shop?sort=newest', buttonTextColor: '#2D283E',
        tiles: []
      }
      setData(JSON.parse(JSON.stringify(initial)))
      setOriginalData(JSON.parse(JSON.stringify(initial)))
      setCategories(catRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(originalData)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await cmsApi.updateCategoryTiles(data)
      setOriginalData(JSON.parse(JSON.stringify(res)))
      setData(JSON.parse(JSON.stringify(res)))
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

  const handleResetDefault = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset to Default',
      message: 'Are you sure you want to reset to the default template? This will overwrite your current settings.',
      confirmText: 'Reset',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        setIsLoading(true)
        try {
          const res = await cmsApi.resetCategoryTiles()
          setOriginalData(JSON.parse(JSON.stringify(res)))
          setData(JSON.parse(JSON.stringify(res)))
          setShowToast('Reset to default template.')
          setTimeout(() => setShowToast(''), 3000)
        } catch (e) {
          console.error(e)
        } finally {
          setIsLoading(false)
        }
      }
    })
  }

  const handleSetDefault = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Set as Default',
      message: 'Are you sure you want to set the current layout as the new default? You can reset to this state later.',
      confirmText: 'Set Default',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        setIsSaving(true)
        try {
          await cmsApi.setDefaultCategoryTiles(data)
          setOriginalData(JSON.parse(JSON.stringify(data)))
          setShowToast('Saved as new default template!')
          setTimeout(() => setShowToast(''), 3000)
        } catch (e) {
          console.error(e)
          setShowToast('Failed to set default.')
          setTimeout(() => setShowToast(''), 3000)
        } finally {
          setIsSaving(false)
        }
      }
    })
  }

  const updateTile = (index: number, updates: any) => {
    if (!data) return
    const newTiles = [...data.tiles]
    newTiles[index] = { ...newTiles[index], ...updates }
    setData({ ...data, tiles: newTiles })
  }

  const addTile = () => {
    if (!data) return
    setData({
      ...data,
      tiles: [
        ...data.tiles,
        { id: Math.random().toString(), image: '', label: 'New Tile', link: '' }
      ]
    })
  }

  const removeTile = (index: number) => {
    if (!data) return
    const newTiles = data.tiles.filter((_: any, i: number) => i !== index)
    setData({ ...data, tiles: newTiles })
  }

  if (isLoading || !data) {
    return <div className="p-8 text-center text-ink/60">Loading CMS Data...</div>
  }

  return (
    <AdminCard padding={false} className="flex flex-col relative">
      <div className="p-6 border-b border-ink/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-ink text-lg flex items-center gap-2">
            Category Tiles
            {hasUnsavedChanges && <span className="text-[10px] font-bold bg-coral text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Unsaved</span>}
          </h3>
          <p className="text-sm text-ink/60">Manage the playful category section</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSetDefault}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-ink/70 bg-cloud hover:bg-ink/5 border border-ink/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4" /> Set Default
          </button>
          <button
            onClick={handleResetDefault}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-ink/70 bg-cloud hover:bg-ink/5 border border-ink/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Restore Default
          </button>
          <AdminButton onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} icon={<Save className="w-4 h-4" />}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </AdminButton>
        </div>
      </div>

      <div className="p-6 space-y-8 bg-cloud/30">
        {/* Global Settings */}
        <div className="bg-white p-6 rounded-xl border border-ink/5 shadow-sm space-y-6">
          <h4 className="font-medium text-ink flex items-center gap-2 border-b border-ink/5 pb-2">
            Section Text & Global Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Heading Title</label>
              <input type="text" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Heading Accent (Bold)</label>
              <input type="text" value={data.titleAccent} onChange={(e) => setData({ ...data, titleAccent: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Subtitle</label>
            <textarea value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} rows={2} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Base Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.textColor} onChange={(e) => setData({ ...data, textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Sweep Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.sweepTextColor} onChange={(e) => setData({ ...data, sweepTextColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Base Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.baseBgColor?.includes('gradient') ? '#ffffff' : data.baseBgColor} onChange={(e) => setData({ ...data, baseBgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-ink/80 mb-1">Sweep Background (Color/Gradient)</label>
              <input type="text" value={data.sweepBgColor} onChange={(e) => setData({ ...data, sweepBgColor: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" placeholder="#FF6B8B or linear-gradient(...)" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ink/5">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-ink/5 mt-6">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Bottom Button Text</label>
              <input type="text" value={data.buttonText || ''} onChange={(e) => setData({ ...data, buttonText: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Bottom Button Link</label>
              <input type="text" value={data.buttonLink || ''} onChange={(e) => setData({ ...data, buttonLink: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2 flex items-center gap-2">
                Button Text Color
                <span className="w-4 h-4 rounded-full border border-ink/20 block" style={{ backgroundColor: data.buttonTextColor || '#2D283E' }} />
              </label>
              <input type="color" value={data.buttonTextColor || '#2D283E'} onChange={(e) => setData({ ...data, buttonTextColor: e.target.value })} className="h-10 w-full cursor-pointer rounded border border-ink/20 bg-cloud px-1 py-1" />
            </div>
          </div>
        </div>

        {/* Tiles Management */}
        <div className="bg-white p-6 rounded-xl border border-ink/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-ink/5 pb-2">
            <h4 className="font-medium text-ink flex items-center gap-2">
              Category Tiles
            </h4>
            <button 
              onClick={addTile}
              className="text-sm bg-cta text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 hover:bg-opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add Tile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.tiles.map((tile: any, idx: number) => (
              <div key={idx} className="space-y-4 bg-cloud/50 p-4 rounded-xl border border-ink/5 relative group">
                <button 
                  onClick={() => removeTile(idx)} 
                  className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
                  title="Remove Tile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-ink capitalize">Tile {idx + 1}</h5>
                </div>
                
                {/* Image Preview/Upload */}
                <div className="relative aspect-[4/5] bg-ink/5 rounded-lg overflow-hidden group/img border border-ink/10">
                  {tile.image ? (
                    <img src={tile.image} alt={tile.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-ink/40 bg-white">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <label className="bg-cloud text-ink px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white transition-colors cursor-pointer shadow-md">
                      <ImageIcon className="w-4 h-4" />
                      Upload 4:5 .webp
                      <input
                        type="file"
                        accept="image/webp,image/png,image/jpeg"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setIsLoading(true)
                            try {
                              const res = await cmsApi.uploadImage(file)
                              updateTile(idx, { image: res.url })
                              setShowToast('Image uploaded!')
                              setTimeout(() => setShowToast(''), 3000)
                            } catch (err) {
                              console.error(err)
                              setShowToast('Failed to upload image')
                              setTimeout(() => setShowToast(''), 3000)
                            } finally {
                              setIsLoading(false)
                            }
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
            {data.tiles.length === 0 && (
              <div className="col-span-full py-12 text-center text-ink/50 border-2 border-dashed border-ink/10 rounded-xl">
                No category tiles configured. Click "Add Tile" to start.
              </div>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-ink text-white text-sm font-medium px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 z-[9999]">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          {showToast}
        </div>
      )}
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
      />
    </AdminCard>
  )
}
