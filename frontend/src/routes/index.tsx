import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/site/hero'
import { CategoryTiles } from '@/components/site/category-tiles'
import { ProductCarousel } from '@/components/site/product-carousel'
import { TrustStrip } from '@/components/site/trust-strip'
import { Newsletter } from '@/components/site/newsletter'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <Hero />
      <CategoryTiles />
      <ProductCarousel />
      <TrustStrip />
      <Newsletter />
    </>
  )
}
