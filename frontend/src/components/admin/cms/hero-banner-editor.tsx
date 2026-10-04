import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, RefreshCw, Bookmark } from 'lucide-react'
import { AdminCard, AdminButton, ConfirmModal } from '@/components/admin/ui/primitives'
import { cmsApi } from '@/lib/admin/cms-api'

export function HeroBannerEditor() {
  const [data, setData] = useState<{ promoRibbonText?: string; slides: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState('')
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  
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

  const addSlide = () => {
    if (!data) return
    setData({
      ...data,
      slides: [
        ...data.slides,
        {
          id: Math.random().toString(),
          img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2000&auto=format&fit=crop',
          hasOverlay: true,
          title: 'New Slide',
          titleAccent: '',
          subtitle: 'Add a description here',
          cta: 'Shop Now',
          ctaLink: '/shop',
          align: 'left',
          accentColor: '#FF6B8B',
          textColor: '#FFFFFF'
        }
      ]
    })
    setActiveSlideIndex(data.slides.length)
  }

  const removeSlide = (index: number) => {
    if (!data) return
    const newSlides = data.slides.filter((_, i) => i !== index)
    setData({ ...data, slides: newSlides })
    if (activeSlideIndex >= newSlides.length) {
      setActiveSlideIndex(Math.max(0, newSlides.length - 1))
    }
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (!data) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === data.slides.length - 1) return

    const newSlides = [...data.slides]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newSlides[index]
    newSlides[index] = newSlides[swapIndex]
    newSlides[swapIndex] = temp

    setData({ ...data, slides: newSlides })
    if (activeSlideIndex === index) {
      setActiveSlideIndex(swapIndex)
    } else if (activeSlideIndex === swapIndex) {
      setActiveSlideIndex(index)
    }
  }

  if (isLoading || !data) {
    return <div className="p-8 text-center text-ink/60">Loading CMS Data...</div>
  }

  const activeSlide = data.slides[activeSlideIndex]

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



        <div className="mb-4 flex items-center justify-between bg-cloud p-4 rounded-xl border border-ink/5">
          <h4 className="font-medium text-ink flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-ink/50" />
            Carousel Slides
          </h4>
          <button 
            onClick={addSlide}
            className="text-sm bg-cta text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 hover:bg-opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide flex-shrink-0">
          {data.slides.map((slide, idx) => (
            <div 
              key={slide.id}
              onClick={() => setActiveSlideIndex(idx)}
              className={`flex-shrink-0 relative w-32 h-20 min-h-[80px] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeSlideIndex === idx ? 'border-cta' : 'border-transparent hover:border-ink/20'}`}
            >
              <img src={slide.img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Slide {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Slide Editor */}
        {activeSlide && (
          <div className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-ink/5 pb-4">
              <h5 className="font-medium text-ink flex items-center gap-2">
                Editing Slide {activeSlideIndex + 1}
              </h5>
              <div className="flex items-center gap-2">
                <button onClick={() => moveSlide(activeSlideIndex, 'up')} disabled={activeSlideIndex === 0} className="p-1.5 text-ink/60 hover:text-ink disabled:opacity-30 rounded hover:bg-cloud transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveSlide(activeSlideIndex, 'down')} disabled={activeSlideIndex === data.slides.length - 1} className="p-1.5 text-ink/60 hover:text-ink disabled:opacity-30 rounded hover:bg-cloud transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-ink/20 mx-1"></div>
                <button onClick={() => removeSlide(activeSlideIndex)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Slide">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Upload Slide Image (.webp only)
                </label>
                <input
                  type="file"
                  accept="image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        updateSlide(activeSlideIndex, { img: event.target?.result as string })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-coral file:text-white hover:file:bg-opacity-90"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Title</label>
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={(e) => updateSlide(activeSlideIndex, { title: e.target.value })}
                    className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Title Accent (Bold)</label>
                  <input
                    type="text"
                    value={activeSlide.titleAccent}
                    onChange={(e) => updateSlide(activeSlideIndex, { titleAccent: e.target.value })}
                    className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Subtitle</label>
                <textarea
                  value={activeSlide.subtitle}
                  onChange={(e) => updateSlide(activeSlideIndex, { subtitle: e.target.value })}
                  rows={2}
                  className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={activeSlide.cta}
                    onChange={(e) => updateSlide(activeSlideIndex, { cta: e.target.value })}
                    className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Button Navigation Link</label>
                  <input
                    type="text"
                    value={activeSlide.ctaLink}
                    onChange={(e) => updateSlide(activeSlideIndex, { ctaLink: e.target.value })}
                    className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Button Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.accentColor}
                      onChange={(e) => updateSlide(activeSlideIndex, { accentColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-ink/60">{activeSlide.accentColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.textColor}
                      onChange={(e) => updateSlide(activeSlideIndex, { textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-ink/60">{activeSlide.textColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Alignment</label>
                  <select
                    value={activeSlide.align}
                    onChange={(e) => updateSlide(activeSlideIndex, { align: e.target.value })}
                    className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Has Overlay</label>
                  <select
                    value={activeSlide.hasOverlay ? 'yes' : 'no'}
                    onChange={(e) => updateSlide(activeSlideIndex, { hasOverlay: e.target.value === 'yes' })}
                    className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                  >
                    <option value="yes">Yes (Darkens image)</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Pane */}
      <div className="w-full xl:w-[600px] bg-ink/5 p-6 flex flex-col relative xl:sticky xl:top-[20px] xl:max-h-[calc(100vh-40px)] overflow-hidden rounded-r-2xl">
        <h4 className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-4 flex justify-between items-center">
          <span>Live Preview</span>
          <span className="bg-white px-2 py-1 rounded shadow-sm text-[10px]">Slide {activeSlideIndex + 1} of {data.slides.length}</span>
        </h4>
        
        {/* Mock Promo Ribbon */}
        {data.promoRibbonText && (
          <div className="bg-sand text-ink text-xs text-center py-2 font-medium truncate mb-4 shadow-sm relative z-20">
            {data.promoRibbonText}
          </div>
        )}

        {/* Carousel Preview Area */}
        {activeSlide ? (
          <div className="w-full relative rounded-2xl overflow-hidden shadow-xl bg-ink" style={{ aspectRatio: '16/9' }}>
            <img src={activeSlide.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            
            {activeSlide.hasOverlay && (
              <div className="absolute inset-0 bg-black/20" />
            )}

            <div className={`absolute inset-0 flex items-center p-8 ${
              activeSlide.align === 'center' ? 'justify-center text-center' : 
              activeSlide.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
            }`}>
              <div className="max-w-sm relative z-10">
                <h1 
                  className="font-heading font-bold text-3xl mb-2 leading-tight"
                  style={{ color: activeSlide.textColor }}
                >
                  {activeSlide.title} <span style={{ color: activeSlide.accentColor }}>{activeSlide.titleAccent}</span>
                </h1>
                <p 
                  className="text-sm mb-6 max-w-xs"
                  style={{ color: activeSlide.textColor, opacity: 0.9 }}
                >
                  {activeSlide.subtitle}
                </p>
                <div className={`flex ${
                  activeSlide.align === 'center' ? 'justify-center' : 
                  activeSlide.align === 'right' ? 'justify-end' : 'justify-start'
                }`}>
                  <button 
                    className="text-sm px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                    style={{ backgroundColor: activeSlide.accentColor, color: '#fff' }}
                  >
                    {activeSlide.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink/40 bg-white rounded-2xl border-2 border-dashed border-ink/10">
            No slides available
          </div>
        )}

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

