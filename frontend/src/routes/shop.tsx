import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { FilterSidebar } from '@/components/product/filter-sidebar'
import { ProductCard } from '@/components/product/product-card'
import { mockProducts } from '@/lib/mock-products'
import { SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react'

type ShopSearch = {
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const activeCategory = search.category || 'All'
  const pageTitle = activeCategory === 'All' ? 'All Products' : `${activeCategory}'s Collection`

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts]

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12 pb-8 border-b border-ink/10">
        <div>
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
          <h1 className="font-heading text-4xl lg:text-6xl text-ink font-bold capitalize">
            {search.gender ? search.gender : search.category ? search.category : 'All Products'}
          </h1>
          <p className="text-ink/60 mt-2">{filteredProducts.length} products</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-ink/20 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-ink/5"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="relative group">
            <select 
              className="appearance-none bg-cloud border border-ink/20 pl-4 pr-10 py-2.5 rounded-full text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ink cursor-pointer"
              value={search.sort || ''}
              onChange={(e) => navigate({ search: (prev) => ({ ...prev, sort: e.target.value }), replace: true })}
            >
              <option value="">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-ink/60" />
          </div>
        </div>
      </div>

      <div className="flex">
        <FilterSidebar 
          isOpen={isMobileFilterOpen} 
          onClose={() => setIsMobileFilterOpen(false)} 
          currentFilters={search} 
        />

        <div className="flex-1 w-full">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
