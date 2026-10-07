import { useState, useRef, useEffect } from 'react'
import { Outlet, useLocation, Navigate, useNavigate } from '@tanstack/react-router'
import { AdminSidebar } from './admin-sidebar'
import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { handleLogout } from '@/lib/auth-actions'

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const onLogout = async () => {
    await handleLogout()
    sessionStorage.removeItem('adminGatewayPassed')
    window.location.href = '/admin-login'
  }
  
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Admin User'
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'
  const initial = displayName.charAt(0).toUpperCase()

  // Create a nice title from the path
  const pathParts = location.pathname.split('/').filter(Boolean)
  const currentPage = pathParts.length > 1 
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) 
    : 'Dashboard'

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F6F8]">
        <div className="w-8 h-8 rounded-full border-4 border-[#C9CCCF] border-t-[#005bd3] animate-spin"></div>
      </div>
    )
  }

  // Redirect to home if not logged in or not an admin/owner
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return <Navigate to="/" />
  }

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden font-sans admin-panel">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-full shrink-0 z-20 border-r border-[#E3E3E3] bg-[#EBEBEB]">
        <AdminSidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#202223]/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#EBEBEB] z-50 transform transition-transform duration-300 lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Bar */}
        <header className="h-14 bg-[#F4F6F8] flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-[#5C5F62] hover:bg-[#EBEBEB] rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block text-[13px] text-[#5C5F62] font-medium">
              {new Date().toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).replace(' at ', ' • ')}
            </div>
          </div>

          <div className="relative flex items-center gap-2" ref={profileDropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 hover:bg-black/5 p-1.5 pr-3 rounded-lg transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#E1F3FA] border border-[#B4E1FA] flex items-center justify-center text-[#005bd3] font-bold text-[13px]">
                {initial}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-[#202223] leading-none mb-1">{displayName}</p>
                <p className="text-[11px] font-medium text-[#6D7175] leading-none">{displayRole}</p>
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-[#E3E3E3] rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-[#E3E3E3] mb-1">
                  <p className="text-[13px] font-bold text-[#202223] truncate">{displayName}</p>
                  <p className="text-[12px] text-[#6D7175] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-4 py-2 text-[13px] font-medium text-[#D82C0D] hover:bg-[#FBF1ED] transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3 opacity-70" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-4 pb-8 lg:px-8 bg-[#F4F6F8]">
          <div className="mx-auto max-w-7xl pt-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

