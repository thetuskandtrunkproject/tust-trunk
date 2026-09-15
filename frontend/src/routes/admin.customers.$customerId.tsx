import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react'
import { adminMockCustomers } from '@/lib/admin/mock-customers'
import { adminMockOrders } from '@/lib/admin/mock-orders'
import { CustomerOrderHistory } from '@/components/admin/customers/customer-order-history'
import { CustomerAddresses } from '@/components/admin/customers/customer-addresses'

export const Route = createFileRoute('/admin/customers/$customerId')({
  component: AdminCustomerDetailPage,
})

function AdminCustomerDetailPage() {
  const { customerId } = Route.useParams()
  const navigate = useNavigate()

  const customer = adminMockCustomers.find(c => c.id === customerId)

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl text-ink font-fraunces mb-4">Customer not found</h2>
        <button 
          onClick={() => navigate({ to: '/admin/customers' })}
          className="text-ink hover:text-sky underline underline-offset-4"
        >
          Return to Customers
        </button>
      </div>
    )
  }

  const customerOrders = adminMockOrders.filter(o => o.customerEmail === customer.email)
  const averageOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="animate-in fade-in duration-300 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate({ to: '/admin/customers' })}
          className="p-2 border border-ink/10 rounded-full hover:bg-ink/5 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-ink/70" />
        </button>
        <div>
          <h2 className="font-fraunces text-2xl text-ink">{customer.name}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-ink/70">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {formatDate(customer.joinedDate)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="font-medium text-ink mb-4">Order History</h3>
            <CustomerOrderHistory orders={customerOrders} />
          </section>

          <section>
            <h3 className="font-medium text-ink mb-4">Saved Addresses</h3>
            <CustomerAddresses addresses={customer.addresses} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-medium text-ink">Lifetime Value</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-ink/60 uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-2xl font-medium text-ink">{formatPrice(customer.totalSpent)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink/5">
                <div>
                  <p className="text-xs text-ink/60 uppercase tracking-wider mb-1">Total Orders</p>
                  <p className="text-lg font-medium text-ink">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-ink/60 uppercase tracking-wider mb-1">Avg Order Value</p>
                  <p className="text-lg font-medium text-ink">{formatPrice(Math.round(averageOrderValue))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
