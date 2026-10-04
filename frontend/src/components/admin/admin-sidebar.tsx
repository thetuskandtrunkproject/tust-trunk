import { Link, useLocation } from '@tanstack/react-router'
import { LayoutDashboard, Package, Boxes, Users, FileText, Mail, X, Ticket, Building2, Star } from 'lucide-react'
import logoImg from '@/assets/New_logo.png'

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
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'CMS', path: '/admin/cms', icon: FileText },
    { name: 'Shop', path: '/admin/shop', icon: Building2 },
  ]

  return (
    <div className="flex flex-col h-full bg-[#EBEBEB] font-sans">
      <div className="p-4 flex items-center justify-between border-b border-[#E3E3E3]/50">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="The Tusk & Trunk" className="h-8 opacity-90" />
          <div className="flex flex-col">
            <span className="font-bold text-[14px] tracking-tight text-[#202223] leading-none mb-1">Tusk & Trunk</span>
            <span className="text-[10px] font-bold text-[#005bd3] tracking-widest leading-none bg-[#E1F3FA] px-1.5 py-0.5 rounded inline-block w-fit">ADMIN</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 text-[#5C5F62] hover:bg-[#E3E3E3] rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                isActive 
                  ? 'bg-white text-[#202223] shadow-sm' 
                  : 'text-[#5C5F62] hover:bg-[#E3E3E3] hover:text-[#202223]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#202223]' : 'text-[#5C5F62]'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4">
        <Link 
          to="/" 
          className="flex items-center justify-center w-full py-2 rounded-md text-[13px] font-medium text-[#5C5F62] hover:bg-[#E3E3E3] transition-colors"
        >
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

