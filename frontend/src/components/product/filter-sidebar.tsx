import { useState, useMemo } from 'react'
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { brandColors, mockProducts } from '@/lib/mock-products'
import { useNavigate } from '@tanstack/react-router'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentFilters: {
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Parse current arrays
  const activeSizes = currentFilters.sizes ? currentFilters.sizes.split(',') : []
  
  const hasActiveFilters = Object.values(currentFilters).some(v => v !== undefined && v !== '')

  const updateSearch = (newParams: Record<string, string | undefined>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...newParams }
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
      search: (prev: any) => ({
        gender: prev.gender, // keeping top level contexts if any, actually clearAll should probably clear them too, but let's follow existing logic
        category: prev.category,
        sort: prev.sort
      }),
      replace: true
    })
  }

  // Calculate faceted counts
  const getGenderCount = (gender: string) => {
    let available = mockProducts
    if (currentFilters.category) {
      available = available.filter(p => p.category.toLowerCase() === currentFilters.category?.toLowerCase())
    }
    return available.filter(p => p.gender.toLowerCase() === gender.toLowerCase()).length
  }

  const getCategoryCount = (cat: string) => {
    let available = mockProducts
    if (currentFilters.gender) {
      available = available.filter(p => p.gender.toLowerCase() === currentFilters.gender?.toLowerCase())
    }
    return available.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length
  }
  
  const getSizeCount = (size: string) => {
    let available = mockProducts
    if (currentFilters.gender) {
      available = available.filter(p => p.gender.toLowerCase() === currentFilters.gender?.toLowerCase())
    }
    if (currentFilters.category) {
      available = available.filter(p => p.category.toLowerCase() === currentFilters.category?.toLowerCase())
    }
    return available.filter(p => p.sizes.includes(size)).length
  }

  const FilterContent = () => (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar p-6 lg:p-0">
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h2 className="font-heading text-3xl font-bold text-ink">Filters</h2>
        <button onClick={onClose} className="p-2 text-ink/70 hover:text-ink">
          <X className="w-6 h-6" />
        </button>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={clearAllFilters}
          className="text-sm font-medium text-ink underline underline-offset-4 mb-6 self-start hover:text-sky transition-colors"
        >
          Clear all filters
        </button>
      )}

      {/* Gender */}
      {!currentFilters.gender && (
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
                const count = getGenderCount(g)
                if (count === 0) return null
                return (
                  <button 
                    key={g} 
                    className="flex items-center justify-between cursor-pointer group w-full text-left"
                    onClick={() => updateSearch({ gender: g })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${currentFilters.gender === g ? 'bg-mint border-mint scale-110' : 'border-ink/20 group-hover:border-ink/50'}`}>
                        {currentFilters.gender === g && <Check className="w-3 h-3 text-ink" />}
                      </div>
                      <span className="text-ink/80 text-sm font-bold group-hover:text-ink">{g}</span>
                    </div>
                    <span className="text-xs text-ink/40">({count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Categories (Clothing Type) */}
      {!currentFilters.category && (
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
              {['Tees', 'Shirts', 'Hoodies', 'Sweatshirts', 'Sweaters', 'Jeans', 'Pants', 'Shorts', 'Outerwear', 'Dresses', 'Skirts', 'Accessories'].map(cat => {
                const count = getCategoryCount(cat)
                if (count === 0) return null
                return (
                  <button 
                    key={cat} 
                    className="flex items-center justify-between cursor-pointer group w-full text-left"
                    onClick={() => updateSearch({ category: cat })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${currentFilters.category === cat ? 'bg-sunshine border-sunshine scale-110' : 'border-ink/20 group-hover:border-ink/50'}`}>
                        {currentFilters.category === cat && <Check className="w-3 h-3 text-ink" />}
                      </div>
                      <span className="text-ink/80 text-sm font-bold group-hover:text-ink">{cat}</span>
                    </div>
                    <span className="text-xs text-ink/40">({count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

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
              const count = getSizeCount(size)
              if (count === 0) return null // Hide empty sizes
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
                  <span className="text-xs text-ink/40">({count})</span>
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
          <div className="mt-4 flex items-center gap-4">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              value={currentFilters.minPrice || ''}
              onChange={(e) => updateSearch({ minPrice: e.target.value })}
            />
            <span className="text-ink/50">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              className="w-full bg-cloud border border-ink/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              value={currentFilters.maxPrice || ''}
              onChange={(e) => updateSearch({ maxPrice: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 pr-8">
        <FilterContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={onClose}></div>
          <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-cloud rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <FilterContent />
          </div>
        </div>
      )}
    </>
  )
}
