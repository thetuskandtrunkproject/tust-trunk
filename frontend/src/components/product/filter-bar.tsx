import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react'

interface FilterBarProps {
  isFiltersOpen: boolean
  onToggleFilters: () => void
  productCount: number
  currentSort: string
  onSortChange: (sort: string) => void
  activeFilterCount: number
}

export function FilterBar({
  isFiltersOpen,
  onToggleFilters,
  productCount,
  currentSort,
  onSortChange,
  activeFilterCount
}: FilterBarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sortOptions = [
    { value: '', label: 'Featured' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ]

  const currentSortLabel = sortOptions.find(o => o.value === currentSort)?.label || 'Featured'

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 mb-8 border-b border-ink/10">
      
      {/* Left: Filters Button + Count */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
            isFiltersOpen 
              ? 'bg-sky text-ink border border-sky' 
              : 'bg-white text-ink border border-ink/20 hover:border-ink/50 hover:bg-sky-soft/50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-ink rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        
        <span className="text-ink/60 font-sans font-medium">
          {productCount} {productCount === 1 ? 'product' : 'products'}
        </span>
      </div>

      {/* Right: Sort */}
      <div className="flex items-center w-full md:w-auto z-40">
        <div className="relative w-full md:w-56" ref={sortRef}>
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center justify-between w-full bg-white border border-ink/20 px-5 py-2.5 rounded-full font-bold text-ink hover:border-ink/50 transition-colors"
          >
            <span className="truncate mr-2">{currentSortLabel}</span>
            <ChevronDown className={`w-4 h-4 text-ink/60 transition-transform shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSortOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-ink/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-2">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value)
                    setIsSortOpen(false)
                  }}
                  className={`flex items-center justify-between w-full text-left px-5 py-3 text-sm font-bold transition-colors ${
                    currentSort === option.value ? 'bg-sky-soft/30 text-sky' : 'text-ink hover:bg-cloud'
                  }`}
                >
                  {option.label}
                  {currentSort === option.value && <Check className="w-4 h-4 text-sky" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

