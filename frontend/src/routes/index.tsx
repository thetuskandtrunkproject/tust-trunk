import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/site/hero'
import { CategoryTiles } from '@/components/site/category-tiles'
import { ProductCarousel } from '@/components/site/product-carousel'
import { TrustStrip } from '@/components/site/trust-strip'
import { Newsletter } from '@/components/site/newsletter'
import { api } from '@/lib/api'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [heroRes, featuredRes, newRes] = await Promise.all([
      api.get('/cms/hero').catch(() => ({ data: null })),
      api.get('/public/products', { params: { page_size: 4 } }).catch(() => ({ data: { items: [] } })),
      api.get('/public/products', { params: { sort: 'newest', page_size: 6 } }).catch(() => ({ data: { items: [] } }))
    ])
    
    // Attempt to preload the first hero image on the server/loader level to improve LCP
    if (heroRes.data?.slides?.[0]?.img) {
      if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = heroRes.data.slides[0].img;
        document.head.appendChild(link);
      }
    }

    return {
      heroData: heroRes.data,
      featuredProducts: featuredRes.data?.items || [],
      newProducts: newRes.data?.items || []
    }
  },
  component: Index,
})

function Index() {
  const { heroData, featuredProducts, newProducts } = Route.useLoaderData()

  return (
    <div className="flex flex-col relative">
      <Hero initialData={heroData} />
      <div className="relative z-10 bg-cloud">
        <CategoryTiles initialData={featuredProducts} />
        <ProductCarousel initialData={newProducts} />
        <TrustStrip />
        <Newsletter />
      </div>
    </div>
  )
}
