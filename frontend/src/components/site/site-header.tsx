import { Link, useSearch, useLocation } from '@tanstack/react-router'
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, Package, Settings, ShieldCheck, LogOut, LayoutDashboard, Home, Zap, Tag } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SearchOverlay } from '@/components/site/search-overlay'
import { useAuth } from '@/context/auth-context'
import { auth } from '@/lib/firebase'
import { fetchPublicCategories } from '@/lib/public/catalog-api'
import type { PublicCategory } from '@/lib/public/catalog-api'

import logo from '@/assets/New_logo.png'

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [categories, setCategories] = useState<PublicCategory[]>([])

  // --- Auto-hide navbar on scroll down, show on scroll up (mobile only) ---
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Only auto-hide for mobile widths
      if (window.innerWidth >= 1024) {
        setHeaderVisible(true)
        lastScrollY.current = currentScrollY
        return
      }
      if (currentScrollY < 10) {
        setHeaderVisible(true)
      } else if (currentScrollY > lastScrollY.current + 5) {
        // scrolling down
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY.current - 5) {
        // scrolling up
        setHeaderVisible(true)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

    return `px-4 py-2 font-medium text-sm transition-colors ${isActive ? 'text-cta' : 'text-ink hover:text-cta'}`
  }

  return (
    <>
      <header 
        className={`w-full sticky top-0 z-50 border-b border-ink/10 shadow-sm transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`} 
        style={{ background: '#FAF7F9' }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Mobile Menu (Left on Mobile) */}
            <div className="flex items-center lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-ink hover:text-sky transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo (Left on Desktop, Center on Mobile) */}
            <div className="flex justify-center lg:justify-start flex-1 lg:flex-none">
              <Link to="/" className="group transition-transform hover:scale-105 flex items-center gap-1 md:gap-2">
                <img src={logo} alt="The Tusk & Trunk" className="h-12 md:h-16 lg:h-20 w-auto object-contain mix-blend-multiply" />
              </Link>
            </div>

            {/* Navigation Links (Center - Desktop Only) */}
            <div className="hidden lg:flex flex-1 justify-center">
              <nav className="flex items-center xl:gap-4 lg:gap-2">
                <Link to="/" className={getNavClass('/', true)}>Home</Link>
                <Link to="/shop" className={getNavClass('/shop', true)}>Shop All</Link>
                <Link to="/shop" search={{ sort: 'newest' }} className={getNavClass('/shop/new', false) + (search.sort === 'newest' ? ' text-cta' : '')}>
                  New Arrivals
                </Link>
                
                {/* Categories Dropdown (Mega Menu) */}
                <div className="relative group">
                  <button className="px-3 xl:px-4 py-2 font-medium text-sm text-ink hover:text-cta flex items-center gap-1 transition-colors">
                    Categories <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  
                  {/* Mega Menu Dropdown */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-[500px] z-50">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-ink/5 p-6 grid grid-cols-2 gap-8 before:absolute before:top-4 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-white">
                      
                      {/* Women's Column */}
                      <div>
                        <Link to="/shop" search={{ gender: 'Women' }} className="block font-heading font-bold text-lg text-cta mb-3 hover:opacity-80 transition-opacity">
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

                <Link to="/shop" search={{ tag: 'sale' }} className={getNavClass('/shop/sale', false) + (search.tag === 'sale' ? ' text-cta' : '')}>
                  Offers
                </Link>

                <Link to="/about" className={getNavClass('/about')}>Our Story</Link>
                <Link to="/contact" className={getNavClass('/contact')}>Reach Us</Link>
              </nav>
            </div>
            
            {/* Search & Icons (Right) */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-5 flex-1 lg:flex-none text-ink">
              
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

              {/* Wishlist - visible on all screen sizes */}
              <Link to="/wishlist" className="text-ink hover:text-cta transition-colors flex items-center relative p-2 group">
                <Heart className="w-5 h-5 group-hover:fill-coral/20" />
                {wishlistIds.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full border-2 border-white"></span>}
              </Link>

              {/* Profile - visible on all screen sizes */}
              <div className="relative group">
                {firebaseUser ? (
                  <>
                    <Link to="/account" className="text-ink hover:text-sky transition-colors flex items-center p-2 rounded-full hover:bg-sky/10">
                      <User className="w-5 h-5" />
                    </Link>
                    <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 z-50 hidden sm:block">
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
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-cta rounded-lg hover:bg-coral/10 transition-colors mt-1 border-t border-ink/5 pt-2"
                        >
                          <LogOut className="w-4 h-4 text-cta" />
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

              {/* Cart */}
              <button onClick={() => setIsCartOpen(true)} className="text-ink hover:text-sky transition-colors flex items-center relative p-2">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-cta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav Bar — App-like experience */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-lg border-t border-ink/10 shadow-[0_-2px_16px_rgba(0,0,0,0.06)] safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          <Link 
            to="/" 
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${location.pathname === '/' ? 'text-cta' : 'text-ink/50'}`}
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link 
            to="/shop" 
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${location.pathname.startsWith('/shop') ? 'text-cta' : 'text-ink/50'}`}
          >
            <Search className="w-5 h-5" />
            Shop
          </Link>
          <Link 
            to="/wishlist" 
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors relative ${location.pathname === '/wishlist' ? 'text-cta' : 'text-ink/50'}`}
          >
            <Heart className={`w-5 h-5 ${location.pathname === '/wishlist' ? 'fill-coral' : ''}`} />
            {wishlistIds.length > 0 && <span className="absolute -top-0.5 right-1 w-2 h-2 bg-coral rounded-full"></span>}
            Wishlist
          </Link>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-ink/50 transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-1 min-w-[14px] h-[14px] bg-cta text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            Cart
          </button>
          <Link 
            to={firebaseUser ? "/account" : "/login"} 
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${location.pathname.startsWith('/account') ? 'text-cta' : 'text-ink/50'}`}
          >
            <User className="w-5 h-5" />
            Account
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-ink/10">
              <img src={logo} alt="Logo" className="h-8 object-contain" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-ink hover:text-sky transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User info section in drawer */}
            {firebaseUser && (
              <div className="px-5 py-4 bg-sky/5 border-b border-ink/5">
                <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Welcome back</p>
                <p className="text-base font-bold text-ink truncate">{user?.full_name || firebaseUser.email}</p>
              </div>
            )}
            
            <nav className="flex flex-col p-5 gap-1 text-base font-medium text-ink overflow-y-auto flex-1">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-3 rounded-xl hover:bg-cloud transition-colors flex items-center gap-3">
                <Home className="w-5 h-5 text-ink/40" /> Home
              </Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-3 rounded-xl hover:bg-cloud transition-colors flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-ink/40" /> Shop All
              </Link>
              <Link to="/shop" search={{ sort: 'newest' }} onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-3 rounded-xl hover:bg-cloud transition-colors flex items-center gap-3">
                <Zap className="w-5 h-5 text-ink/40" /> New Arrivals
              </Link>
              
              <div className="my-2 mx-3 border-t border-ink/5"></div>
              <span className="text-[10px] opacity-50 uppercase font-bold tracking-widest px-3 mb-1">Categories</span>
              <Link to="/shop" search={{ gender: 'Women' }} onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-3 pl-6 rounded-xl hover:bg-cloud transition-colors text-sm">Women's Collection</Link>
              <Link to="/shop" search={{ gender: 'Kids' }} onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-3 pl-6 rounded-xl hover:bg-cloud transition-colors text-sm">Kids' Collection</Link>

              <div className="my-2 mx-3 border-t border-ink/5"></div>
              <Link to="/shop" search={{ tag: 'sale' }} onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-3 rounded-xl hover:bg-coral/5 transition-colors text-cta font-bold flex items-center gap-3">
                <Tag className="w-5 h-5" /> Offers & Sale
              </Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-3 rounded-xl hover:bg-cloud transition-colors flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-ink/40" /> Our Story
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-3 rounded-xl hover:bg-cloud transition-colors flex items-center gap-3">
                <Package className="w-5 h-5 text-ink/40" /> Reach Us
              </Link>

              {/* Admin Panel — easy access for owner */}
              {(user?.role === 'admin' || user?.role === 'owner') && (
                <>
                  <div className="my-2 mx-3 border-t border-ink/5"></div>
                  <Link 
                    to="/admin/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="py-3 px-3 rounded-xl bg-sky/10 text-sky font-bold flex items-center gap-3 hover:bg-sky/20 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" /> Admin Panel
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom drawer actions */}
            <div className="p-5 border-t border-ink/10 space-y-3">
              {firebaseUser ? (
                <button 
                  onClick={() => {
                    auth.signOut()
                    setIsMobileMenuOpen(false)
                    window.location.href = '/'
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-3 text-sm font-bold text-cta border-2 border-cta/20 rounded-full hover:bg-coral/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 py-3 text-sm font-bold text-white bg-ink rounded-full hover:bg-ink/90 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign In / Register
                </Link>
              )}
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

