import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CustomerTable } from '@/components/admin/customers/customer-table'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/customers/')({
  component: AdminCustomersIndexPage,
})

function AdminCustomersIndexPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/api/v1/admin/customers')
        setCustomers(res.data.items || [])
      } catch (err) {
        showToast('Failed to load customers')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  return (
    <div className="animate-in fade-in duration-300 pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-heading font-bold text-2xl text-ink">Customers</h2>
          <p className="text-ink/60 text-sm mt-1">View customer profiles and order history.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-ink/50">Loading customers...</div>
      ) : (
        <CustomerTable customers={customers} />
      )}
    </div>
  )
}
