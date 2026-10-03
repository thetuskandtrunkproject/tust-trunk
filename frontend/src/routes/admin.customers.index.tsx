import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CustomerTable } from '@/components/admin/customers/customer-table'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'
import { AdminPageHeader, AdminSpinner } from '@/components/admin/ui/primitives'

export const Route = createFileRoute('/admin/customers/')({
  component: AdminCustomersIndexPage,
})

function AdminCustomersIndexPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const controller = new AbortController()
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/api/v1/admin/customers', { signal: controller.signal })
        setCustomers(res.data.customers || res.data.items || [])
      } catch (err: any) {
        if (err.name === 'CanceledError' || controller.signal.aborted) return
        showToast('Failed to load customers')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }
    fetchCustomers()
    return () => controller.abort()
  }, [])

  return (
    <div className="animate-in fade-in duration-300 pb-24">
      <AdminPageHeader 
        title="Customers"
        description="View customer profiles and order history."
      />

      {isLoading ? (
        <AdminSpinner />
      ) : (
        <CustomerTable customers={customers} />
      )}
    </div>
  )
}

