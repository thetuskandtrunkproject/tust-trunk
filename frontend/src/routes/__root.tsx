import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { MaintenancePage } from '@/components/site/maintenance-page'
import { cmsApi } from '@/lib/admin/cms-api'

function RootComponent() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isExempt = isAdmin || location.pathname === '/login'
  const [maintenance, setMaintenance] = useState<{ enabled: boolean; message: string; timerEnd: string } | null>(null)

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
