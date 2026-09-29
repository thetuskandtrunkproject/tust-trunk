import { createFileRoute, Outlet, Link, useLocation, useNavigate } from '@tanstack/react-router'
import { User, Package, Settings, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'

export const Route = createFileRoute('/account')({
  component: AccountLayout,
})

function AccountLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const navItems = [
    { label: 'Overview', path: '/account', icon: User, exact: true },
    { label: 'Order History', path: '/account/orders', icon: Package, exact: false },
    { label: 'Settings', path: '/account/settings', icon: Settings, exact: false },
    { label: 'Security', path: '/account/security', icon: ShieldCheck, exact: false },
  ]

  const { firebaseUser, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        navigate({ to: '/login', replace: true })
      } else if (!firebaseUser.emailVerified) {
        navigate({ to: '/verify-account', state: { email: firebaseUser.email }, replace: true })
      }
    }
  }, [loading, firebaseUser, navigate])

  if (loading || !firebaseUser || !firebaseUser.emailVerified) {
    return <div className="min-h-screen bg-cloud flex items-center justify-center font-bold text-ink/50">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-cloud pt-8 pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <h1 className="font-heading font-bold text-5xl text-ink mb-8 md:mb-12">My Account</h1>
        
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
                  className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${
                    isActive ? 'bg-coral text-white' : 'text-ink/60 hover:text-ink hover:bg-ink/5'
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
                  className={`flex items-center gap-3 px-6 py-4 rounded-full text-base font-bold transition-all ${
                    isActive ? 'bg-coral text-white shadow-md scale-105' : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
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
