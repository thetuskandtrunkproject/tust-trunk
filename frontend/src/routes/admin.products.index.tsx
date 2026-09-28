import { useState, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, Plus } from 'lucide-react'
import { ProductTable } from '@/components/admin/products/product-table'
import { BulkActionsBar } from '@/components/admin/products/bulk-actions-bar'
import { useToast } from '@/context/toast-context'
import type { AdminProductListItem } from '@/lib/admin/products-api'
import { fetchAdminProducts, archiveAdminProduct } from '@/lib/admin/products-api'
import { useEffect } from 'react'
import type { Category } from '@/lib/admin/categories-api'
import { fetchCategories } from '@/lib/admin/categories-api'

export const Route = createFileRoute('/admin/products/')({
  component: AdminProductsPage,
})

function AdminProductsPage() {
  const { showToast } = useToast()
  
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const [categoriesList, setCategoriesList] = useState<Category[]>([])

  const loadProducts = async () => {
    try {
      setLoading(true)
      // Pass filters directly to the API in a real app, but for simplicity here we'll fetch a larger page and filter locally
      const res = await fetchAdminProducts(1, 100, {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        search: searchQuery || undefined
      })
      setProducts(res.items)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Trigger search with basic debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter, categoryFilter])

  useEffect(() => {
    const loadCats = async () => {
      try {
        const cats = await fetchCategories()
        setCategoriesList(cats)
      } catch (e) {
        // ignore
      }
    }
    loadCats()
  }, [])


  const categories = useMemo(() => {
    return ['All', ...categoriesList.map(c => c.name)]
  }, [categoriesList])

  // Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleToggleAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
  }

  // Action Handlers
  const handleQuickAction = async (id: string, action: 'edit' | 'archive' | 'delete') => {
    if (action === 'archive') {
      try {
        await archiveAdminProduct(id)
        showToast('Product archived successfully')
        loadProducts()
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to archive product')
      }
    } else if (action === 'delete') {
      showToast('Delete not supported. Use Archive instead.')
    }
  }

  const handleBulkUpdateStatus = async () => {
    showToast('Bulk update not implemented in v1')
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    showToast('Bulk delete not supported. Archive instead.')
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
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/categories" 
            className="bg-cloud text-ink/70 px-4 py-2.5 rounded-xl font-medium hover:text-ink hover:bg-ink/5 transition-colors"
          >
            Manage Categories
          </Link>
          <Link 
            to="/admin/products/new" 
            className="bg-ink text-cloud px-4 py-2.5 rounded-xl font-medium hover:bg-sky hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
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
      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-ink/20 border-t-sky animate-spin"></div></div>
      ) : (
        <ProductTable 
          products={products}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onQuickAction={handleQuickAction}
        />
      )}

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
