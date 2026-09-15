import { useState } from 'react'
import { Outlet, useLocation } from '@tanstack/react-router'
import { AdminSidebar } from './admin-sidebar'
import { Menu } from 'lucide-react'

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  
  // Create a nice title from the path
  const pathParts = location.pathname.split('/').filter(Boolean)
  const currentPage = pathParts.length > 1 
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) 
    : 'Dashboard'

  return (
    <div className="flex h-screen bg-cloud overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-full shrink-0 z-20">
        <AdminSidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-ink/10 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-ink/70 hover:text-ink"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-fraunces text-xl text-ink hidden sm:block">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-ink leading-none mb-1">Admin User</p>
                <p className="text-xs text-ink/60 leading-none">Store Manager</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-sky/20 flex items-center justify-center text-sky font-bold text-sm">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
