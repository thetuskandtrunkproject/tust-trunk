import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { mockProducts, Product } from '@/lib/mock-products'
import { useDebounce } from '@/hooks/use-debounce' // let's see if this exists, if not I'll write it inline or in hooks

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const debouncedQuery = useDebounce(query, 250)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const popularSearches = ["Dresses", "Co-ord Sets", "New Arrivals", "Sweatshirts", "Denim"]

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      const stored = localStorage.getItem('recentSearches')
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored))
        } catch (e) {}
      }
    } else {
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Live filter results
  let results: Product[] = []
  if (debouncedQuery.trim().length > 0) {
    const lowerQuery = debouncedQuery.toLowerCase()
    results = mockProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 6)
  }

  const handleSearchSubmit = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    // Save to recent
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    
    onClose()
    navigate({ to: '/shop', search: { search: searchQuery } })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(query)
    }
  }

  const removeRecent = (searchToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== searchToRemove)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-0 md:pt-20">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="relative w-full md:w-[600px] lg:w-[800px] h-full md:h-auto md:max-h-[80vh] bg-cloud md:rounded-[2.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-white">
        
        {/* Search Input Header */}
        <div className="p-4 md:p-8 border-b border-ink/10 flex items-center gap-4 shrink-0 bg-white">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-6 w-6 h-6 text-sky" />
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are you looking for?"
              className="w-full bg-cloud border-2 border-ink/10 rounded-full py-4 pl-16 pr-12 text-lg md:text-xl font-heading font-bold text-ink placeholder:text-ink/30 focus:border-sky focus:ring-0 outline-none transition-colors"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-6 p-1 text-ink/40 hover:text-coral transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-3 text-ink/60 hover:text-coral transition-colors rounded-full hover:bg-coral/10 hidden md:block">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* Before Typing State */}
          {!debouncedQuery.trim() && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-xl text-ink mb-4">Recent Searches</h3>
                  <div className="flex flex-col gap-2">
                    {recentSearches.map(term => (
                      <button 
                        key={term} 
                        onClick={() => handleSearchSubmit(term)}
                        className="flex items-center justify-between group p-3 rounded-2xl hover:bg-sky/10 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-ink/40 group-hover:text-sky transition-colors" />
                          <span className="font-medium text-ink group-hover:text-sky transition-colors">{term}</span>
                        </div>
                        <div 
                          onClick={(e) => removeRecent(term, e)}
                          className="p-2 text-ink/30 hover:text-coral transition-colors rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-heading font-bold text-xl text-ink mb-4">Popular Searches</h3>
                <div className="flex flex-wrap gap-3">
                  {popularSearches.map(term => (
                    <button
                      key={term}
                      onClick={() => handleSearchSubmit(term)}
                      className="px-5 py-2.5 bg-white border border-ink/10 rounded-full font-medium text-ink/70 hover:text-sky hover:border-sky hover:bg-sky/5 transition-all hover:-translate-y-0.5"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Typing State: Results */}
          {debouncedQuery.trim() && results.length > 0 && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <h3 className="font-heading font-bold text-xl text-ink mb-4 border-b border-ink/5 pb-4">Products</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map(product => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink/5 shrink-0">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-ink group-hover:text-sky transition-colors line-clamp-1">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-ink/60">{product.category}</span>
                        <span className="text-ink/30 text-xs">•</span>
                        <span className="text-sm font-bold text-ink">₹{(product.price / 100).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="pt-4 border-t border-ink/5 flex justify-center">
                <button 
                  onClick={() => handleSearchSubmit(debouncedQuery)}
                  className="flex items-center gap-2 font-bold text-sky hover:text-coral transition-colors"
                >
                  See all results for "{debouncedQuery}" <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {debouncedQuery.trim() && results.length === 0 && (
            <div className="animate-in fade-in duration-300 text-center py-12">
              <div className="w-20 h-20 bg-watermelon/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-watermelon" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-ink mb-2">No results found</h3>
              <p className="text-ink/60 font-medium mb-10">We couldn't find anything matching "{debouncedQuery}".</p>
              
              <div className="text-left">
                <h4 className="font-heading font-bold text-xl text-ink mb-4">Try these instead</h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularSearches.slice(0, 3).map(term => (
                    <button
                      key={term}
                      onClick={() => handleSearchSubmit(term)}
                      className="px-5 py-2.5 bg-white border border-ink/10 rounded-full font-medium text-ink/70 hover:text-sky hover:border-sky hover:bg-sky/5 transition-all hover:-translate-y-0.5"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Mobile close button at bottom just in case */}
        <div className="p-4 bg-white border-t border-ink/10 md:hidden flex justify-center shrink-0">
           <button 
            onClick={onClose}
            className="w-full py-4 rounded-full font-bold text-ink bg-cloud hover:bg-ink/5 transition-colors"
          >
            Close Search
          </button>
        </div>
      </div>
    </div>
  )
}
