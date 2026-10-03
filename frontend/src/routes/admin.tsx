import { createFileRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/admin/admin-layout'

import { AdminProductProvider } from '@/context/admin-product-context'

export const Route = createFileRoute('/admin')({
  component: () => (
    <AdminProductProvider>
      <AdminLayout />
    </AdminProductProvider>
  ),
})

