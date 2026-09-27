import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { FilterSidebar } from '@/components/product/filter-sidebar'
import { FilterBar } from '@/components/product/filter-bar'
import { ProductCard } from '@/components/product/product-card'
import { mockProducts } from '@/lib/mock-products'
import { ChevronRight } from 'lucide-react'

type ShopSearch = {
  search?: string
  gender?: string
  category?: string
  sizes?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
}

export const Route = createFileRoute('/shop')({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      search: search.search as string | undefined,
      gender: search.gender as string | undefined,
      category: search.category as string | undefined,
      sizes: search.sizes as string | undefined,
      minPrice: search.minPrice as string | undefined,
      maxPrice: search.maxPrice as string | undefined,
      sort: search.sort as string | undefined,
    }
  },
  component: ShopPage,
})

function ShopPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false) // Starts collapsed

  const activeCategory = search.category || 'All'
  const pageTitle = activeCategory === 'All' ? 'All Products' : `${activeCategory}'s Collection`

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (search.search) count++
    if (search.gender) count++
    if (search.category && search.category.toLowerCase() !== 'all') count++
    if (search.sizes) count += search.sizes.split(',').length
    if (search.minPrice || search.maxPrice) count++
    return count
  }, [search])

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts]

    if (search.search) {
      const q = search.search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }

    if (search.gender) {
      result = result.filter(p => p.gender.toLowerCase() === search.gender?.toLowerCase())
    }

    if (search.category && search.category.toLowerCase() !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === search.category?.toLowerCase())
    }

    if (search.sizes) {
      const selectedSizes = search.sizes.split(',')
      result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)))
    }



    if (search.minPrice) {
      result = result.filter(p => p.price >= Number(search.minPrice))
    }
    
    if (search.maxPrice) {
      result = result.filter(p => p.price <= Number(search.maxPrice))
    }

    if (search.sort) {
      if (search.sort === 'price-asc') result.sort((a, b) => a.price - b.price)
      if (search.sort === 'price-desc') result.sort((a, b) => b.price - a.price)
      if (search.sort === 'newest') {
        result.sort((a, b) => {
          const aNew = a.tags.includes('new') ? 1 : 0
          const bNew = b.tags.includes('new') ? 1 : 0
          return bNew - aNew
        })
      }
    }

    return result
  }, [search])

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="bg-sky-soft/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-ink/60 mb-4 font-sans font-bold">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-sunshine" />
          <Link to="/shop" className="hover:text-ink transition-colors">Shop</Link>
          {(search.gender || search.category) && (
            <>
              <ChevronRight className="w-4 h-4 text-sunshine" />
              <span className="text-ink font-bold capitalize">
                {search.gender ? search.gender : ''} 
                {search.gender && search.category ? ' / ' : ''} 
                {search.category ? search.category : ''}
              </span>
            </>
          )}
        </div>
        <h1 className="font-heading text-3xl lg:text-5xl text-ink font-bold capitalize">
          {search.search ? `Search results for "${search.search}"` : search.gender ? search.gender : search.category ? search.category : 'All Products'}
        </h1>
      </div>

      {/* Toggleable Filter Bar */}
      <FilterBar 
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        productCount={filteredProducts.length}
        currentSort={search.sort || ''}
        onSortChange={(sort) => navigate({ search: (prev) => ({ ...prev, sort }), replace: true })}
        activeFilterCount={activeFilterCount}
      />

      <div className="flex relative">
        <FilterSidebar 
          isOpen={isFiltersOpen} 
          onClose={() => setIsFiltersOpen(false)} 
          currentFilters={search} 
        />

        <div className="flex-1 w-full min-w-0 transition-all duration-300">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 px-4 bg-cloud rounded-[3rem] border border-ink/5">
              <h3 className="font-heading font-bold text-3xl mb-3 text-ink">Oops! Nothing here.</h3>
              <p className="text-ink/70 mb-8 max-w-sm mx-auto font-sans text-lg">We couldn't find any products matching those playful filters. Let's try something else!</p>
              <button 
                onClick={() => navigate({ search: (prev) => ({ category: prev.category }), replace: true })}
                className="bg-coral text-white px-8 py-3 rounded-full font-bold hover:scale-105 hover:shadow-md transition-all"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {filteredProducts.map((p, i) => (
                <div 
                  key={p.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <ProductCard 
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={formatPrice(p.price)}
                    img={p.images[0]}
                    hoverImg={p.images[1]}
                    category={p.category}
                    tags={p.tags}
                  />
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="mt-16 flex justify-center">
              <button className="bg-sky-soft text-ink px-10 py-4 rounded-full font-bold hover:bg-coral hover:text-white hover:scale-105 transition-all shadow-sm">
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
