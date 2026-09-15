import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { User, Package, Settings, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/account')({
  component: AccountLayout,
})

function AccountLayout() {
  const location = useLocation()
  
  const navItems = [
    { label: 'Overview', path: '/account', icon: User, exact: true },
    { label: 'Order History', path: '/account/orders', icon: Package, exact: false },
    { label: 'Settings', path: '/account/settings', icon: Settings, exact: false },
    { label: 'Security', path: '/account/security', icon: ShieldCheck, exact: false },
  ]

  return (
    <div className="min-h-screen bg-cloud pt-8 pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <h1 className="font-fraunces text-4xl text-ink mb-8 md:mb-12">My Account</h1>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Mobile Tab Bar */}
          <div className="lg:hidden flex overflow-x-auto hide-scrollbar gap-2 pb-2 mb-4 border-b border-ink/10 -mx-4 px-4">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)
              
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    isActive ? 'bg-ink text-cloud' : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex flex-col w-64 shrink-0 gap-2">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)
                
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl text-base font-medium transition-all ${
                    isActive ? 'bg-white shadow-sm text-ink font-semibold' : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sky' : ''}`} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
