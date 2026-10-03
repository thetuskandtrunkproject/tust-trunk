import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'

function RootComponent() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col bg-cloud text-ink font-sans">
      {!isAdmin && <SiteHeader />}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isAdmin && <SiteFooter />}
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})

