import { useState, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, Plus } from 'lucide-react'
import { ProductTable } from '@/components/admin/products/product-table'
import { BulkActionsBar } from '@/components/admin/products/bulk-actions-bar'
import { useAdminProducts } from '@/context/admin-product-context'
import { useToast } from '@/context/toast-context'
import type { ProductStatus } from '@/lib/admin/mock-admin-products'

export const Route = createFileRoute('/admin/products/')({
  component: AdminProductsPage,
})

function AdminProductsPage() {
  const { products, updateProduct, bulkUpdateStatus, bulkDeleteProducts } = useAdminProducts()
  const { showToast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Derived filtered data
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (searchQuery) {
        if (!product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      }
      if (statusFilter !== 'All' && product.status !== statusFilter) return false
      if (categoryFilter !== 'All' && product.category !== categoryFilter) return false
      return true
    })
  }, [products, searchQuery, statusFilter, categoryFilter])

  // Get unique categories for the filter
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ['All', ...Array.from(cats)]
  }, [products])

  // Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleToggleAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  // Action Handlers
  const handleQuickAction = (id: string, action: 'edit' | 'archive' | 'delete') => {
    const product = products.find(p => p.id === id)
    if (!product) return

    if (action === 'archive') {
      updateProduct({ ...product, status: 'Archived' })
      showToast(`Archived ${product.name}`)
    } else if (action === 'delete') {
      bulkDeleteProducts([id])
      showToast(`Deleted ${product.name}`)
    }
  }

  const handleBulkUpdateStatus = (newStatus: ProductStatus) => {
    bulkUpdateStatus(selectedIds, newStatus)
    showToast(`Updated ${selectedIds.length} products to ${newStatus}`)
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    bulkDeleteProducts(selectedIds)
    showToast(`Deleted ${selectedIds.length} products`)
    setSelectedIds([])
  }

  return (
    <div className="animate-in fade-in duration-300 relative pb-24">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8">
        <div>
          <h2 className="font-heading font-bold text-2xl text-ink">Products</h2>
          <p className="text-ink/60 text-sm mt-1">Manage your catalog, pricing, and statuses.</p>
        </div>
        <Link 
          to="/admin/products/new" 
          className="bg-ink text-cloud px-4 py-2.5 rounded-xl font-medium hover:bg-sky hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-ink/10 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cloud border border-ink/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-sky/50"
          />
        </div>

        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-cloud border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky/50 min-w-[120px]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-cloud border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky/50 min-w-[140px] capitalize"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <ProductTable 
        products={filteredProducts}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleAll={handleToggleAll}
        onQuickAction={handleQuickAction}
      />

      {/* Bulk Actions */}
      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onBulkDelete={handleBulkDelete}
      />

    </div>
  )
}
