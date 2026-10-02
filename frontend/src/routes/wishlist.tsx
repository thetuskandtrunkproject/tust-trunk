import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useWishlist } from '@/context/wishlist-context'
import { useCart } from '@/context/cart-context'
import { useToast } from '@/context/toast-context'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/product/product-card'
import { ShoppingBag, HeartCrack, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
})

function WishlistPage() {
  const { wishlistIds } = useWishlist()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const [wishlistedProducts, setWishlistedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      if (wishlistIds.length === 0) {
        setWishlistedProducts([])
        return
      }
      try {
        setIsLoading(true)
        const res = await api.get('/public/products/resolve', {
          params: { ids: wishlistIds.join(',') }
        })
        setWishlistedProducts(res.data.items || [])
      } catch (err) {
        showToast('Failed to load wishlist items')
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [wishlistIds])

  const handleMoveToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()

    // Cannot add to cart directly without knowing which variant (size) the user wants.
    // Redirect to product page to select size.
    window.location.href = `/products/${product.slug}`
  }

  const formatPrice = (price?: number) => (price ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16 min-h-[70vh]">
      <div className="flex items-end justify-between mb-12 border-b border-ink/10 pb-6">
        <div>
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-ink mb-4 tracking-tight">Your Wishlist</h1>
          <p className="font-sans font-bold text-ink/60 text-lg">{wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-mint/40 rounded-[3rem] text-center px-4">
          <HeartCrack className="w-16 h-16 text-ink/20 mb-6" />
          <h3 className="font-heading font-bold text-3xl text-ink mb-4">Nothing saved yet.</h3>
          <p className="text-ink/60 font-medium max-w-md mx-auto mb-8">
            Create a list of your favorite items. Click the heart icon on any product to save it here for later.
          </p>
          <Link 
            to="/shop" 
            search={{}} 
            className="bg-coral text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:shadow-2xl hover:bg-coral/90 transition-all"
          >
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {wishlistedProducts.map((p, idx) => (
            <div 
              key={p.id}
              className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <ProductCard 
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={formatPrice(p.price)}
                img={p.images[0]}
                category={p.category}
                tags={p.tags}
                actionButton={
                  <button
                    onClick={(e) => handleMoveToCart(e, p)}
                    className="w-full bg-white/90 backdrop-blur-sm text-ink font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-coral hover:text-white hover:scale-105 transition-all shadow-md"
                  >
                    <ShoppingBag className="w-5 h-5" /> Move to cart
                  </button>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
