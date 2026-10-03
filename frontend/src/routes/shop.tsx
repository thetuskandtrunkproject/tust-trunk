import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { FilterSidebar } from '@/components/product/filter-sidebar'
import { FilterBar } from '@/components/product/filter-bar'
import { ProductCard } from '@/components/product/product-card'
import { ChevronRight, Loader2 } from 'lucide-react'
import { searchPublicProducts } from '@/lib/public/catalog-api'
import type { PublicProductListItem } from '@/lib/public/catalog-api'

type ShopSearch = {
  search?: string
  gender?: string
  category?: string
  sizes?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  tag?: string
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
      tag: search.tag as string | undefined,
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

  // We can filter by tag if present
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (search.search) count++
    if (search.gender) count++
    if (search.category && search.category.toLowerCase() !== 'all') count++
    if (search.sizes) count += search.sizes.split(',').length
    if (search.minPrice || search.maxPrice) count++
    return count
  }, [search])

  const [products, setProducts] = useState<PublicProductListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    // Reset page to 1 on filter change
    setPage(1)
    loadProducts(1, true)
  }, [search])

  const loadProducts = async (pageToLoad: number, isNewSearch = false) => {
    try {
      if (isNewSearch) setLoading(true)
      const res = await searchPublicProducts({ ...search, page: pageToLoad })
      if (isNewSearch) {
        setProducts(res.items)
      } else {
        setProducts(prev => [...prev, ...res.items])
      }
      setTotal(res.total)
      setHasMore(res.page < res.total_pages)
    } catch (err) {
      console.error('Failed to load products', err)
    } finally {
      if (isNewSearch) setLoading(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadProducts(nextPage, false)
  }

  const formatPrice = (price?: number) => ((price ?? 0) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="bg-cloud min-h-screen">
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
        productCount={total}
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
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-ink/20" />
            </div>
          ) : products.length === 0 ? (
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
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {products.map((p, i) => (
                  <div 
                    key={p.id}
                    className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                    style={{ animationDelay: `${(i % 24) * 50}ms` }}
                  >
                    <ProductCard 
                      id={p.id}
                      slug={p.slug}
                      name={p.name}
                      price={formatPrice(p.min_price)}
                      img={p.images[0]}
                      hoverImg={p.images[1]}
                      category={p.category}
                      tags={p.tags}
                      sizes={p.available_sizes}
                    />
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <div className="mt-16 flex justify-center">
                  <button 
                    onClick={handleLoadMore}
                    className="bg-sky-soft text-ink px-10 py-4 rounded-full font-bold hover:bg-coral hover:text-white hover:scale-105 transition-all shadow-sm"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
