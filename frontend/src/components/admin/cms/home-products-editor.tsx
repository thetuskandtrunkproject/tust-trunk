import { useState, useEffect } from 'react'
import { Save, RefreshCw, Bookmark, Search, X } from 'lucide-react'
import { AdminCard, AdminButton } from '@/components/admin/ui/primitives'
import { cmsApi } from '@/lib/admin/cms-api'
import { api } from '@/lib/api'

export function HomeProductsEditor({ cmsKey = 'home-products', title = 'Home Product Showcase' }: { cmsKey?: string, title?: string }) {
  const [data, setData] = useState<any>(null)
  const [originalData, setOriginalData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState('')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const cmsRes = await api.get(`/cms/${cmsKey}`).then(res => res.data).catch(() => null)
      const initial = cmsRes || {
        title: 'New In', subtitle: 'The latest additions to our collection.',
        textColor: '#2D283E', buttonText: 'View all', buttonLink: '/shop', productIds: []
      }
      setData(initial)
      setOriginalData(initial)
      
      // Load details for selected products
      if (initial.productIds && initial.productIds.length > 0) {
        // Just fetch all products for now and filter, or fetch by ID if API supports
        const res = await api.get('/public/products', { params: { limit: 100 } })
        const products = res.data.items || []
        const selected = initial.productIds.map((id: string) => products.find((p: any) => p.id === id)).filter(Boolean)
        setSelectedProducts(selected)
      }
    } catch (err) {
      console.error('Failed to load home products settings', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (val: string) => {
    setSearch(val)
    if (val.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const res = await api.get('/public/products', { params: { search: val, limit: 5 } })
      setSearchResults(res.data.items || [])
    } catch (err) {
      console.error('Search failed', err)
    }
  }

  const addProduct = (product: any) => {
    if (!data.productIds.includes(product.id)) {
      setData({ ...data, productIds: [...data.productIds, product.id] })
      setSelectedProducts([...selectedProducts, product])
    }
    setSearch('')
    setSearchResults([])
  }

  const removeProduct = (id: string) => {
    setData({ ...data, productIds: data.productIds.filter((pId: string) => pId !== id) })
    setSelectedProducts(selectedProducts.filter(p => p.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await api.put(`/cms/${cmsKey}`, { value: data }).then(res => res.data)
      setData(res)
      setOriginalData(res)
      setShowToast('Changes saved successfully!')
      setTimeout(() => setShowToast(''), 3000)
    } catch (err) {
      console.error(err)
      setShowToast('Failed to save changes')
      setTimeout(() => setShowToast(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefault = async () => {
    setIsSaving(true)
    try {
      const res = await api.post(`/cms/${cmsKey}/reset`).then(res => res.data)
      setData(res)
      setOriginalData(res)
      setShowToast('Restored to default!')
      setTimeout(() => setShowToast(''), 3000)
    } catch (err) {
      console.error(err)
      setShowToast('Failed to restore default')
      setTimeout(() => setShowToast(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetDefault = async () => {
    setIsSaving(true)
    try {
      const res = await api.post(`/cms/${cmsKey}/set_default`, { value: data }).then(res => res.data)
      setData(res)
      setOriginalData(res)
      setShowToast('Saved as new default!')
      setTimeout(() => setShowToast(''), 3000)
    } catch (err) {
      console.error(err)
      setShowToast('Failed to set default')
      setTimeout(() => setShowToast(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !data) return <div className="p-8 text-center text-ink/60">Loading Home Products config...</div>

  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(originalData)

  return (
    <AdminCard className="overflow-visible relative">
      <div className="p-6 border-b border-ink/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-ink text-lg flex items-center gap-2">
            {title}
            {hasUnsavedChanges && <span className="text-[10px] font-bold bg-coral text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Unsaved</span>}
          </h3>
          <p className="text-sm text-ink/60">Manage the product carousel on the home page</p>
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

      <div className="p-6 space-y-8">
        <div className="bg-white p-6 rounded-xl border border-ink/5 shadow-sm space-y-6">
          <h4 className="font-medium text-ink">Text & Styling</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Title</label>
              <input type="text" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Subtitle</label>
              <input type="text" value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Button Text</label>
              <input type="text" value={data.buttonText} onChange={(e) => setData({ ...data, buttonText: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Button Link</label>
              <input type="text" value={data.buttonLink} onChange={(e) => setData({ ...data, buttonLink: e.target.value })} className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2 flex items-center gap-2">
                Text Color
                <span className="w-4 h-4 rounded-full border border-ink/20 block" style={{ backgroundColor: data.textColor }} />
              </label>
              <input type="color" value={data.textColor} onChange={(e) => setData({ ...data, textColor: e.target.value })} className="h-10 w-full cursor-pointer rounded border border-ink/20 bg-cloud px-1 py-1" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-ink/5 shadow-sm space-y-6">
          <h4 className="font-medium text-ink">Selected Products</h4>
          <p className="text-sm text-ink/60">Search and select products to display in the carousel. If left empty, the newest products will be displayed automatically.</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cloud border border-ink/20 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ink"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-ink/10 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-cloud border-b border-ink/5 last:border-0 flex items-center gap-3"
                  >
                    {p.images && p.images[0] && (
                      <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            {selectedProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-cloud rounded-lg border border-ink/5">
                <div className="flex items-center gap-3">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-ink/10 rounded" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink/60">₹{p.base_price}</p>
                  </div>
                </div>
                <button onClick={() => removeProduct(p.id)} className="p-1 hover:bg-ink/10 rounded text-ink/60 hover:text-coral transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {selectedProducts.length === 0 && (
              <div className="text-sm text-ink/50 italic py-4">No products selected. Showing newest automatically.</div>
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
    </AdminCard>
  )
}
