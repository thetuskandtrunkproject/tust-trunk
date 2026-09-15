import { Link, useSearch, useLocation } from '@tanstack/react-router'
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { CartDrawer } from '@/components/cart/cart-drawer'

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const search: any = useSearch({ strict: false })
  const location = useLocation()
  
  const { cartCount } = useCart()
  const { wishlistIds } = useWishlist()
  
  const getNavClass = (gender?: string, sort?: string) => {
    const isShop = location.pathname.includes('/shop')
    let isActive = false
    
    if (isShop) {
      if (gender) {
        isActive = search.gender?.toLowerCase() === gender.toLowerCase()
      } else if (sort) {
        isActive = search.sort === sort
      } else {
        isActive = !search.gender && !search.sort && !search.category
      }
    }
    
    return `pb-1 border-b-2 transition-all ${isActive ? 'font-bold border-sky text-ink' : 'border-transparent hover:border-sky/50 hover:text-sky'}`
  }

  return (
    <>
      <header className="w-full bg-cloud sticky top-0 z-50 border-b border-ink/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <div className="flex items-center gap-4 lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-ink hover:text-sky transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-12">
              <Link to="/" className="font-fraunces text-2xl md:text-3xl tracking-tight text-ink font-semibold">
                The Tusk & Trunk
              </Link>
              <nav className="hidden lg:flex items-center gap-10 text-sm font-medium text-ink">
                <Link to="/shop" search={{ sort: 'newest' }} className={getNavClass(undefined, 'newest')}>New In</Link>
                <Link to="/shop" search={{ gender: 'Men' }} className={getNavClass('Men')}>Men</Link>
                <Link to="/shop" search={{ gender: 'Women' }} className={getNavClass('Women')}>Women</Link>
                <Link to="/shop" search={{ gender: 'Kids' }} className={getNavClass('Kids')}>Kids</Link>
                <Link to="/shop" search={{}} className={getNavClass()}>All Products</Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-6 text-ink">
              <button className="hover:text-sky transition-colors hidden sm:block"><Search className="w-5 h-5" /></button>
              <Link to="/wishlist" className="hover:text-sky transition-colors hidden sm:flex items-center gap-1 relative">
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-blush rounded-full"></span>}
              </Link>
              <Link to="/account" className="hover:text-sky transition-colors hidden sm:block"><User className="w-5 h-5" /></Link>
              <button onClick={() => setIsCartOpen(true)} className="hover:text-sky transition-colors flex items-center gap-1 relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-ink text-cloud text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-cloud shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
              <div className="p-6 flex justify-between items-center border-b border-ink/10">
                <span className="font-fraunces text-xl font-semibold">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-ink hover:text-sky transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex flex-col p-6 gap-6 text-lg font-medium text-ink">
                <Link to="/shop" search={{ sort: 'newest' }} onClick={() => setIsMobileMenuOpen(false)} className={getNavClass(undefined, 'newest')}>New In</Link>
                <Link to="/shop" search={{ gender: 'Men' }} onClick={() => setIsMobileMenuOpen(false)} className={getNavClass('Men')}>Men</Link>
                <Link to="/shop" search={{ gender: 'Women' }} onClick={() => setIsMobileMenuOpen(false)} className={getNavClass('Women')}>Women</Link>
                <Link to="/shop" search={{ gender: 'Kids' }} onClick={() => setIsMobileMenuOpen(false)} className={getNavClass('Kids')}>Kids</Link>
                <Link to="/shop" search={{}} onClick={() => setIsMobileMenuOpen(false)} className={getNavClass()}>All Products</Link>
              </nav>

              <div className="mt-auto p-6 border-t border-ink/10 flex justify-around text-ink">
                <button className="p-3 hover:text-sky transition-colors bg-ink/5 rounded-full"><Search className="w-5 h-5" /></button>
                <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:text-sky transition-colors bg-ink/5 rounded-full relative">
                  <Heart className="w-5 h-5" />
                  {wishlistIds.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blush rounded-full"></span>}
                </Link>
                <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:text-sky transition-colors bg-ink/5 rounded-full"><User className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>
        )}
      </header>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
