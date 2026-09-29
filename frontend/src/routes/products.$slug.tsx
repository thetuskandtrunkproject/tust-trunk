import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { ImageGallery } from '@/components/product/image-gallery'
import { getPublicProduct, searchPublicProducts } from '@/lib/public/catalog-api'
import type { PublicProduct, PublicProductListItem } from '@/lib/public/catalog-api'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { ProductCard } from '@/components/product/product-card'
import { ReadingProgress } from '@/components/ui/reading-progress'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useToast } from '@/context/toast-context'
import { ChevronRight, Heart, Minus, Plus, Truck, ArrowLeftRight, ShieldCheck, X, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/products/$slug')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { slug } = Route.useParams()
  const router = useRouter()
  
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<PublicProductListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    getPublicProduct(slug)
      .then(async (data) => {
        if (!mounted) return
        setProduct(data)

        // Load related products
        try {
          const res = await searchPublicProducts({ 
            gender: data.gender,
            page_size: 5 // Get 5, filter out current product
          })
          if (mounted) {
            setRelatedProducts(res.items.filter((p: any) => p.slug !== slug).slice(0, 4))
          }
        } catch (err) {
          console.error('Failed to load related products', err)
        }
      })
      .catch(err => {
        console.error('Failed to load product', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [slug])

  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { showToast } = useToast()

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize('')
      setQuantity(1)
      window.scrollTo(0, 0)
    }
  }, [product?.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex items-center justify-center">
        <p className="text-ink/60">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-fraunces text-4xl text-ink mb-4">Product Not Found</h1>
        <p className="text-ink/60 mb-8">We couldn't find the product you're looking for.</p>
        <Link to="/shop" className="bg-ink text-cloud px-8 py-3 rounded-full font-medium hover:bg-sky-soft hover:text-ink transition-colors">
          Return to Shop
        </Link>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)
  
  // All returned variants are active, zero-stock variants are correctly returned
  const isOutOfStock = (size: string) => {
    const variant = product.variants.find(v => v.size === size)
    return variant ? variant.stock <= 0 : true
  }

  // Find the selected variant to get accurate pricing and IDs
  const selectedVariant = product.variants.find(v => v.size === selectedSize)
  // For display price before size is selected, show minimum price among variants
  const displayPrice = selectedVariant 
    ? selectedVariant.price 
    : Math.min(...product.variants.map(v => v.price))
    
  // distinct sizes from variants
  const productSizes = Array.from(new Set(product.variants.map(v => v.size)))

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariant) {
      showToast("Please select a size")
      return
    }
    
    addItem({
      productId: product.id,
      size: selectedVariant.id, // using variant ID instead of size string
      quantity
    })
    
    showToast(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart`)
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="bg-cloud min-h-screen">
      <ReadingProgress />
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-ink/60 mb-4 md:mb-8 font-sans font-bold">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-sunshine" />
          <Link to="/shop" search={{ gender: product.gender }} className="hover:text-ink transition-colors">
            {product.gender}
          </Link>
          <ChevronRight className="w-4 h-4 text-sunshine" />
          <Link to="/shop" search={{ gender: product.gender, category: product.category }} className="hover:text-ink transition-colors">
            {product.category}
          </Link>
          <span className="text-sunshine font-bold">/</span>
          <span className="text-ink font-bold">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-24">
          
          {/* Gallery Left */}
          <div className="w-full lg:w-[60%]">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Info Right */}
          <div className="w-full lg:w-[40%] flex flex-col pt-4">
            <h1 className="font-sans font-bold text-3xl md:text-4xl text-ink mb-2">{product.name}</h1>
            <p className="font-sans font-bold text-xl text-ink mb-6">{formatPrice(displayPrice)}</p>

            {/* Sizes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-ink">Size</span>
                <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs font-bold text-ink/60 hover:text-ink underline underline-offset-4">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {productSizes.map(size => {
                  const oos = isOutOfStock(size)
                  const isActive = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => !oos && setSelectedSize(size)}
                      disabled={oos}
                      className={`min-w-[4rem] px-3 py-2 border rounded-md text-sm font-bold transition-all duration-300 ${
                        oos ? 'border-ink/5 text-ink/20 cursor-not-allowed bg-cloud line-through decoration-ink/20' :
                        isActive ? 'border-ink bg-ink text-white shadow-sm' : 'border-ink/20 text-ink hover:border-ink hover:bg-cloud'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {selectedSize && isOutOfStock(selectedSize) && (
                 <p className="text-sm text-watermelon mt-2 font-bold">Out of stock in this size</p>
              )}
            </div>

            {/* Promo Banner */}
            <div className="bg-[#FFF0ED] text-coral rounded-xl p-4 mb-8">
              <p className="font-bold text-sm mb-1">5% OFF on your First Order !!</p>
              <p className="font-medium text-sm">Free Shipping on Orders above ₹1499 !!</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-between border border-ink/20 rounded-md px-4 py-3 w-1/3 bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-ink/60 hover:text-ink transition-transform">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-ink">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-ink/60 hover:text-ink transition-transform">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-watermelon text-white py-3 rounded-md font-bold text-lg hover:opacity-90 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Add to Cart
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-ink text-white py-3 rounded-md font-bold text-lg hover:opacity-90 active:scale-95 transition-all duration-300 disabled:opacity-50 shadow-sm"
              >
                Buy Now
              </button>
            </div>

            {/* Microcopy Trust Strip */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-ink/10 mb-8 bg-white/30 rounded-xl px-4">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-sky" />
                <span className="text-[10px] uppercase font-bold text-ink/70">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky" />
                <span className="text-[10px] uppercase font-bold text-ink/70">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky" />
                <span className="text-[10px] uppercase font-bold text-ink/70">Secure Checkout</span>
              </div>
            </div>

            {/* Accordions */}
            <Accordion>
              <AccordionItem 
                title="Description" 
                defaultOpen 
                content={<p>{product.description}</p>} 
              />
              <AccordionItem 
                title="Fabric & Care" 
                content={
                  <ul className="list-disc pl-4 space-y-2">
                    <li>100% premium quality material.</li>
                    <li>Machine wash cold.</li>
                    <li>Tumble dry low or hang dry.</li>
                    <li>Do not bleach.</li>
                  </ul>
                } 
              />
              <AccordionItem 
                title="Size & Fit" 
                content={
                  <ul className="list-disc pl-4 space-y-2">
                    <li>True to size fit.</li>
                    <li>Model is wearing size M.</li>
                    <li>Refer to our size guide for detailed measurements.</li>
                  </ul>
                } 
              />
            </Accordion>
            
          </div>
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <div className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
            <h2 className="font-heading font-bold text-4xl text-ink mb-8 text-center md:text-left">You may also like</h2>
            <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar snap-x snap-mandatory pb-8 pt-4 px-2 -mx-2">
              {relatedProducts.map(p => (
                <div key={p.id} className="min-w-[260px] md:min-w-[280px] snap-start">
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
          </div>
        )}

        {/* Reviews Scaffold */}
        <div className="mb-24 border-t border-ink/10 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '150ms' }}>
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="font-heading font-bold text-4xl text-ink mb-4">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex text-sunshine">
                  {[1,2,3,4,5].map(star => <span key={star} className="text-2xl">★</span>)}
                </div>
                <span className="font-bold text-ink text-2xl">4.8</span>
              </div>
              <p className="text-ink/60 mb-6 font-sans font-bold">Based on 124 reviews</p>
              <button className="w-full border-2 border-ink text-ink font-bold py-4 rounded-full hover:bg-ink hover:text-white transition-colors">
                Write a Review
              </button>
            </div>
            
            <div className="md:w-2/3 flex flex-col gap-6">
              {[1, 2, 3].map(review => (
                <div key={review} className="bg-cloud p-8 rounded-[2rem] border border-ink/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-ink">Sarah M.</span>
                    <span className="text-sm text-ink/40 font-bold">2 weeks ago</span>
                  </div>
                  <div className="flex text-sunshine text-lg mb-4">
                    {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
                  </div>
                  <p className="text-ink/80 text-base leading-relaxed font-sans font-medium">
                    Absolutely love the fit and quality. I've washed it several times and it holds up perfectly. Highly recommend!
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)} />
          <div className="relative bg-cloud rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-ink/10 flex justify-between items-center bg-white/50">
              <h3 className="font-heading font-bold text-3xl text-ink">Size Guide</h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-ink/50 hover:text-ink transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-ink/10">
                    <th className="pb-3 font-medium text-ink/60">Size</th>
                    <th className="pb-3 font-medium text-ink/60">Chest (in)</th>
                    <th className="pb-3 font-medium text-ink/60">Waist (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <tr key={size}>
                      <td className="py-3 font-medium">{size}</td>
                      <td className="py-3 text-ink/80">38-40</td>
                      <td className="py-3 text-ink/80">32-34</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-cloud/90 backdrop-blur-md border-t border-ink/10 lg:hidden z-40 transform transition-transform translate-y-0">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-coral text-white py-4 rounded-full font-bold shadow-xl disabled:opacity-50 active:scale-95 transition-transform"
        >
          Add to Cart - {formatPrice(displayPrice * quantity)}
        </button>
      </div>
    </div>
  )
}
