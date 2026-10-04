import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Bookmark, RefreshCw, Upload } from 'lucide-react'
import { cmsApi } from '@/lib/admin/cms-api'
import { AdminCard, AdminButton } from '@/components/admin/ui/primitives'

const AVAILABLE_ICONS = ['leaf', 'heart', 'shield-check', 'star', 'sun', 'moon', 'zap']

export function AboutPageEditor() {
  const [data, setData] = useState<any>(null)
  const [originalData, setOriginalData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState('')
  
  const [uploadingImg1, setUploadingImg1] = useState(false)
  const [uploadingImg2, setUploadingImg2] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await cmsApi.getAboutPage()
      const initial = res || {
        introHeadline: '', introSubline: '', storyHeadline: '', storyParagraphs: [],
        valuesHeadline: '', valuesSubline: '', values: [],
        brandHeadline: '', brandParagraphs: [], brandImage1: '', brandImage2: '',
        ctaHeadline: '', ctaSubline: '', ctaButtonText: '', ctaButtonLink: '', ctaBgColor: '', ctaButtonBgColor: '', ctaButtonTextColor: ''
      }
      setData(initial)
      setOriginalData(initial)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await cmsApi.updateAboutPage(data)
      setData(res)
      setOriginalData(res)
      setShowToast('Changes saved successfully!')
      setTimeout(() => setShowToast(''), 3000)
    } catch (e) {
      console.error(e)
      setShowToast('Failed to save changes')
      setTimeout(() => setShowToast(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefault = async () => {
    setIsSaving(true)
    try {
      const res = await cmsApi.resetAboutPage()
      setData(res)
      setOriginalData(res)
      setShowToast('Restored to default!')
      setTimeout(() => setShowToast(''), 3000)
    } catch (e) {
      setShowToast('Failed to restore default')
      setTimeout(() => setShowToast(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetDefault = async () => {
    setIsSaving(true)
    try {
      const res = await cmsApi.setDefaultAboutPage(data)
      setData(res)
      setOriginalData(res)
      setShowToast('Saved as new default!')
      setTimeout(() => setShowToast(''), 3000)
    } catch (e) {
      setShowToast('Failed to set default')
      setTimeout(() => setShowToast(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'brandImage1' | 'brandImage2') => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    
    if (field === 'brandImage1') setUploadingImg1(true)
    else setUploadingImg2(true)

    try {
      const res = await cmsApi.uploadImage(file)
      setData({ ...data, [field]: res.url })
    } catch (err) {
      console.error(err)
      alert("Failed to upload image")
    } finally {
      if (field === 'brandImage1') setUploadingImg1(false)
      else setUploadingImg2(false)
    }
  }

  // Helpers for arrays
  const handleUpdateArray = (field: 'storyParagraphs' | 'brandParagraphs', index: number, value: string) => {
    const newArr = [...data[field]]
    newArr[index] = value
    setData({ ...data, [field]: newArr })
  }
  const handleAddArrayItem = (field: 'storyParagraphs' | 'brandParagraphs') => {
    setData({ ...data, [field]: [...data[field], ''] })
  }
  const handleRemoveArrayItem = (field: 'storyParagraphs' | 'brandParagraphs', index: number) => {
    const newArr = [...data[field]]
    newArr.splice(index, 1)
    setData({ ...data, [field]: newArr })
  }

  const handleAddValue = () => {
    setData({ ...data, values: [...data.values, { icon: 'star', label: '', description: '', bgColor: '#E0F2FE', iconBgColor: '#0EA5E9' }] })
  }
  const handleUpdateValue = (index: number, field: string, value: string) => {
    const newValues = [...data.values]
    newValues[index] = { ...newValues[index], [field]: value }
    setData({ ...data, values: newValues })
  }
  const handleRemoveValue = (index: number) => {
    const newValues = [...data.values]
    newValues.splice(index, 1)
    setData({ ...data, values: newValues })
  }

  if (isLoading || !data) return <div className="p-8 text-center text-ink/60">Loading About Page...</div>

  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(originalData)

  return (
    <AdminCard className="overflow-visible relative">
      <div className="p-6 border-b border-ink/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-ink text-lg flex items-center gap-2">
            About Page
            {hasUnsavedChanges && <span className="text-[10px] font-bold bg-coral text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Unsaved</span>}
          </h3>
          <p className="text-sm text-ink/60">Edit the brand story, core values, and page styling</p>
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

      <div className="p-6 space-y-12">
        {/* Intro Section */}
        <section>
          <h4 className="text-sm font-medium text-ink mb-4 pb-2 border-b border-ink/10">1. Hero Section</h4>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Headline</label>
              <input type="text" value={data.introHeadline} onChange={(e) => setData({ ...data, introHeadline: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Subheadline</label>
              <textarea value={data.introSubline} onChange={(e) => setData({ ...data, introSubline: e.target.value })} rows={2} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none" />
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section>
          <h4 className="text-sm font-medium text-ink mb-4 pb-2 border-b border-ink/10">2. Our Story</h4>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Section Headline</label>
              <input type="text" value={data.storyHeadline} onChange={(e) => setData({ ...data, storyHeadline: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-ink/80">Paragraphs</label>
              {data.storyParagraphs.map((p: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => handleUpdateArray('storyParagraphs', i, e.target.value)}
                    rows={3}
                    className="flex-1 bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
                  />
                  <button onClick={() => handleRemoveArrayItem('storyParagraphs', i)} className="p-2 text-ink/40 hover:text-coral hover:bg-coral/10 rounded-md h-fit">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => handleAddArrayItem('storyParagraphs')} className="text-sm text-cta font-medium flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Paragraph
              </button>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <h4 className="text-sm font-medium text-ink mb-4 pb-2 border-b border-ink/10">3. Values</h4>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Values Headline</label>
                <input type="text" value={data.valuesHeadline} onChange={(e) => setData({ ...data, valuesHeadline: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Values Subheadline</label>
                <input type="text" value={data.valuesSubline} onChange={(e) => setData({ ...data, valuesSubline: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.values.map((v: any, i: number) => (
                <div key={i} className="border border-ink/10 rounded-xl p-4 bg-cloud/50 relative">
                  <button onClick={() => handleRemoveValue(i)} className="absolute top-2 right-2 p-1.5 text-ink/40 hover:text-coral hover:bg-coral/10 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="block text-xs font-medium text-ink/60 mb-1">Icon</label>
                      <select value={v.icon} onChange={(e) => handleUpdateValue(i, 'icon', e.target.value)} className="w-full bg-white border border-ink/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ink">
                        {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/60 mb-1">Label</label>
                      <input type="text" value={v.label} onChange={(e) => handleUpdateValue(i, 'label', e.target.value)} className="w-full bg-white border border-ink/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/60 mb-1">Description</label>
                      <textarea value={v.description} onChange={(e) => handleUpdateValue(i, 'description', e.target.value)} rows={2} className="w-full bg-white border border-ink/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-ink/60 mb-1">Card Color</label>
                        <input type="text" value={v.bgColor} onChange={(e) => handleUpdateValue(i, 'bgColor', e.target.value)} className="w-full bg-white border border-ink/20 rounded-md px-2 py-1 text-sm" placeholder="bg-sky-soft/30 or #hex" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink/60 mb-1">Icon Color</label>
                        <input type="text" value={v.iconBgColor} onChange={(e) => handleUpdateValue(i, 'iconBgColor', e.target.value)} className="w-full bg-white border border-ink/20 rounded-md px-2 py-1 text-sm" placeholder="bg-sky or #hex" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleAddValue} className="text-sm text-cta font-medium flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Add Value
            </button>
          </div>
        </section>

        {/* Behind the Brand */}
        <section>
          <h4 className="text-sm font-medium text-ink mb-4 pb-2 border-b border-ink/10">4. Behind the Brand</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Headline</label>
                <input type="text" value={data.brandHeadline} onChange={(e) => setData({ ...data, brandHeadline: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-ink/80">Paragraphs</label>
                {data.brandParagraphs.map((p: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <textarea
                      value={p}
                      onChange={(e) => handleUpdateArray('brandParagraphs', i, e.target.value)}
                      rows={3}
                      className="flex-1 bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
                    />
                    <button onClick={() => handleRemoveArrayItem('brandParagraphs', i)} className="p-2 text-ink/40 hover:text-coral hover:bg-coral/10 rounded-md h-fit">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => handleAddArrayItem('brandParagraphs')} className="text-sm text-cta font-medium flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Paragraph
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Image 1 (Tall, Back)</label>
                <div className="flex items-center gap-4">
                  {data.brandImage1 && (
                    <img src={data.brandImage1} alt="" className="w-24 h-32 object-cover rounded-md border border-ink/10" />
                  )}
                  <label className="cursor-pointer bg-cloud border border-ink/20 hover:bg-ink/5 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingImg1 ? 'Uploading...' : 'Upload Image'}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'brandImage1')} disabled={uploadingImg1} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Image 2 (Square, Front)</label>
                <div className="flex items-center gap-4">
                  {data.brandImage2 && (
                    <img src={data.brandImage2} alt="" className="w-24 h-24 object-cover rounded-md border border-ink/10" />
                  )}
                  <label className="cursor-pointer bg-cloud border border-ink/20 hover:bg-ink/5 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingImg2 ? 'Uploading...' : 'Upload Image'}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'brandImage2')} disabled={uploadingImg2} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section>
          <h4 className="text-sm font-medium text-ink mb-4 pb-2 border-b border-ink/10">5. CTA Band</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Headline</label>
                <input type="text" value={data.ctaHeadline} onChange={(e) => setData({ ...data, ctaHeadline: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Subheadline</label>
                <input type="text" value={data.ctaSubline} onChange={(e) => setData({ ...data, ctaSubline: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1 flex items-center gap-2">
                  Band Background Color
                  <span className="w-4 h-4 rounded-full border border-ink/20 block" style={{ backgroundColor: data.ctaBgColor }} />
                </label>
                <input type="color" value={data.ctaBgColor} onChange={(e) => setData({ ...data, ctaBgColor: e.target.value })} className="h-10 w-full cursor-pointer rounded border border-ink/20 bg-cloud px-1 py-1" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Button Text</label>
                <input type="text" value={data.ctaButtonText} onChange={(e) => setData({ ...data, ctaButtonText: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Button Link</label>
                <input type="text" value={data.ctaButtonLink} onChange={(e) => setData({ ...data, ctaButtonLink: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1 flex items-center gap-2">
                    Button Bg Color
                    <span className="w-4 h-4 rounded-full border border-ink/20 block" style={{ backgroundColor: data.ctaButtonBgColor }} />
                  </label>
                  <input type="color" value={data.ctaButtonBgColor} onChange={(e) => setData({ ...data, ctaButtonBgColor: e.target.value })} className="h-10 w-full cursor-pointer rounded border border-ink/20 bg-cloud px-1 py-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1 flex items-center gap-2">
                    Button Text Color
                    <span className="w-4 h-4 rounded-full border border-ink/20 block" style={{ backgroundColor: data.ctaButtonTextColor }} />
                  </label>
                  <input type="color" value={data.ctaButtonTextColor} onChange={(e) => setData({ ...data, ctaButtonTextColor: e.target.value })} className="h-10 w-full cursor-pointer rounded border border-ink/20 bg-cloud px-1 py-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-ink text-white text-sm font-medium px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 z-[9999]">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          {showToast}
        </div>
      )}
    </AdminCard>
  )
}
