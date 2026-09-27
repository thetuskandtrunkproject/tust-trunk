import { createFileRoute } from '@tanstack/react-router'
import { HeroBannerEditor } from '@/components/admin/cms/hero-banner-editor'
import { CategoryTilesEditor } from '@/components/admin/cms/category-tiles-editor'
import { AboutPageEditor } from '@/components/admin/cms/about-page-editor'
import { FooterEditor } from '@/components/admin/cms/footer-editor'

export const Route = createFileRoute('/admin/cms')({
  component: AdminCmsPage,
})

function AdminCmsPage() {
  return (
    <div className="animate-in fade-in duration-300 pb-24">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="font-heading font-bold text-2xl text-ink">Content Management</h2>
        <p className="text-ink/60 text-sm mt-1">Manage global site content and pages.</p>
      </div>

      <div className="space-y-8">
        <HeroBannerEditor />
        <CategoryTilesEditor />
        <AboutPageEditor />
        <FooterEditor />
      </div>
    </div>
  )
}
