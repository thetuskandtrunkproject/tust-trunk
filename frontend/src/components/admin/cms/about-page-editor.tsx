import { useState } from 'react'
import { Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { mockCmsData } from '@/lib/admin/mock-cms'

const AVAILABLE_ICONS = ['leaf', 'heart', 'shield-check', 'star', 'sun', 'moon', 'zap']

export function AboutPageEditor() {
  const [data, setData] = useState(mockCmsData.about)
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

  // Paragraphs
  const handleAddParagraph = () => {
    setData({ ...data, storyParagraphs: [...data.storyParagraphs, ''] })
  }

  const handleUpdateParagraph = (index: number, value: string) => {
    const newParagraphs = [...data.storyParagraphs]
    newParagraphs[index] = value
    setData({ ...data, storyParagraphs: newParagraphs })
  }

  const handleRemoveParagraph = (index: number) => {
    const newParagraphs = [...data.storyParagraphs]
    newParagraphs.splice(index, 1)
    setData({ ...data, storyParagraphs: newParagraphs })
  }

  // Values
  const handleAddValue = () => {
    setData({ ...data, values: [...data.values, { icon: 'star', label: '', description: '' }] })
  }

  const handleUpdateValue = (index: number, field: keyof typeof data.values[0], value: string) => {
    const newValues = [...data.values]
    newValues[index] = { ...newValues[index], [field]: value }
    setData({ ...data, values: newValues })
  }

  const handleRemoveValue = (index: number) => {
    const newValues = [...data.values]
    newValues.splice(index, 1)
    setData({ ...data, values: newValues })
  }

  return (
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden relative">
      <div className="p-6 border-b border-ink/10 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div>
          <h3 className="font-medium text-ink">About Page</h3>
          <p className="text-sm text-ink/60">Edit the brand story and core values</p>
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

      <div className="p-6 space-y-12">
        {/* Intro Section */}
        <section>
          <h4 className="text-sm font-medium text-ink mb-4 pb-2 border-b border-ink/10">1. Hero Section</h4>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Headline</label>
              <input
                type="text"
                value={data.introHeadline}
                onChange={(e) => setData({ ...data, introHeadline: e.target.value })}
                className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Subheadline</label>
              <textarea
                value={data.introSubline}
                onChange={(e) => setData({ ...data, introSubline: e.target.value })}
                rows={2}
                className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
              />
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-ink/10">
            <h4 className="text-sm font-medium text-ink">2. Our Story Paragraphs</h4>
            <button 
              onClick={handleAddParagraph}
              className="text-xs font-medium text-ink flex items-center gap-1 hover:text-sky transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Paragraph
            </button>
          </div>
          <div className="space-y-3 max-w-3xl">
            {data.storyParagraphs.map((para, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="mt-2.5 text-ink/20 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>
                <textarea
                  value={para}
                  onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                  rows={3}
                  className="flex-1 bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-y min-h-[80px]"
                />
                <button 
                  onClick={() => handleRemoveParagraph(idx)}
                  className="mt-2 p-1.5 text-ink/40 hover:text-blush hover:bg-blush/10 rounded transition-colors"
                  aria-label="Remove paragraph"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-ink/10">
            <h4 className="text-sm font-medium text-ink">3. Core Values</h4>
            <button 
              onClick={handleAddValue}
              className="text-xs font-medium text-ink flex items-center gap-1 hover:text-sky transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Value
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.values.map((val, idx) => (
              <div key={idx} className="bg-cloud/50 border border-ink/10 rounded-xl p-4 relative group">
                <button 
                  onClick={() => handleRemoveValue(idx)}
                  className="absolute top-2 right-2 p-1.5 text-ink/40 hover:text-blush hover:bg-blush/10 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-ink/60 mb-1 uppercase tracking-wider">Icon</label>
                    <select
                      value={val.icon}
                      onChange={(e) => handleUpdateValue(idx, 'icon', e.target.value)}
                      className="w-full bg-white border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                    >
                      {AVAILABLE_ICONS.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/60 mb-1 uppercase tracking-wider">Label</label>
                    <input
                      type="text"
                      value={val.label}
                      onChange={(e) => handleUpdateValue(idx, 'label', e.target.value)}
                      className="w-full bg-white border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/60 mb-1 uppercase tracking-wider">Description</label>
                    <textarea
                      value={val.description}
                      onChange={(e) => handleUpdateValue(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cloud text-xs px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-bottom-2 z-50">
          Saved successfully
        </div>
      )}
    </div>
  )
}

