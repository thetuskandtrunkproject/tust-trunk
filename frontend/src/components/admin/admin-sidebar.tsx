import { Link, useLocation } from '@tanstack/react-router'
import { LayoutDashboard, Package, Boxes, Users, FileText, Mail, X, Ticket, Building2 } from 'lucide-react'
import logoImg from '@/assets/logo_full_hd.png'

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: Package },
    { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'CMS', path: '/admin/cms', icon: FileText },
    { name: 'Contact', path: '/admin/contact', icon: Mail },
    { name: 'Shop', path: '/admin/shop', icon: Building2 },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r border-ink/10 font-sans">
      <div className="p-6 flex items-center justify-between">
        <img src={logoImg} alt="The Tusk & Trunk Admin" className="h-8" />
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-ink/60 hover:text-coral transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                isActive 
                  ? 'bg-sky-soft text-ink shadow-sm ring-1 ring-sky/20' 
                  : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky' : 'text-ink/50'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-6 border-t border-ink/10">
        <Link to="/" className="text-sm font-bold text-ink/60 hover:text-coral transition-colors block text-center">
          ← Back to Storefront
        </Link>
      </div>
    </div>
  )
}

function ShoppingBagIcon(props: any) {
  // Lucide has ShoppingBag, but let's avoid import conflicts if we add more
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
