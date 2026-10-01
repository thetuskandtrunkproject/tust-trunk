import { useState, useEffect, useMemo } from 'react'
import { X, Check, Tag, Percent } from 'lucide-react'
import type { AdminProductListItem } from '@/lib/admin/products-api'
import { fetchAdminProducts, bulkUpdateSalePrice } from '@/lib/admin/products-api'
import { useToast } from '@/context/toast-context'
import { AdminSpinner } from '../ui/primitives'

interface DiscountManagerPanelProps {
  onClose: () => void
}

export function DiscountManagerPanel({ onClose }: DiscountManagerPanelProps) {
  const { showToast } = useToast()
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false)
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<string>('')
  
  const [bulkPrice, setBulkPrice] = useState<string>('')

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetchAdminProducts(1, 100, { 
        search: search || undefined,
        include_variants: true 
      })
      setProducts(res.items)
    } catch (err) {
      showToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const displayedProducts = useMemo(() => {
    if (!showOnlyOnSale) return products
    return products.filter(p => {
      const v = p.variants?.[0]
      return v && v.sale_price !== null && v.sale_price !== undefined
    })
  }, [products, showOnlyOnSale])

  const allSelected = displayedProducts.length > 0 && selectedIds.length === displayedProducts.length

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(displayedProducts.map(p => p.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSaveDiscount = async (productId: string) => {
    const priceVal = parseFloat(editPrice)
    if (isNaN(priceVal) || priceVal < 0) {
      showToast('Invalid price', 'error')
      return
    }
    try {
      await bulkUpdateSalePrice([productId], priceVal * 100) // to paise
      showToast('Discount applied successfully!')
      setEditingId(null)
      loadProducts()
    } catch (err) {
      showToast('Failed to apply discount', 'error')
    }
  }

  const handleBulkApply = async () => {
    const priceVal = parseFloat(bulkPrice)
    if (isNaN(priceVal) || priceVal < 0) {
      showToast('Please enter a valid bulk sale price', 'error')
      return
    }
    try {
      await bulkUpdateSalePrice(selectedIds, priceVal * 100) // to paise
      showToast(`Discount applied to ${selectedIds.length} products!`)
      setBulkPrice('')
      setSelectedIds([])
      loadProducts()
    } catch (err) {
      showToast('Failed to apply bulk discount', 'error')
    }
  }

  const handleRemoveSale = async (productId: string) => {
    try {
      await bulkUpdateSalePrice([productId], null)
      showToast('Discount removed')
      loadProducts()
    } catch (err) {
      showToast('Failed to remove discount', 'error')
    }
  }

  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) return
    try {
      await bulkUpdateSalePrice(selectedIds, null)
      showToast(`Removed discount from ${selectedIds.length} products`)
      setSelectedIds([])
      loadProducts()
    } catch (err) {
      showToast('Failed to remove discounts', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[650px] bg-[#F4F6F8] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-[#E3E3E3] flex justify-between items-start shrink-0">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-[#E1F3FA] text-[#005bd3] rounded-xl">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#202223] tracking-tight">Discount Manager</h2>
              <p className="text-[14px] text-[#6D7175] mt-1 leading-relaxed">Quickly apply, edit, or remove sale prices across your catalog.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#5C5F62] hover:bg-[#F4F6F8] rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white px-8 py-5 border-b border-[#E3E3E3] shrink-0">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Name or SKU..."
              className="w-full bg-[#F4F6F8] border border-transparent hover:border-[#C9CCCF] text-[#202223] rounded-xl px-5 py-3 h-[48px] text-[15px] focus:bg-white focus:outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-all"
            />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[14px] text-[#202223] font-semibold">Show only products on sale</span>
            <button 
              onClick={() => setShowOnlyOnSale(!showOnlyOnSale)}
              className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${showOnlyOnSale ? 'bg-[#005bd3]' : 'bg-[#C9CCCF]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${showOnlyOnSale ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-[#E3E3E3] shadow-sm">
            <label className="flex items-center gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={allSelected} 
                onChange={handleToggleAll}
                className="w-5 h-5 rounded border-[#C9CCCF] text-[#005bd3] focus:ring-[#005bd3] transition-all cursor-pointer"
              />
              <span className="text-[13px] font-bold tracking-wider text-[#6D7175] uppercase group-hover:text-[#202223] transition-colors">Select All</span>
            </label>
            
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1 border border-[#E3E3E3]">
                  <span className="pl-3 pr-1 text-[13px] font-semibold text-[#6D7175]">₹</span>
                  <input 
                    type="number"
                    placeholder="Set bulk price"
                    value={bulkPrice}
                    onChange={e => setBulkPrice(e.target.value)}
                    className="w-28 bg-transparent text-[14px] py-1 px-2 focus:outline-none font-medium"
                  />
                  <button 
                    onClick={handleBulkApply}
                    className="bg-[#005bd3] hover:bg-[#004c99] text-white px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <div className="w-px h-6 bg-[#E3E3E3] mx-1" />
                <button 
                  onClick={handleBulkRemove}
                  className="text-[13px] font-semibold text-[#D82C0D] hover:bg-[#FEECEB] px-3 py-2 rounded-lg transition-colors"
                >
                  Remove Sale ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><AdminSpinner /></div>
          ) : displayedProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Tag className="w-6 h-6 text-[#C9CCCF]" />
              </div>
              <h3 className="text-[16px] font-bold text-[#202223]">No products found</h3>
              <p className="text-[14px] text-[#6D7175] mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedProducts.map(p => {
                const variant = p.variants?.[0]
                const basePrice = variant ? variant.price / 100 : 0
                const salePrice = variant && variant.sale_price !== null && variant.sale_price !== undefined ? variant.sale_price / 100 : null
                const hasSale = salePrice !== null
                const isSelected = selectedIds.includes(p.id)
                const isCurrentlyEditing = editingId === p.id
                
                let offAmt = 0
                let offPct = 0
                if (hasSale && salePrice !== null) {
                  offAmt = basePrice - salePrice
                  offPct = basePrice > 0 ? Math.round((offAmt / basePrice) * 100) : 0
                }

                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center p-5 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-[#005bd3] shadow-[0_4px_12px_rgba(0,91,211,0.08)]' : 
                      hasSale ? 'bg-[#E1F3FA]/30 border-transparent hover:border-[#E3E3E3]' : 
                      'bg-white border-transparent hover:border-[#E3E3E3] hover:shadow-sm'
                    }`}
                  >
                    <div className="mr-5">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p.id)}
                        className="w-5 h-5 rounded border-[#C9CCCF] text-[#005bd3] focus:ring-[#005bd3] transition-all cursor-pointer"
                      />
                    </div>
                    
                    <div className="w-14 h-14 shrink-0 bg-[#F4F6F8] rounded-xl border border-[#E3E3E3] overflow-hidden mr-5 shadow-sm">
                      {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-[15px] font-bold text-[#202223] truncate">{p.name}</h3>
                      <div className="text-[14px] text-[#6D7175] mt-1 font-medium">
                        Base: <span className={hasSale ? 'line-through text-[#8C9196]' : 'text-[#202223]'}>₹{basePrice}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end text-right min-w-[220px]">
                      {isCurrentlyEditing ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8C9196] font-semibold">₹</span>
                            <input 
                              type="number"
                              autoFocus
                              placeholder="New price"
                              value={editPrice}
                              onChange={e => setEditPrice(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveDiscount(p.id) }}
                              className="w-28 pl-7 pr-3 py-2 text-[14px] font-semibold border-2 border-[#005bd3] rounded-lg focus:outline-none ring-4 ring-[#005bd3]/10"
                            />
                          </div>
                          <button 
                            onClick={() => handleSaveDiscount(p.id)}
                            className="p-2 bg-[#005bd3] text-white rounded-lg hover:bg-[#004c99] transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-2 text-[#5C5F62] hover:bg-black/5 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : hasSale ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="text-[12px] font-bold text-[#005bd3] bg-[#E1F3FA] px-2 py-0.5 rounded uppercase tracking-wide">
                            ₹{offAmt} OFF ({offPct}%)
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="text-[14px] font-medium text-[#202223]">
                              Sale: <span className="text-[#005bd3] font-bold text-[16px]">₹{salePrice}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditingId(p.id)
                                  setEditPrice(salePrice!.toString())
                                }}
                                className="px-3 py-1.5 text-[#005bd3] text-[13px] font-bold hover:bg-[#E1F3FA] rounded-lg transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleRemoveSale(p.id)}
                                className="px-3 py-1.5 text-[#5C5F62] text-[13px] font-semibold hover:bg-black/5 rounded-lg transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <span className="text-[13px] italic text-[#8C9196]">No active sale</span>
                          <button 
                            onClick={() => {
                              setEditingId(p.id)
                              setEditPrice('')
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9CCCF] text-[#202223] text-[13px] font-bold rounded-xl hover:border-[#202223] hover:shadow-sm transition-all"
                          >
                            <Percent className="w-4 h-4 text-[#5C5F62]" /> Add Discount
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
