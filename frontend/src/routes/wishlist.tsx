import { createFileRoute, Link } from '@tanstack/react-router'
import { useWishlist } from '@/context/wishlist-context'
import { useCart } from '@/context/cart-context'
import { useToast } from '@/context/toast-context'
import { mockProducts } from '@/lib/mock-products'
import { ProductCard } from '@/components/product/product-card'
import { ShoppingBag, HeartCrack } from 'lucide-react'

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
})

function WishlistPage() {
  const { wishlistIds } = useWishlist()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const wishlistedProducts = mockProducts.filter(p => wishlistIds.includes(p.id))

  const handleMoveToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId: product.id,
      size: product.sizes[0], // default to first available size
      quantity: 1
    })

    showToast(`Moved ${product.name} to cart`)
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16 min-h-[70vh]">
      <div className="flex items-end justify-between mb-12 border-b border-ink/10 pb-6">
        <div>
          <h1 className="font-fraunces text-4xl md:text-5xl text-ink mb-2">Your Wishlist</h1>
          <p className="text-ink/60">{wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-ink/5 rounded-3xl text-center px-4">
          <HeartCrack className="w-16 h-16 text-ink/20 mb-6" />
          <h3 className="font-fraunces text-2xl text-ink mb-3">Nothing saved yet.</h3>
          <p className="text-ink/60 max-w-md mx-auto mb-8">
            Create a list of your favorite items. Click the heart icon on any product to save it here for later.
          </p>
          <Link 
            to="/shop" 
            search={{}} 
            className="bg-ink text-cloud px-8 py-3 rounded-full font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors"
          >
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {wishlistedProducts.map(p => (
            <div key={p.id}>
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
                    className="w-full bg-cloud/90 backdrop-blur-sm text-ink font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-sky-soft transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" /> Move to cart
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
