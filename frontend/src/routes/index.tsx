import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useCallback } from 'react'
import { Hero } from '@/components/site/hero'
import { CategoryTiles } from '@/components/site/category-tiles'
import { ProductCarousel } from '@/components/site/product-carousel'
import { TrustStrip } from '@/components/site/trust-strip'
import { Newsletter } from '@/components/site/newsletter'
import { BrandIntroLoader } from '@/components/site/brand-intro-loader'
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
  const matchCutTriggerRef = useRef<(() => void) | null>(null)
  const [isIntroActive, setIsIntroActive] = useState(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    const isForced = params.get('intro') === '1' || window.location.href.includes('intro=1')
    if (isForced) {
      sessionStorage.removeItem('tusk_intro_seen')
      return true
    }
    const hasSeen = sessionStorage.getItem('tusk_intro_seen')
    return !hasSeen
  })

  const registerMatchCutTrigger = useCallback((trigger: () => void) => {
    matchCutTriggerRef.current = trigger
  }, [])

  const handleMatchCut = useCallback((_targetProgress?: number) => {
    matchCutTriggerRef.current?.()
  }, [])

  const handleIntroComplete = useCallback(() => {
    setIsIntroActive(false)
  }, [])

  return (
    <div className="flex flex-col relative">
      {isIntroActive && (
        <BrandIntroLoader 
          onMatchCut={handleMatchCut} 
          onComplete={handleIntroComplete} 
        />
      )}
      <Hero 
        initialData={heroData} 
        isIntroActive={isIntroActive} 
        registerMatchCutTrigger={registerMatchCutTrigger} 
      />
      <div className="relative z-10 bg-cloud">
        <CategoryTiles initialData={featuredProducts} />
        <ProductCarousel initialData={newProducts} cmsKey="home-products" defaultTitle="New In" />
        <ProductCarousel initialData={[]} cmsKey="home-products-2" defaultTitle="Crafted with Love for Little Ones" />
        <TrustStrip />
        <Newsletter />
      </div>
    </div>
  )
}

