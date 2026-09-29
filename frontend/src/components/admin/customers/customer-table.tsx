import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, ArrowDown, ArrowUp } from 'lucide-react'
import type { AdminCustomer } from '@/lib/admin/mock-customers'

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
      setSortOrder('desc') // Default to desc for new sorts
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />
  }

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
      )
    }

    // Sort
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

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      
      {/* Search & Filters Bar */}
      <div className="bg-white border border-ink/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cloud border border-ink/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-sky/50"
          />
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cloud border-b border-ink/10 text-xs font-medium text-ink/60 uppercase tracking-wider">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-ink transition-colors"
                  onClick={() => handleSort('joinedDate')}
                >
                  Joined <SortIcon field="joinedDate" />
                </th>
                <th className="px-6 py-4 text-right">Orders</th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:text-ink transition-colors"
                  onClick={() => handleSort('totalSpent')}
                >
                  Total Spent <SortIcon field="totalSpent" />
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:text-ink transition-colors"
                  onClick={() => handleSort('lastOrderDate')}
                >
                  Last Order <SortIcon field="lastOrderDate" />
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredAndSortedCustomers.map(customer => (
                <tr 
                  key={customer.id} 
                  className="border-b border-ink/5 hover:bg-ink/[0.02] transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link to="/admin/customers/$customerId" params={{ customerId: customer.id }} className="block">
                      <span className="font-medium text-ink group-hover:text-sky transition-colors">{customer.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-ink/80">{customer.email}</span>
                      <span className="text-xs text-ink/50">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink/70">
                    {formatDate(customer.joined_date)}
                  </td>
                  <td className="px-6 py-4 text-right text-ink/70">
                    {customer.total_orders}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-ink">
                    {formatPrice(customer.total_spent_paise / 100)}
                  </td>
                  <td className="px-6 py-4 text-right text-ink/70">
                    {formatDate(customer.last_order_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAndSortedCustomers.length === 0 && (
          <div className="p-12 text-center text-ink/50">No customers matching the criteria.</div>
        )}
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
