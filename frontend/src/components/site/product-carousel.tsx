import { ProductCard } from '@/components/product/product-card'
import { mockProducts } from '@/lib/mock-products'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export function ProductCarousel() {
  // Get up to 6 'new' products for the carousel
  const products = mockProducts.filter(p => p.tags.includes('new')).slice(0, 6)
  
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <section className="w-full py-16 md:py-24 bg-cloud overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-4xl md:text-5xl text-ink font-bold">New In</h2>
          <p className="text-ink/70 mt-2 text-lg">The latest additions to our collection.</p>
        </div>
        <Link to="/shop" search={{ sort: 'newest' }} className="hidden md:flex items-center gap-2 font-bold text-ink hover:text-sky transition-colors">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="w-full pl-4 lg:pl-8 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory flex">
        <div className="flex gap-6 pr-4 lg:pr-8 w-max">
          {products.map(p => (
            <ProductCard 
              key={p.id} 
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={formatPrice(p.price)}
              img={p.images[0]}

              category={p.category}
              tags={p.tags}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-2 md:hidden">
        <Link to="/shop" search={{ sort: 'newest' }} className="flex items-center justify-center w-full py-4 bg-cloud border border-ink/20 hover:border-ink rounded-xl font-bold text-ink transition-colors">
          View all products
        </Link>
      </div>
    </section>
  )
}
