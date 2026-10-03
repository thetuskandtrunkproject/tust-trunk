import { createFileRoute } from '@tanstack/react-router'
import { HeroBannerEditor } from '@/components/admin/cms/hero-banner-editor'
import { CategoryTilesEditor } from '@/components/admin/cms/category-tiles-editor'
import { AboutPageEditor } from '@/components/admin/cms/about-page-editor'
import { FooterEditor } from '@/components/admin/cms/footer-editor'
import { AdminPageHeader } from '@/components/admin/ui/primitives'

export const Route = createFileRoute('/admin/cms')({
  component: AdminCmsPage,
})

function AdminCmsPage() {
  return (
    <div className="animate-in fade-in duration-300 pb-24">
      <AdminPageHeader 
        title="Content Management"
        description="Manage global site content and pages."
      />

      <div className="space-y-8">
        <HeroBannerEditor />
        <CategoryTilesEditor />
        <AboutPageEditor />
        <FooterEditor />
      </div>
    </div>
  )
}

