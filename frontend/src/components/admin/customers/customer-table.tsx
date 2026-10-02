import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { AdminCustomer } from '@/lib/admin/mock-customers'
import { AdminFilterBar, AdminSearchInput, AdminTableShell, AdminTh, AdminTd } from '@/components/admin/ui/primitives'

interface CustomerTableProps {
  customers: AdminCustomer[]
}

type SortField = 'joinedDate' | 'totalSpent' | 'lastOrderDate'
type SortOrder = 'asc' | 'desc'

export function CustomerTable({ customers }: CustomerTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('joinedDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />
  }

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'totalSpent') {
        comparison = a.total_spent_paise - b.total_spent_paise
      } else if (sortField === 'lastOrderDate') {
        const dateA = a.last_order_date ? new Date(a.last_order_date).getTime() : 0
        const dateB = b.last_order_date ? new Date(b.last_order_date).getTime() : 0
        comparison = dateA - dateB
      } else {
        comparison = new Date(a.joined_date).getTime() - new Date(b.joined_date).getTime()
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [customers, searchQuery, sortField, sortOrder])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const formatPrice = (price?: number) => (price ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="space-y-6">
      
      <AdminFilterBar>
        <AdminSearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customers..."
          className="flex-1 max-w-md"
        />
      </AdminFilterBar>

      {/* Table (Desktop) */}
      <div className="hidden md:block">
        <AdminTableShell isEmpty={filteredAndSortedCustomers.length === 0} emptyMessage="No customers matching the criteria.">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cloud/50 border-b border-ink/10">
                <AdminTh>Customer</AdminTh>
                <AdminTh>Contact</AdminTh>
                <AdminTh 
                  className="cursor-pointer hover:text-ink transition-colors"
                  onClick={() => handleSort('joinedDate')}
                >
                  Joined <SortIcon field="joinedDate" />
                </AdminTh>
                <AdminTh className="text-right">Orders</AdminTh>
                <AdminTh 
                  className="text-right cursor-pointer hover:text-ink transition-colors"
                  onClick={() => handleSort('totalSpent')}
                >
                  Total Spent <SortIcon field="totalSpent" />
                </AdminTh>
                <AdminTh 
                  className="text-right cursor-pointer hover:text-ink transition-colors"
                  onClick={() => handleSort('lastOrderDate')}
                >
                  Last Order <SortIcon field="lastOrderDate" />
                </AdminTh>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredAndSortedCustomers.map(customer => (
                <tr 
                  key={customer.id} 
                  className="border-b border-ink/5 hover:bg-ink/[0.02] transition-colors group cursor-pointer"
                >
                  <AdminTd>
                    <Link to="/admin/customers/$customerId" params={{ customerId: customer.id }} className="block">
                      <span className="font-medium text-ink group-hover:text-sky transition-colors">{customer.name}</span>
                    </Link>
                  </AdminTd>
                  <AdminTd>
                    <div className="flex flex-col gap-1">
                      <span className="text-ink/80">{customer.email}</span>
                      <span className="text-xs text-ink/50">{customer.phone}</span>
                    </div>
                  </AdminTd>
                  <AdminTd className="text-ink/70">
                    {formatDate(customer.joined_date)}
                  </AdminTd>
                  <AdminTd className="text-right text-ink/70">
                    {customer.total_orders}
                  </AdminTd>
                  <AdminTd className="text-right font-medium text-ink">
                    {formatPrice(customer.total_spent_paise / 100)}
                  </AdminTd>
                  <AdminTd className="text-right text-ink/70">
                    {formatDate(customer.last_order_date)}
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </div>

      {/* Cards (Mobile) */}
      <div className="md:hidden space-y-4">
        {filteredAndSortedCustomers.map(customer => (
          <Link 
            key={customer.id} 
            to="/admin/customers/$customerId" 
            params={{ customerId: customer.id }}
            className="block bg-white border border-ink/10 rounded-xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-ink">{customer.name}</h3>
                <p className="text-sm text-ink/60">{customer.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 text-sm pt-3 border-t border-ink/5">
              <div>
                <p className="text-xs text-ink/50 uppercase tracking-wider mb-1">Joined</p>
                <p className="text-ink/80">{formatDate(customer.joined_date)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink/50 uppercase tracking-wider mb-1">Total Spent</p>
                <p className="font-medium text-ink">{formatPrice(customer.total_spent_paise / 100)}</p>
              </div>
            </div>
          </Link>
        ))}
        {filteredAndSortedCustomers.length === 0 && (
          <div className="p-8 text-center text-ink/50 bg-white border border-ink/10 rounded-xl shadow-sm">
            No customers matching the criteria.
          </div>
        )}
      </div>

    </div>
  )
}
