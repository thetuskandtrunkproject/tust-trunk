import { createFileRoute } from '@tanstack/react-router'
import { adminMockCustomers } from '@/lib/admin/mock-customers'
import { CustomerTable } from '@/components/admin/customers/customer-table'

export const Route = createFileRoute('/admin/customers/')({
  component: AdminCustomersIndexPage,
})

function AdminCustomersIndexPage() {
  return (
    <div className="animate-in fade-in duration-300 pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-fraunces text-2xl text-ink">Customers</h2>
          <p className="text-ink/60 text-sm mt-1">View customer profiles and order history.</p>
        </div>
      </div>

      <CustomerTable customers={adminMockCustomers} />
    </div>
  )
}
