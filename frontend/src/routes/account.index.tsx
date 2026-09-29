import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Package, Heart, MapPin, ArrowRight } from 'lucide-react'
import { mockOrders } from '@/lib/mock-account'
import { useWishlist } from '@/context/wishlist-context'
import { useAuth } from '@/context/auth-context'

export const Route = createFileRoute('/account/')({
  component: AccountOverviewPage,
})

function AccountOverviewPage() {
  const { wishlistIds } = useWishlist()
  const { user } = useAuth()
  
  const [recentOrder, setRecentOrder] = useState<any>(null)
  const [defaultAddress, setDefaultAddress] = useState<any>(null)
  
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await api.get('/api/v1/addresses')
        const def = res.data.find((a: any) => a.is_default)
        setDefaultAddress(def || null)
      } catch (error) {
        console.error("Failed to fetch default address")
      }
    }
    const fetchRecentOrder = async () => {
      try {
        const res = await api.get('/api/v1/orders')
        if (res.data.orders && res.data.orders.length > 0) {
          setRecentOrder(res.data.orders[0])
        }
      } catch (err) {
        console.error("Failed to fetch recent order", err)
      }
    }
    fetchAddress()
    fetchRecentOrder()
  }, [])
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-10">
        <h2 className="text-4xl font-heading font-bold text-ink mb-4">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!</h2>
        <p className="text-ink/60 font-medium text-lg">Manage your orders, settings, and wishlist here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Recent Order Card */}
        <div className="bg-sky-soft/40 p-8 rounded-[2rem] border border-sky/20 shadow-sm hover:scale-[1.02] transition-transform flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-sky/20 rounded-full flex items-center justify-center text-sky">
              <Package className="w-6 h-6 text-ink" />
            </div>
            <h3 className="font-bold text-lg text-ink">Recent Order</h3>
          </div>
          
          {recentOrder ? (
            <div className="flex-1 flex flex-col">
              <p className="text-sm font-bold text-ink/60 mb-2">Order #{recentOrder.order_number}</p>
              <div className="flex items-center gap-2 mb-6">
                <span className={`w-3 h-3 rounded-full ${
                  recentOrder.status === 'Delivered' ? 'bg-mint' :
                  recentOrder.status === 'Processing' ? 'bg-sunshine' :
                  recentOrder.status === 'Cancelled' ? 'bg-rust' :
                  recentOrder.status === 'requires_review' ? 'bg-rust/50' : 'bg-sky'
                }`}></span>
                <span className="font-bold text-ink">{recentOrder.status === 'requires_review' ? 'Action Required' : recentOrder.status}</span>
              </div>
              <Link to="/account/orders" className="mt-auto text-sm font-bold text-ink hover:text-sky transition-colors flex items-center gap-2 w-fit bg-white/50 px-4 py-2 rounded-full">
                View order details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-ink/60 mb-4">You have no recent orders.</p>
              <Link to="/shop" className="text-sm font-bold text-ink hover:text-sky transition-colors flex items-center gap-2 w-fit bg-white/50 px-4 py-2 rounded-full">
                Start shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Address Card */}
        <div className="bg-mint/40 p-8 rounded-[2rem] border border-mint/20 shadow-sm hover:scale-[1.02] transition-transform flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-mint/60 rounded-full flex items-center justify-center text-ink/70">
              <MapPin className="w-6 h-6 text-ink" />
            </div>
            <h3 className="font-bold text-lg text-ink">Default Address</h3>
          </div>
          
          {defaultAddress ? (
            <div className="flex-1 flex flex-col">
              <p className="font-bold text-ink text-base mb-2">{defaultAddress.name}</p>
              <p className="text-sm text-ink/70 font-medium leading-relaxed mb-6">
                {defaultAddress.address1}<br/>
                {defaultAddress.address2 && <>{defaultAddress.address2}<br/></>}
                {defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}
              </p>
              <Link to="/account/settings" className="mt-auto text-sm font-bold text-ink hover:text-sky transition-colors flex items-center gap-2 w-fit bg-white/50 px-4 py-2 rounded-full">
                Manage addresses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-ink/60 mb-4">No default address saved.</p>
              <Link to="/account/settings" className="text-sm font-bold text-ink hover:text-sky transition-colors flex items-center gap-2 w-fit bg-white/50 px-4 py-2 rounded-full">
                Add an address <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Wishlist Card */}
        <div className="bg-sunshine/40 p-8 rounded-[2rem] border border-sunshine/20 shadow-sm hover:scale-[1.02] transition-transform flex flex-col h-full md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-sunshine rounded-full flex items-center justify-center text-blush">
              <Heart className="w-6 h-6 text-ink" />
            </div>
            <h3 className="font-bold text-lg text-ink">Your Wishlist</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-5xl font-heading font-bold text-ink mb-2">{wishlistIds.length}</p>
            <p className="text-sm font-medium text-ink/60 mb-6">items saved for later</p>
            <Link to="/wishlist" className="text-sm font-bold text-ink hover:text-sky transition-colors flex items-center gap-2 w-fit mt-auto bg-white/50 px-4 py-2 rounded-full">
              View wishlist <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
