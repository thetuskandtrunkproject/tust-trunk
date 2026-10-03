import { useState, useEffect, useMemo } from 'react'
import { X, Check, Trash2, PenLine, Plus, Search, Layers, ArrowLeftRight, Loader2 } from 'lucide-react'
import type { Category } from '@/lib/admin/categories-api'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/admin/categories-api'
import type { AdminProductListItem } from '@/lib/admin/products-api'
import { fetchAdminProducts, bulkMoveCategory } from '@/lib/admin/products-api'
import { useToast } from '@/context/toast-context'
import { AdminSpinner } from '../ui/primitives'

interface CategoryManagerPanelProps {
  onClose: () => void
}

export function CategoryManagerPanel({ onClose }: CategoryManagerPanelProps) {
  const { showToast } = useToast()
  
  // Categories State
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGender, setNewGender] = useState('Unisex')
  const [isSaving, setIsSaving] = useState(false)

  // Edit State
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editGender, setEditGender] = useState('Unisex')

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  // Products State
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCatId, setFilterCatId] = useState('All')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkCatId, setBulkCatId] = useState('')

  const loadData = async () => {
    try {
      setLoadingCats(true)
      const data = await fetchCategories()
      setCategories(data)
    } catch (err) {
      showToast('Failed to load categories', 'error')
    } finally {
      setLoadingCats(false)
    }
    loadProducts()
  }

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const res = await fetchAdminProducts(1, 100, { search: search || undefined })
      setProducts(res.items)
    } catch (err) {
      // silenly fail or show toast
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleCreate = async () => {
    const cleanName = newName.trim()
    if (!cleanName) return
    setIsSaving(true)
    try {
      await createCategory({
        name: cleanName,
        slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: '',
        gender: newGender,
        is_active: true
      })
      showToast('Category created')
      setNewName('')
      setIsAdding(false)
      loadData()
    } catch (err: any) {
      let errorMsg = 'Failed to create category'
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail[0].msg
        }
      }
      showToast(errorMsg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (id: string) => {
    const cleanName = editName.trim()
    if (!cleanName) return
    setIsSaving(true)
    try {
      await updateCategory(id, {
        name: cleanName,
        slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        gender: editGender
      })
      showToast('Category updated')
      setEditCatId(null)
      loadData()
    } catch (err: any) {
      let errorMsg = 'Failed to update category'
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail[0].msg
        }
      }
      showToast(errorMsg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      showToast('Category deleted')
      setDeleteConfirmId(null)
      loadData()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Cannot delete category (might have products)', 'error')
      setDeleteConfirmId(null)
    }
  }

  const handleMoveProduct = async (productId: string, newCategoryId: string) => {
    if (!newCategoryId) return
    try {
      await bulkMoveCategory([productId], newCategoryId)
      showToast('Product moved successfully')
      loadData()
    } catch (err) {
      showToast('Failed to move product', 'error')
    }
  }

  const handleBulkMove = async () => {
    if (!bulkCatId || selectedIds.length === 0) return
    try {
      await bulkMoveCategory(selectedIds, bulkCatId)
      showToast(`Moved ${selectedIds.length} products successfully`)
      setSelectedIds([])
      setBulkCatId('')
      loadData()
    } catch (err) {
      showToast('Failed to move products', 'error')
    }
  }

  const displayedProducts = useMemo(() => {
    if (filterCatId === 'All') return products
    return products.filter(p => p.category_id === filterCatId)
  }, [products, filterCatId])

  const allSelected = displayedProducts.length > 0 && selectedIds.length === displayedProducts.length
  
  const handleToggleAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(displayedProducts.map(p => p.id))
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[650px] bg-[#F4F6F8] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-[#E3E3E3] flex justify-between items-start shrink-0">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-[#E1F3FA] text-[#005bd3] rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#202223] tracking-tight">Category Manager</h2>
              <p className="text-[14px] text-[#6D7175] mt-1 leading-relaxed">Rename categories, delete them, or quickly move products.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#5C5F62] hover:bg-[#F4F6F8] rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          
          {/* Section 1: All Categories */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E3E3E3] bg-[#F4F6F8]/50">
              <h3 className="text-[15px] font-bold text-[#202223]">All Categories</h3>
            </div>
            <div className="p-2">
              <div className="divide-y divide-[#E3E3E3]">
                {loadingCats ? (
                  <div className="py-8 flex justify-center"><AdminSpinner /></div>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-[#F4F6F8] rounded-lg transition-colors group">
                      
                      {editCatId === cat.id ? (
                        <div className="flex-1 flex items-center gap-3 animate-in fade-in">
                          <input 
                            type="text" 
                            value={editName} 
                            onChange={e => setEditName(e.target.value)} 
                            placeholder="Category name"
                            className="flex-1 h-8 px-2 text-[13px] border-2 border-[#005bd3] rounded-lg focus:outline-none ring-2 ring-[#005bd3]/10"
                            autoFocus
                          />
                          <select 
                            value={editGender}
                            onChange={e => setEditGender(e.target.value)}
                            className="h-8 px-2 text-[13px] border border-[#C9CCCF] rounded-lg bg-white focus:outline-none"
                          >
                            <option value="Kids">Kids</option>
                            <option value="Women">Women</option>
                            <option value="Unisex">Unisex</option>
                          </select>
                          <button onClick={() => handleUpdate(cat.id)} disabled={isSaving} className="p-1.5 bg-[#005bd3] text-white rounded-lg hover:bg-[#004c99] disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setEditCatId(null)} disabled={isSaving} className="p-1.5 text-[#5C5F62] hover:bg-black/5 rounded-lg disabled:opacity-50">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] font-bold text-[#005bd3] bg-[#E1F3FA] px-2 py-0.5 rounded-md">{cat.name}</span>
                            <span className="text-[13px] text-[#6D7175]">({cat.product_count} products)</span>
                            <span className="text-[11px] font-bold text-[#8C9196] border border-[#E3E3E3] px-1.5 py-0.5 rounded uppercase">{cat.gender}</span>
                          </div>
                          
                          {deleteConfirmId === cat.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in">
                              <span className="text-[12px] font-medium text-[#6D7175]">Delete?</span>
                              <button onClick={() => handleDelete(cat.id)} className="text-[12px] font-bold text-white bg-[#D82C0D] hover:bg-red-700 px-2.5 py-1 rounded shadow-sm">Yes</button>
                              <button onClick={() => setDeleteConfirmId(null)} className="text-[12px] font-bold text-[#202223] bg-white border border-[#C9CCCF] hover:bg-gray-50 px-2.5 py-1 rounded shadow-sm">No</button>
                            </div>
                          ) : (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditCatId(cat.id)
                                  setEditName(cat.name)
                                  setEditGender(cat.gender)
                                }} 
                                className="p-2 text-[#5C5F62] hover:bg-black/5 hover:text-[#202223] rounded-lg transition-colors"
                              >
                                <PenLine className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteConfirmId(cat.id)} className="p-2 text-[#5C5F62] hover:bg-[#FEECEB] hover:text-[#D82C0D] rounded-lg transition-colors ml-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
                
                {isAdding && (
                  <div className="p-3 flex items-center gap-3 animate-in fade-in bg-[#E1F3FA]/20 rounded-lg mt-1">
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                      placeholder="Category name"
                      className="flex-1 h-9 px-3 text-[13px] border-2 border-[#005bd3] rounded-lg focus:outline-none ring-4 ring-[#005bd3]/10 bg-white"
                      autoFocus
                    />
                    <select 
                      value={newGender}
                      onChange={e => setNewGender(e.target.value)}
                      className="h-9 px-2 text-[13px] border border-[#C9CCCF] rounded-lg bg-white focus:outline-none"
                    >
                      <option value="Kids">Kids</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                    <button onClick={handleCreate} disabled={isSaving} className="p-2 bg-[#005bd3] text-white rounded-lg hover:bg-[#004c99] disabled:opacity-50">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsAdding(false)} disabled={isSaving} className="p-2 text-[#5C5F62] hover:bg-black/5 rounded-lg disabled:opacity-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {!isAdding && (
                <div className="mt-2">
                  <button 
                    onClick={() => setIsAdding(true)} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-[14px] font-semibold text-[#005bd3] bg-[#E1F3FA]/50 hover:bg-[#E1F3FA] rounded-lg transition-colors border border-dashed border-[#005bd3]/30"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Move Products */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-5 py-4 border-b border-[#E3E3E3] bg-[#F4F6F8]/50">
              <h3 className="text-[15px] font-bold text-[#202223]">Move Products</h3>
            </div>
            
            <div className="p-4 border-b border-[#E3E3E3] flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9196]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by Name or SKU..."
                  className="w-full bg-[#F4F6F8] border border-transparent hover:border-[#C9CCCF] text-[#202223] rounded-lg pl-9 pr-4 py-2 text-[13px] focus:bg-white focus:outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-all"
                />
              </div>
              <select 
                value={filterCatId}
                onChange={e => setFilterCatId(e.target.value)}
                className="bg-white border border-[#C9CCCF] text-[#202223] text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-[#005bd3] max-w-[150px]"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="px-4 py-3 border-b border-[#E3E3E3] flex items-center justify-between bg-gray-50/50">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  onChange={handleToggleAll}
                  className="w-4 h-4 rounded-sm border-[#C9CCCF] text-[#005bd3] focus:ring-[#005bd3] transition-all cursor-pointer"
                />
                <span className="text-[12px] font-bold tracking-wider text-[#6D7175] uppercase group-hover:text-[#202223] transition-colors">Select All</span>
              </label>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[12px] text-[#6D7175] font-medium">Move selected to:</span>
                  <select
                    value={bulkCatId}
                    onChange={e => setBulkCatId(e.target.value)}
                    className="bg-white border border-[#005bd3] text-[#005bd3] font-semibold text-[12px] rounded-md px-2 py-1 focus:outline-none"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleBulkMove}
                    disabled={!bulkCatId}
                    className="bg-[#005bd3] hover:bg-[#004c99] disabled:opacity-50 text-white px-3 py-1 rounded-md text-[12px] font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
              {loadingProducts ? (
                <div className="py-12 flex justify-center"><AdminSpinner /></div>
              ) : displayedProducts.length === 0 ? (
                <div className="py-12 text-center text-[#6D7175] text-[13px]">No products match your criteria.</div>
              ) : (
                displayedProducts.map(p => {
                  const isSelected = selectedIds.includes(p.id)
                  return (
                    <div 
                      key={p.id} 
                      className={`flex items-center p-3 rounded-xl border transition-all ${
                        isSelected ? 'bg-[#E1F3FA]/30 border-[#005bd3]/30 shadow-sm' : 'bg-white border-transparent hover:border-[#E3E3E3]'
                      }`}
                    >
                      <div className="mr-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="w-4 h-4 rounded-sm border-[#C9CCCF] text-[#005bd3] focus:ring-[#005bd3] transition-all cursor-pointer"
                        />
                      </div>
                      
                      <div className="w-10 h-10 shrink-0 bg-[#F4F6F8] rounded-lg border border-[#E3E3E3] overflow-hidden mr-4">
                        {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-[13px] font-bold text-[#202223] truncate">{p.name}</h3>
                        <div className="text-[12px] text-[#6D7175] mt-0.5 truncate">{p.category}</div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-[#8C9196]" />
                        <select
                          value={p.category_id}
                          onChange={e => handleMoveProduct(p.id, e.target.value)}
                          className="bg-white border border-[#C9CCCF] text-[#202223] text-[12px] font-medium rounded-md px-2 py-1 focus:outline-none focus:border-[#005bd3] min-w-[120px]"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

