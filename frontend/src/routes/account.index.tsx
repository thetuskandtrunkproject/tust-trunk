import { createFileRoute, Link } from '@tanstack/react-router'
import { Package, Heart, MapPin, ArrowRight } from 'lucide-react'
import { mockUser, mockOrders } from '@/lib/mock-account'
import { useWishlist } from '@/context/wishlist-context'

export const Route = createFileRoute('/account/')({
  component: AccountOverviewPage,
})

function AccountOverviewPage() {
  const { wishlistIds } = useWishlist()
  
  // Get most recent order
  const recentOrder = [...mockOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const defaultAddress = mockUser.addresses.find(a => a.isDefault) || mockUser.addresses[0]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-10">
        <h2 className="text-3xl font-fraunces text-ink mb-2">Welcome back, {mockUser.name.split(' ')[0]}!</h2>
        <p className="text-ink/60">Manage your orders, settings, and wishlist here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Recent Order Card */}
        <div className="bg-white p-6 rounded-2xl border border-ink/5 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky/10 rounded-full flex items-center justify-center text-sky">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-ink">Recent Order</h3>
          </div>
          
          {recentOrder ? (
            <div className="flex-1 flex flex-col">
              <p className="text-sm text-ink/60 mb-1">Order #{recentOrder.orderNumber}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${
                  recentOrder.status === 'Delivered' ? 'bg-green-500' :
                  recentOrder.status === 'Processing' ? 'bg-[#F2C94C]' :
                  recentOrder.status === 'Cancelled' ? 'bg-rust' : 'bg-sky'
                }`}></span>
                <span className="font-medium text-ink">{recentOrder.status}</span>
              </div>
              <Link to="/account/orders" className="mt-auto text-sm font-medium text-ink underline underline-offset-4 hover:text-sky transition-colors flex items-center gap-1 w-fit">
                View order details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm text-ink/60 mb-4">You have no recent orders.</p>
              <Link to="/shop" className="text-sm font-medium text-ink underline underline-offset-4 hover:text-sky transition-colors w-fit">
                Start shopping
              </Link>
            </div>
          )}
        </div>

        {/* Address Card */}
        <div className="bg-white p-6 rounded-2xl border border-ink/5 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center text-ink/70">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-ink">Default Address</h3>
          </div>
          
          {defaultAddress ? (
            <div className="flex-1 flex flex-col">
              <p className="font-medium text-ink text-sm mb-1">{defaultAddress.name}</p>
              <p className="text-sm text-ink/70 leading-relaxed mb-4">
                {defaultAddress.address1}<br/>
                {defaultAddress.address2 && <>{defaultAddress.address2}<br/></>}
                {defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}
              </p>
              <Link to="/account/settings" className="mt-auto text-sm font-medium text-ink underline underline-offset-4 hover:text-sky transition-colors flex items-center gap-1 w-fit">
                Manage addresses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm text-ink/60 mb-4">No default address saved.</p>
              <Link to="/account/settings" className="text-sm font-medium text-ink underline underline-offset-4 hover:text-sky transition-colors w-fit">
                Add an address
              </Link>
            </div>
          )}
        </div>

        {/* Wishlist Card */}
        <div className="bg-white p-6 rounded-2xl border border-ink/5 shadow-sm flex flex-col h-full md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blush/10 rounded-full flex items-center justify-center text-blush">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-ink">Your Wishlist</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-4xl font-fraunces text-ink mb-2">{wishlistIds.length}</p>
            <p className="text-sm text-ink/60 mb-6">items saved for later</p>
            <Link to="/wishlist" className="text-sm font-medium text-ink underline underline-offset-4 hover:text-sky transition-colors flex items-center gap-1 w-fit mt-auto">
              View wishlist <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
