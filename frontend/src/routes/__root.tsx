import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { MaintenancePage } from '@/components/site/maintenance-page'
import { cmsApi } from '@/lib/admin/cms-api'
import { useAuth } from '@/context/auth-context'

function RootComponent() {
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = location.pathname.startsWith('/admin')
  const isExempt = isAdmin || location.pathname === '/login' || user?.role === 'admin' || user?.role === 'owner'
  const [maintenance, setMaintenance] = useState<{ enabled: boolean; message: string; timerEnd: string } | null>(null)

  // Track page views in Meta Pixel on client-side route changes.
  // We initialize prevPathnameRef to the initial location.pathname so that
  // the initial page load (which is already tracked by index.html) does not trigger a duplicate PageView.
  const prevPathnameRef = useRef<string>(location.pathname)

  useEffect(() => {
    // Only check maintenance for non-exempt pages.
    // cmsApi.getShopSettings() is module-level cached — only hits Supabase once per session.
    if (!isExempt) {
      cmsApi.getShopSettings().then((data: any) => {
        if (data.maintenanceMode) {
          setMaintenance({
            enabled: true,
            message: data.maintenanceMessage || '',
            timerEnd: data.maintenanceTimerEnd || ''
          })
        } else {
          setMaintenance({ enabled: false, message: '', timerEnd: '' })
        }
      }).catch(() => {
        setMaintenance({ enabled: false, message: '', timerEnd: '' })
      })
    }
  }, [isExempt])

  // Track page views in Meta Pixel on SPA route changes without duplicate initial events
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'PageView')
      }
    }
  }, [location.pathname])

  // Show maintenance page for storefront visitors (except /admin and /login)
  if (!isExempt && maintenance?.enabled) {
    return <MaintenancePage message={maintenance.message} timerEnd={maintenance.timerEnd} />
  }

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
