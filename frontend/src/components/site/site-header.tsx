import { Link, useSearch, useLocation } from '@tanstack/react-router'
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, Package, Settings, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SearchOverlay } from '@/components/site/search-overlay'
import { useAuth } from '@/context/auth-context'
import { auth } from '@/lib/firebase'
import { fetchPublicCategories } from '@/lib/public/catalog-api'
import type { PublicCategory } from '@/lib/public/catalog-api'

import logo from '@/assets/logo_full_hd.png'

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [categories, setCategories] = useState<PublicCategory[]>([])

  useEffect(() => {
    fetchPublicCategories().then(setCategories).catch(console.error)
  }, [])
  
  const search: any = useSearch({ strict: false })
  const location = useLocation()
  
  const { cartCount } = useCart()
  const { wishlistIds } = useWishlist()
  const { user, firebaseUser } = useAuth()
  
  const getNavClass = (path: string, exact = false) => {
    let isActive = false
    
    if (exact) {
      isActive = location.pathname === path && !search.gender && !search.sort
    } else {
      isActive = location.pathname.startsWith(path)
    }

    return `px-4 py-2 font-medium text-sm transition-colors ${isActive ? 'text-coral' : 'text-ink hover:text-coral'}`
  }

  const getSubNavClass = (gender: string) => {
    const isActive = location.pathname.includes('/shop') && search.gender?.toLowerCase() === gender.toLowerCase()
    return `block px-6 py-3 text-sm transition-colors ${isActive ? 'text-coral bg-coral/5' : 'text-ink hover:bg-sky/10 hover:text-sky'}`
  }

  return (
    <>
      <header className="w-full sticky top-0 z-50 border-b border-ink/10 shadow-sm" style={{ background: '#FDF6EE' }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Mobile Menu (Left on Mobile) */}
            <div className="flex items-center lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-ink hover:text-sky transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo (Left on Desktop, Center on Mobile) */}
            <div className="flex justify-center lg:justify-start flex-1 lg:flex-none">
              <Link to="/" className="group transition-transform hover:scale-105 flex items-center gap-1 md:gap-2">
                <img src={logo} alt="The Tusk & Trunk" className="h-16 md:h-20 w-auto object-contain mix-blend-multiply" />
              </Link>
            </div>

            {/* Navigation Links (Center - Desktop Only) */}
            <div className="hidden lg:flex flex-1 justify-center">
              <nav className="flex items-center xl:gap-4 lg:gap-2">
                <Link to="/" className={getNavClass('/', true)}>Home</Link>
                <Link to="/shop" className={getNavClass('/shop', true)}>Shop All</Link>
                <Link to="/shop" search={{ sort: 'newest' }} className={getNavClass('/shop/new', false) + (search.sort === 'newest' ? ' text-coral' : '')}>
                  New Arrivals
                </Link>
                
                {/* Categories Dropdown (Mega Menu) */}
                <div className="relative group">
                  <button className="px-3 xl:px-4 py-2 font-medium text-sm text-ink hover:text-coral flex items-center gap-1 transition-colors">
                    Categories <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  
                  {/* Mega Menu Dropdown */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-[500px] z-50">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-ink/5 p-6 grid grid-cols-2 gap-8 before:absolute before:top-4 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-white">
                      
                      {/* Women's Column */}
                      <div>
                        <Link to="/shop" search={{ gender: 'Women' }} className="block font-heading font-bold text-lg text-coral mb-3 hover:opacity-80 transition-opacity">
                          Women's Collection
                        </Link>
                        <div className="flex flex-col gap-2">
                          {categories.filter(c => c.gender === 'Women' || c.gender === 'Unisex').map(category => (
                            <Link 
                              key={category.id} 
                              to="/shop" 
                              search={{ gender: 'Women', category: category.name }} 
                              className="text-[13px] text-ink/70 hover:text-ink hover:translate-x-1 transition-all duration-200"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Kids' Column */}
                      <div>
                        <Link to="/shop" search={{ gender: 'Kids' }} className="block font-heading font-bold text-lg text-sky mb-3 hover:opacity-80 transition-opacity">
                          Kids' Collection
                        </Link>
                        <div className="flex flex-col gap-2">
                          {categories.filter(c => c.gender === 'Kids' || c.gender === 'Unisex').map(category => (
                            <Link 
                              key={category.id} 
                              to="/shop" 
                              search={{ gender: 'Kids', category: category.name }} 
                              className="text-[13px] text-ink/70 hover:text-ink hover:translate-x-1 transition-all duration-200"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <Link to="/shop" search={{ tag: 'sale' }} className={getNavClass('/shop/sale', false) + (search.tag === 'sale' ? ' text-coral' : '')}>
                  Offers
                </Link>

                <Link to="/about" className={getNavClass('/about')}>Our Story</Link>
                <Link to="/contact" className={getNavClass('/contact')}>Reach Us</Link>
              </nav>
            </div>
            
            {/* Search & Icons (Right) */}
            <div className="flex items-center justify-end gap-4 lg:gap-5 flex-1 lg:flex-none text-ink">
              
              {/* Desktop Search Bar */}
              <div className="hidden xl:flex items-center border-b border-ink/20 pb-1 mr-2">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 text-ink/40 hover:text-sky transition-colors cursor-pointer text-sm w-48 justify-between"
                >
                  <span>What are you looking for?</span>
                  <Search className="w-4 h-4 text-ink hover:text-sky transition-colors" />
                </button>
              </div>

              {/* Mobile/Tablet Search Icon */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="xl:hidden text-ink hover:text-sky transition-colors p-2"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link to="/wishlist" className="text-ink hover:text-coral transition-colors hidden sm:flex items-center relative p-2 group">
                <Heart className="w-5 h-5 group-hover:fill-coral/20" />
                {wishlistIds.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full border-2 border-white"></span>}
              </Link>
              <div className="relative group hidden sm:block">
                {firebaseUser ? (
                  <>
                    <Link to="/account" className="text-ink hover:text-sky transition-colors flex items-center p-2 rounded-full hover:bg-sky/10">
                      <User className="w-5 h-5" />
                    </Link>
                    <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 z-50">
                      <div className="bg-white rounded-xl shadow-2xl border border-ink/10 flex flex-col p-1.5 space-y-0.5">
                        <div className="px-3 py-2 border-b border-ink/10 mb-1">
                          <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider">Account</p>
                          <p className="text-sm font-bold text-ink truncate">{user?.full_name || firebaseUser.email}</p>
                        </div>

                        <Link to="/account" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink rounded-lg hover:bg-cloud transition-colors">
                          <User className="w-4 h-4 text-ink/60" />
                          My Account
                        </Link>
                        <Link to="/account/orders" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink rounded-lg hover:bg-cloud transition-colors">
                          <Package className="w-4 h-4 text-ink/60" />
                          Order History
                        </Link>
                        <Link to="/account/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink rounded-lg hover:bg-cloud transition-colors">
                          <Settings className="w-4 h-4 text-ink/60" />
                          Settings
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'owner') && (
                          <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-sky bg-sky/10 rounded-lg hover:bg-sky/20 transition-colors my-1">
                            <LayoutDashboard className="w-4 h-4 text-sky" />
                            Admin Panel
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            auth.signOut()
                            window.location.href = '/'
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-coral rounded-lg hover:bg-coral/10 transition-colors mt-1 border-t border-ink/5 pt-2"
                        >
                          <LogOut className="w-4 h-4 text-coral" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to="/login" className="text-ink hover:text-sky transition-colors flex items-center p-2">
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>
              <button onClick={() => setIsCartOpen(true)} className="text-ink hover:text-sky transition-colors flex items-center relative p-2">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-coral text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-ink/10">
              <img src={logo} alt="Logo" className="h-8 object-contain" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-ink hover:text-sky transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col p-6 gap-6 text-base font-medium text-ink overflow-y-auto">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-coral transition-colors">Home</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-coral transition-colors">Shop All</Link>
              <Link to="/shop" search={{ sort: 'newest' }} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-coral transition-colors">New Arrivals</Link>
              
              <div className="flex flex-col gap-4 border-l-2 border-ink/10 pl-4 py-2 my-2">
                <span className="text-xs opacity-50 uppercase font-bold tracking-wider">CATEGORIES</span>
                <Link to="/shop" search={{ gender: 'Women' }} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-coral transition-colors">Women's Collection</Link>
                <Link to="/shop" search={{ gender: 'Kids' }} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-coral transition-colors">Kids' Collection</Link>
              </div>

              <Link to="/shop" search={{ tag: 'sale' }} onClick={() => setIsMobileMenuOpen(false)} className="text-coral hover:text-coral/80 transition-colors">Offers</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-coral transition-colors">Our Story</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-coral transition-colors">Reach Us</Link>
            </nav>

            <div className="mt-auto p-6 border-t border-ink/10 flex justify-around text-ink">
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:text-coral transition-colors bg-ink/5 rounded-full relative">
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-white"></span>}
              </Link>
              <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:text-sky transition-colors bg-ink/5 rounded-full">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
