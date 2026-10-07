import { createFileRoute, Link, useRouter, useNavigate } from '@tanstack/react-router'
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
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { ChevronRight, Heart, Minus, Plus, Truck, ShieldCheck, CheckCircle2, Tag, Zap, Award, Package } from 'lucide-react'

// Import checkout logos
import visaLogo from '@/assets/Checkout_logo/VISA-logo-768x432.png'
import masterLogo from '@/assets/Checkout_logo/masterCard.png'
import upiLogo from '@/assets/Checkout_logo/upi_logo_icon_169316.png'
import codLogo from '@/assets/Checkout_logo/cod.png'
import gpayLogo from '@/assets/Checkout_logo/pngwing.com.png'
import paytmLogo from '@/assets/Checkout_logo/pngwing.com (1).png'

export const Route = createFileRoute('/products/$slug')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { slug } = Route.useParams()
  const router = useRouter()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<PublicProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, name: '', email: '', text: '' })
  const [reviews, setReviews] = useState<any[]>([])
  const { user } = useAuth()


  useEffect(() => {
    let mounted = true
    setLoading(true)

    getPublicProduct(slug)
      .then(async (data) => {
        if (!mounted) return
        setProduct(data)
        
        // Fetch reviews using data.id
        api.get(`/api/v1/products/${data.id}/reviews`)
          .then(res => {
            if (mounted) setReviews(res.data)
          })
          .catch(err => console.error("Failed to fetch reviews", err))

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

  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { showToast } = useToast()

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize('')
      setQuantity(1)
      window.scrollTo(0, 0)
      if (user) {
        setReviewForm(prev => ({
          ...prev,
          name: user.full_name ? user.full_name.trim() : prev.name,
          email: user.email || prev.email
        }))
      }
    }
  }, [product?.id, user])

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
  // Handle sale prices by checking active sale period
  const getActivePrice = (v: any) => {
    if (v.sale_price) {
      const now = new Date()
      const start = v.sale_start_date ? new Date(v.sale_start_date) : null
      const end = v.sale_end_date ? new Date(v.sale_end_date) : null
      const started = !start || now >= start
      const notEnded = !end || now <= end
      if (started && notEnded) return v.sale_price
    }
    return v.price
  }

  const getOriginalPrice = (v: any) => v.price

  const displayPrice = selectedVariant 
    ? getActivePrice(selectedVariant)
    : Math.min(...product.variants.map(v => getActivePrice(v)))
    
  const displayOriginalPrice = selectedVariant
    ? (getActivePrice(selectedVariant) < getOriginalPrice(selectedVariant) ? getOriginalPrice(selectedVariant) : null)
    : (() => {
        const minVariant = product.variants.reduce((prev, curr) => getActivePrice(prev) < getActivePrice(curr) ? prev : curr)
        return getActivePrice(minVariant) < getOriginalPrice(minVariant) ? getOriginalPrice(minVariant) : null
      })()
      
  // distinct sizes from variants
  const productSizes = Array.from(new Set(product.variants.map(v => v.size)))

  // Calculate total stock across all variants
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  
  // Get stock status and color
  const getStockStatus = () => {
    if (totalStock === 0) return { label: 'Out of Stock', color: '#DC2626', bg: '#FEF2F2', dotColor: '#DC2626' }
    if (totalStock <= 5) return { label: `Only ${totalStock} left!`, color: '#EA580C', bg: '#FFF7ED', dotColor: '#EA580C' }
    if (totalStock <= 20) return { label: `${totalStock} in stock`, color: '#D97706', bg: '#FFFBEB', dotColor: '#D97706' }
    return { label: `${totalStock} in stock`, color: '#16A34A', bg: '#F0FDF4', dotColor: '#16A34A' }
  }
  
  const stockStatus = getStockStatus()

  // Get SKU from first variant or selected variant
  const displaySku = selectedVariant?.sku || product.variants[0]?.sku || 'N/A'

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariant) {
      showToast("Please select a size")
      return
    }
    
    addItem({
      variant_id: selectedVariant.id,
      quantity
    })
    
    showToast(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart`)
  }

  const handleBuyNow = () => {
    if (!selectedSize || !selectedVariant) {
      showToast("Please select a size")
      return
    }
    
    navigate({ 
      to: '/checkout',
      search: {
        buyNow: selectedVariant.id,
        qty: quantity
      }
    })
  }

  const formatPrice = (price?: number) => ((price ?? 0) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  // Generate product tags
  const productTags = [
    { icon: <Truck className="w-3.5 h-3.5" />, label: 'Free Shipping ≥ ₹3,000', condition: true },
    { icon: <Zap className="w-3.5 h-3.5" />, label: 'Express Delivery', condition: true },
    { icon: <Award className="w-3.5 h-3.5" />, label: '100% Authentic', condition: true },
    { icon: <Package className="w-3.5 h-3.5" />, label: 'Easy Returns', condition: true },
  ]

  return (
    <div className="bg-cloud min-h-screen">
      <ReadingProgress />
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-ink/50 mb-4 md:mb-8 font-sans font-medium">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" search={{ gender: product.gender }} className="hover:text-ink transition-colors">
            {product.gender}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" search={{ gender: product.gender, category: product.category }} className="hover:text-ink transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 mb-24">
          
          {/* Gallery Left */}
          <div className="w-full lg:w-[55%]">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Info Right */}
          <div className="w-full lg:w-[45%] flex flex-col pt-2">
            {/* Product Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
              {productTags.filter(t => t.condition).map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-ink/8 text-ink/70 shadow-sm">
                  {tag.icon}
                  {tag.label}
                </span>
              ))}
            </div>

            {/* Title & Price */}
            <h1 className="font-sans font-bold text-2xl md:text-3xl text-ink mb-1 leading-tight">{product.name}</h1>
            
            {/* SKU & Category Meta */}
            <div className="flex items-center gap-4 mb-4 text-xs text-ink/45 font-medium">
              <span>SKU: <span className="text-ink/60 font-semibold">{displaySku}</span></span>
              <span className="w-1 h-1 bg-ink/20 rounded-full"></span>
              <span>Category: <span className="text-ink/60 font-semibold">{product.category}</span></span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <p className="font-sans font-extrabold text-2xl text-ink">{formatPrice(displayPrice)}</p>
              {displayOriginalPrice && (
                <p className="font-sans font-medium text-lg text-ink/40 line-through">{formatPrice(displayOriginalPrice)}</p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: stockStatus.bg, color: stockStatus.color }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stockStatus.dotColor }}></span>
                {stockStatus.label}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <span className="text-sm font-bold text-ink mb-3 block">
                Select Size {selectedSize && <span className="text-ink/40 font-normal ml-2">— {selectedSize}</span>}
              </span>
              <div className="flex flex-wrap gap-2">
                {productSizes.map(size => {
                  const oos = isOutOfStock(size)
                  const isActive = selectedSize === size
                  const variant = product.variants.find(v => v.size === size)
                  const sizeStock = variant?.stock || 0
                  return (
                    <button
                      key={size}
                      onClick={() => !oos && setSelectedSize(size)}
                      disabled={oos}
                      className={`relative min-w-[4rem] px-4 py-2.5 border rounded-lg text-sm font-bold transition-all duration-200 ${
                        oos ? 'border-ink/5 text-ink/20 cursor-not-allowed bg-ink/[0.02] line-through decoration-ink/15' :
                        isActive ? 'border-ink bg-ink text-white shadow-md scale-105' : 'border-ink/15 text-ink hover:border-ink/40 hover:shadow-sm bg-white'
                      }`}
                    >
                      {size}
                      {!oos && sizeStock <= 3 && sizeStock > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {sizeStock}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {selectedSize && isOutOfStock(selectedSize) && (
                 <p className="text-sm text-red-500 mt-2 font-semibold">Out of stock in this size</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-ink/12 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-4 py-3 text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-ink w-10 text-center tabular-nums">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="px-4 py-3 text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={totalStock === 0}
                  className="flex-1 bg-cta text-white py-3.5 rounded-xl font-bold text-base hover:bg-cta/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  Add to Cart
                </button>

                {/* Wishlist */}
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 shadow-sm ${
                    wishlisted 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : 'bg-white border-ink/12 text-ink/40 hover:text-red-400 hover:border-red-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button 
                onClick={handleBuyNow}
                disabled={totalStock === 0}
                className="w-full bg-cta text-white py-3.5 rounded-xl font-bold text-base hover:opacity-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 shadow-md hover:shadow-lg"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Strip */}
            <div className="grid grid-cols-3 gap-3 py-5 border-y border-ink/8 mb-6">
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="w-9 h-9 bg-sky/10 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-sky" />
                </div>
                <span className="text-[10px] uppercase font-bold text-ink/60 leading-tight">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] uppercase font-bold text-ink/60 leading-tight">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-[10px] uppercase font-bold text-ink/60 leading-tight">Secure Checkout</span>
              </div>
            </div>

            {/* Guaranteed Safe Checkout */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-emerald-700">Guaranteed Safe Checkout</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { src: visaLogo, alt: 'Visa' },
                  { src: masterLogo, alt: 'Mastercard' },
                  { src: upiLogo, alt: 'UPI' },
                  { src: gpayLogo, alt: 'Google Pay' },
                  { src: paytmLogo, alt: 'PhonePe' },
                  { src: codLogo, alt: 'COD' },
                ].map((logo, i) => (
                  <div key={i} className="h-7 px-2 bg-[#F8F9FA] rounded-md flex items-center border border-ink/5">
                    <img src={logo.src} alt={logo.alt} loading="lazy" className="h-5 w-auto object-contain max-w-[50px]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Accordions */}
            <Accordion>
              <AccordionItem 
                title="DESCRIPTION" 
                defaultOpen 
                content={<p className="text-ink/70 leading-relaxed whitespace-pre-wrap text-sm">{product.description}</p>} 
              />
              {product.details && product.details.length > 0 && (
                <AccordionItem 
                  title="PRODUCT DETAILS" 
                  content={
                    <div className="flex flex-col space-y-3">
                      {product.details.map((detail: any, index: number) => (
                        <div key={index} className="flex justify-between items-start text-[14px]">
                          <span className="text-ink/60 font-medium">{detail.key}</span>
                          <span className="text-ink font-semibold text-right max-w-[60%]">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  } 
                />
              )}
            </Accordion>
            
          </div>
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <div className="mb-24 pt-12 border-t border-ink/10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-ink">You May Also Like</h2>
              <Link to="/shop" search={{ gender: product.gender }} className="text-sm font-semibold text-ink/50 hover:text-ink transition-colors flex items-center gap-1 group">
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map(p => (
                <div key={p.id}>
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
                <span className="font-bold text-ink text-2xl">
                  {reviews.length > 0 
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : "0.0"}
                </span>
              </div>
              <p className="text-ink/60 mb-6 font-sans font-bold">Based on {reviews.length} reviews</p>
              {!showReviewForm ? (
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="w-full border-2 border-ink text-ink font-bold py-4 rounded-full hover:bg-cta hover:text-white transition-colors"
                >
                  Write a Review
                </button>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm mt-4 animate-in fade-in zoom-in-95">
                  <h3 className="font-bold text-lg text-ink mb-4">Leave a Review</h3>
                  
                  <div className="mb-4 flex items-center gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className={`text-3xl transition-colors hover:scale-110 ${reviewForm.rating >= star ? 'text-sunshine' : 'text-ink/20'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div className="mb-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sunshine"
                    />
                  </div>

                  {!user && (
                    <div className="mb-4">
                      <input 
                        type="email" 
                        placeholder="Your Email (kept private, used for verifying purchase)" 
                        value={reviewForm.email}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sunshine"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <textarea 
                      placeholder="Share your thoughts about this product..." 
                      rows={4}
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sunshine resize-none"
                    ></textarea>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 border-2 border-ink text-ink font-bold py-3 rounded-full hover:bg-ink/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        if (!reviewForm.name || (!user && !reviewForm.email) || !reviewForm.text) {
                          showToast("Please fill all fields", "error")
                          return
                        }
                        try {
                          await api.post(`/api/v1/products/${product!.id}/reviews`, {
                            rating: reviewForm.rating,
                            reviewer_name: reviewForm.name,
                            guest_email: user ? undefined : reviewForm.email,
                            body_text: reviewForm.text
                          })
                          setShowReviewForm(false);
                          setReviewForm({ rating: 5, name: '', email: '', text: '' });
                          showToast('Review submitted for moderation!', 'success');
                        } catch (err: any) {
                          showToast(err.response?.data?.detail || "Failed to submit review", "error")
                        }
                      }}
                      className="flex-1 bg-cta text-white font-bold py-3 rounded-full hover:bg-cta/90 transition-colors disabled:opacity-50"
                      disabled={!reviewForm.name || (!user && !reviewForm.email) || !reviewForm.text}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="md:w-2/3 flex flex-col gap-6">
              {reviews.length === 0 && (
                <p className="text-ink/60 italic p-8 text-center bg-white rounded-2xl border border-ink/5">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              )}
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-8 rounded-2xl border border-ink/5 shadow-sm relative">
                  {review.is_verified_purchase && (
                    <div className="absolute top-8 right-8 flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-ink">{review.reviewer_name}</span>
                    <span className="text-sm text-ink/40 font-bold mr-24">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-sunshine text-lg mb-4">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={star <= review.rating ? 'text-sunshine' : 'text-ink/10'}>★</span>
                    ))}
                  </div>
                  <p className="text-ink/70 text-base leading-relaxed font-sans font-medium">
                    {review.body_text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add to Cart — positioned above the bottom nav */}
      <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-ink/10 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button 
          onClick={handleAddToCart}
          disabled={totalStock === 0}
          className="w-full bg-cta text-white py-3.5 rounded-2xl font-bold shadow-xl disabled:opacity-40 active:scale-[0.98] transition-all text-sm"
        >
          Add to Cart — {formatPrice(displayPrice * quantity)}
        </button>
      </div>
    </div>
  )
}

