import { useState, useEffect, useMemo } from 'react'
import { X, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { fetchPublicCategories } from '@/lib/public/catalog-api'
import type { PublicCategory } from '@/lib/public/catalog-api'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentFilters: {
    search?: string
    gender?: string
    category?: string
    sizes?: string
    colors?: string
    minPrice?: string
    maxPrice?: string
  }
}

export function FilterSidebar({ isOpen, onClose, currentFilters }: FilterSidebarProps) {
  const navigate = useNavigate()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gender: true,
    category: true,
    size: true,
    price: true,
  })

  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  useEffect(() => {
    fetchPublicCategories()
      .then(res => {
        setCategories(res)
        setLoadingCats(false)
      })
      .catch(err => {
        console.error('Failed to load categories', err)
        setLoadingCats(false)
      })
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Parse current arrays
  const activeSizes = currentFilters.sizes ? currentFilters.sizes.split(',') : []
  
  const hasActiveFilters = Object.values(currentFilters).some(v => v !== undefined && v !== '')

  const updateSearch = (newParams: Record<string, string | undefined>) => {
    navigate({
      to: '/shop',
      search: (prev: any) => {
        const next: Record<string, any> = { ...prev, ...newParams }
        // Clean up empty params
        Object.keys(next).forEach(key => {
          if (!next[key]) delete next[key]
        })
        return next
      },
      replace: true // Use replace to avoid bloating history
    })
  }

  const handleSizeToggle = (size: string) => {
    const newSizes = activeSizes.includes(size)
      ? activeSizes.filter(s => s !== size)
      : [...activeSizes, size]
    updateSearch({ sizes: newSizes.length > 0 ? newSizes.join(',') : undefined })
  }

  const clearAllFilters = () => {
    navigate({
      to: '/shop',
      search: (prev: Record<string, any>) => ({
        sort: prev.sort // Keep only the sort param, clear everything else
      }),
      replace: true
    })
  }

  const maxAllowedPrice = 100000
  const [localMinPrice, setLocalMinPrice] = useState(0)
  const [localMaxPrice, setLocalMaxPrice] = useState(maxAllowedPrice)

  useEffect(() => {
    const parsedMin = currentFilters.minPrice ? Number(currentFilters.minPrice) : 0
    const parsedMax = currentFilters.maxPrice ? Number(currentFilters.maxPrice) : maxAllowedPrice
    
    setLocalMinPrice(Math.max(0, Math.min(parsedMin, maxAllowedPrice)))
    setLocalMaxPrice(Math.max(0, Math.min(parsedMax, maxAllowedPrice)))
  }, [currentFilters.minPrice, currentFilters.maxPrice, maxAllowedPrice])

  const applyPriceFilter = () => {
    updateSearch({ 
      minPrice: localMinPrice > 0 ? localMinPrice.toString() : undefined, 
      maxPrice: localMaxPrice < maxAllowedPrice ? localMaxPrice.toString() : undefined 
    })
  }

  const filterContent = (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar p-6 lg:p-0">
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h2 className="font-heading text-3xl font-bold text-ink">Filters</h2>
        <button onClick={onClose} className="p-2 text-ink/70 hover:text-ink">
          <X className="w-6 h-6" />
        </button>
      </div>

      {hasActiveFilters && (
        <div className="mb-6 flex flex-col items-start gap-4">
          {currentFilters.search && (
            <div className="flex items-center gap-2 bg-coral/10 text-coral px-3 py-1.5 rounded-full text-sm font-bold border border-coral/20">
              <span>Search: {currentFilters.search}</span>
              <button 
                onClick={() => updateSearch({ search: undefined })}
                className="hover:bg-coral/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button 
            onClick={clearAllFilters}
            className="text-sm font-bold text-ink underline underline-offset-4 hover:text-sky transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Gender */}
      <div className="border-b border-ink/10 py-5">
          <button 
            className="flex items-center justify-between w-full text-ink font-heading font-bold text-lg"
            onClick={() => toggleSection('gender')}
          >
            Gender
            {expandedSections.gender ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.gender && (
            <div className="mt-4 flex flex-col gap-3">
              {['Women', 'Kids'].map(g => {
                return (
                  <button 
                    key={g} 
                    className="flex items-center justify-between cursor-pointer group w-full text-left"
                    onClick={() => updateSearch({ gender: currentFilters.gender === g ? undefined : g })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${currentFilters.gender === g ? 'bg-mint border-mint scale-110' : 'border-ink/20 group-hover:border-ink/50'}`}>
                        {currentFilters.gender === g && <Check className="w-3 h-3 text-ink" />}
                      </div>
                      <span className="text-ink/80 text-sm font-bold group-hover:text-ink">{g}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      {/* Categories (Clothing Type) */}
      <div className="border-b border-ink/10 py-5">
          <button 
            className="flex items-center justify-between w-full text-ink font-heading font-bold text-lg"
            onClick={() => toggleSection('category')}
          >
            Category
            {expandedSections.category ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.category && (
            <div className="mt-4 flex flex-col gap-3">
              {loadingCats ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-ink/40" /></div>
              ) : categories.map(cat => {
                return (
                  <button 
                    key={cat.id} 
                    className="flex items-center justify-between cursor-pointer group w-full text-left"
                    onClick={() => updateSearch({ category: currentFilters.category === cat.slug ? undefined : cat.slug })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${currentFilters.category === cat.slug ? 'bg-sunshine border-sunshine scale-110' : 'border-ink/20 group-hover:border-ink/50'}`}>
                        {currentFilters.category === cat.slug && <Check className="w-3 h-3 text-ink" />}
                      </div>
                      <span className="text-ink/80 text-sm font-bold group-hover:text-ink">{cat.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      {/* Sizes */}
      <div className="border-b border-ink/10 py-5">
        <button 
          className="flex items-center justify-between w-full text-ink font-heading font-bold text-lg"
          onClick={() => toggleSection('size')}
        >
          Size
          {expandedSections.size ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.size && (
          <div className="mt-4 flex flex-col gap-3">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2Y', '4Y', '6Y', '8Y'].map(size => {
              const isActive = activeSizes.includes(size)
              return (
                <button 
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-sky border-sky scale-110' : 'border-ink/20 group-hover:border-ink/50'}`}>
                      {isActive && <Check className="w-3 h-3 text-ink" />}
                    </div>
                    <span className="text-ink/80 text-sm font-bold group-hover:text-ink">{size}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>



      {/* Price Range (Simplified) */}
      <div className="py-5">
        <button 
          className="flex items-center justify-between w-full text-ink font-heading font-bold text-lg"
          onClick={() => toggleSection('price')}
        >
          Price
          {expandedSections.price ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.price && (
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-ink/60 text-sm">The highest price is Rs. 100,000</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-ink/60 font-bold">₹</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="0" 
                  className="w-full bg-ink/5 border-none rounded-full px-4 py-3 text-sm font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  value={localMinPrice === 0 ? '' : localMinPrice}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '')
                    const val = raw === '' ? 0 : Number(raw)
                    if (val <= localMaxPrice) setLocalMinPrice(val)
                  }}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ink/60 font-bold">₹</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="100000" 
                  className="w-full bg-ink/5 border-none rounded-full px-4 py-3 text-sm font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  value={localMaxPrice === 100000 ? '' : localMaxPrice}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '')
                    const val = raw === '' ? 100000 : Number(raw)
                    if (val >= localMinPrice && val <= 100000) setLocalMaxPrice(val)
                  }}
                />
              </div>
            </div>

            <button 
              onClick={applyPriceFilter}
              className="mt-3 w-full py-2.5 bg-ink text-white rounded-full font-bold text-sm hover:bg-sky hover:text-ink transition-colors"
            >
              Apply Price
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:block shrink-0 sticky top-[100px] self-start max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 pr-8 opacity-100' : 'w-0 pr-0 opacity-0 overflow-hidden pointer-events-none'
        }`}
      >
        <div className="w-56">
          {filterContent}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={onClose}></div>
          <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-cloud rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            {filterContent}
          </div>
        </div>
      )}
    </>
  )
}
