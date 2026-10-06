import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, RefreshCw, Bookmark, CloudUpload, X } from 'lucide-react'
import { AdminCard, AdminButton, ConfirmModal } from '@/components/admin/ui/primitives'
import { cmsApi } from '@/lib/admin/cms-api'
import { Hero } from '@/components/site/hero'

export function HeroBannerEditor() {
  const [data, setData] = useState<{ promoRibbonText?: string; slides: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState('')
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await cmsApi.getHeroBanner()
      setData(res || { promoRibbonText: '', slides: [] })
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await cmsApi.updateHeroBanner(data)
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
      message: 'Are you sure you want to reset to the default template? This will overwrite your current banner.',
      confirmText: 'Reset',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
        setIsLoading(true)
        try {
          const res = await cmsApi.resetHeroBanner()
          setData(res)
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
          await cmsApi.setDefaultHeroBanner(data)
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

  const updateSlide = (index: number, updates: any) => {
    if (!data) return
    const newSlides = [...data.slides]
    newSlides[index] = { ...newSlides[index], ...updates }
    setData({ ...data, slides: newSlides })
  }

  const handleAddImages = async (files: FileList | null) => {
    if (!data || !files) return
    
    const newImages = await Promise.all(
      Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
    )
    
    const addedSlides = newImages.map(img => ({
      id: Math.random().toString(),
      img,
      hasOverlay: false
    }))
    
    setData(prev => prev ? { ...prev, slides: [...prev.slides, ...addedSlides] } : null)
  }

  const removeSlide = (index: number) => {
    if (!data) return
    const newSlides = data.slides.filter((_, i) => i !== index)
    setData({ ...data, slides: newSlides })
  }

  const reorderSlide = (dragIndex: number, hoverIndex: number) => {
    if (!data || dragIndex === hoverIndex) return
    const newSlides = [...data.slides]
    const [draggedSlide] = newSlides.splice(dragIndex, 1)
    newSlides.splice(hoverIndex, 0, draggedSlide)
    setData({ ...data, slides: newSlides })
  }

  const updateGlobal = (updates: any) => {
    if (!data) return
    setData({ ...data, ...updates })
  }

  if (isLoading || !data) {
    return <div className="p-8 text-center text-ink/60">Loading CMS Data...</div>
  }


  return (
    <AdminCard padding={false} className="flex flex-col xl:flex-row relative">
      {/* Editor Form */}
      <div className="flex-1 p-6 border-b xl:border-b-0 xl:border-r border-ink/10 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-ink/5 gap-4">
          <div>
            <h3 className="font-medium text-ink text-lg">Hero Banner Carousel</h3>
            <p className="text-sm text-ink/60">Manage carousel slides & banner</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSetDefault}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-ink/70 bg-cloud hover:bg-ink/5 border border-ink/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Set Default
            </button>
            <button
              onClick={handleResetDefault}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-ink/70 bg-cloud hover:bg-ink/5 border border-ink/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restore Default
            </button>
            <AdminButton
              onClick={handleSave}
              disabled={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </AdminButton>
          </div>
        </div>



        <div className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm mb-6">
          <h4 className="font-medium text-ink flex items-center gap-2 mb-4 border-b border-ink/5 pb-4">
            Hero Content & Styling
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Title</label>
                <input type="text" value={data.title ?? data.slides[0]?.title ?? ''} onChange={(e) => updateGlobal({ title: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Title Accent (Bold)</label>
                <input type="text" value={data.titleAccent ?? data.slides[0]?.titleAccent ?? ''} onChange={(e) => updateGlobal({ titleAccent: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Subtitle</label>
              <textarea rows={2} value={data.subtitle ?? data.slides[0]?.subtitle ?? ''} onChange={(e) => updateGlobal({ subtitle: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Button Text</label>
                <input type="text" value={data.cta ?? data.slides[0]?.cta ?? ''} onChange={(e) => updateGlobal({ cta: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Button Navigation Link</label>
                <input type="text" value={data.ctaLink ?? data.slides[0]?.ctaLink ?? ''} onChange={(e) => updateGlobal({ ctaLink: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Theme Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={data.accentColor ?? data.slides[0]?.accentColor ?? '#FF6B8B'} onChange={(e) => updateGlobal({ accentColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={data.textColor ?? data.slides[0]?.textColor ?? '#2D283E'} onChange={(e) => updateGlobal({ textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Alignment</label>
                <select value={data.align ?? data.slides[0]?.align ?? 'left'} onChange={(e) => updateGlobal({ align: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Image Overlay</label>
                <select value={data.hasOverlay ? 'yes' : 'no'} onChange={(e) => updateGlobal({ hasOverlay: e.target.value === 'yes' })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink">
                  <option value="yes">Darken Image</option>
                  <option value="no">None</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-ink/5 pb-4 gap-4">
            <div>
              <h4 className="font-medium text-ink flex items-center gap-2">
                Default Slide Images
              </h4>
              <p className="text-xs text-ink/60 mt-1">Manage the default rotating images. (Recommended: 1080x1350, .webp only)</p>
            </div>
            <label className="text-sm font-medium text-ink/70 bg-cloud hover:bg-ink/5 border border-ink/10 rounded-full px-4 py-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto">
              <CloudUpload className="w-4 h-4" />
              Add Images
              <input type="file" multiple accept="image/webp,image/jpeg,image/png" className="hidden" onChange={(e) => handleAddImages(e.target.files)} />
            </label>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-ink/10 scrollbar-track-transparent">
            {data.slides.map((slide, idx) => (
              <div 
                key={slide.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', idx.toString())}
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOverIndex(null)
                  const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
                  if (!isNaN(dragIndex)) reorderSlide(dragIndex, idx)
                }}
                className={`flex-shrink-0 relative w-32 aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer transition-all bg-cloud ${
                  dragOverIndex === idx ? 'border-2 border-coral scale-105' : 'border border-ink/10 hover:border-ink/30'
                }`}
              >
                {slide.img ? (
                  <img src={slide.img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/40 text-xs">No Image</div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <button 
                    onClick={() => removeSlide(idx)}
                    className="self-end p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="text-white text-xs font-bold self-start">Slide {idx + 1}</span>
                </div>
              </div>
            ))}
            
            {/* Empty state / Add button at end of list */}
            {data.slides.length === 0 && (
              <div className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-ink/20 rounded-2xl text-ink/40">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm">No slides added</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Pane */}
      <div className="w-full xl:w-[600px] bg-ink/5 p-6 flex flex-col relative xl:sticky xl:top-[20px] xl:max-h-[calc(100vh-40px)] overflow-hidden rounded-r-2xl">
        <h4 className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-4 flex justify-between items-center">
          <span>Live Preview</span>
        </h4>
        {/* Carousel Preview Area */}
        <div className="w-full relative rounded-2xl overflow-hidden shadow-xl bg-cloud" style={{ height: '312px' }}>
          {/* We render the actual Hero component with the full data so the carousel animates */}
          <div className="absolute top-0 left-0 w-[1400px] h-[800px] origin-top-left" style={{ transform: 'scale(0.39)', pointerEvents: 'none' }}>
            <Hero initialData={{ ...data, promoRibbonText: '' }} />
          </div>
        </div>

        {/* Toast */}
        {showToast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cloud text-sm px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 z-50">
            {showToast}
          </div>
        )}
      </div>

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

