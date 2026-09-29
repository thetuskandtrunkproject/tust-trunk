import { useState, useMemo, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { InventoryTable } from '@/components/admin/inventory/inventory-table'
import { fetchAdminProducts, fetchAdminProduct } from '@/lib/admin/products-api'
import { useToast } from '@/context/toast-context'
import type { AdminProduct } from '@/lib/admin/products-api'

export const Route = createFileRoute('/admin/inventory')({
  component: AdminInventoryPage,
})

function AdminInventoryPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All')

  useEffect(() => {
    const loadInventory = async () => {
      try {
        // Fetch product list with variants included (1 query)
        const listRes = await fetchAdminProducts(1, 100, { include_variants: true })
        setProducts(listRes.items)
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to load inventory data')
      } finally {
        setIsLoading(false)
      }
    }
    loadInventory()
  }, [])

  // Derived filtered data
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Name/SKU Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesSku = product.variants.some(v => v.sku.toLowerCase().includes(query))
        if (!matchesName && !matchesSku) return false
      }
      
      // Stock Status Filter
      if (stockFilter === 'Out') {
        // Must have at least one out-of-stock variant
        if (!product.variants.some(v => v.stock === 0)) return false
      } else if (stockFilter === 'Low') {
        // Must have at least one low-stock variant (<5) but not 0
        if (!product.variants.some(v => v.stock > 0 && v.stock < 5)) return false
      }
      
      return true
    })
  }, [products, searchQuery, stockFilter])


  const handleStockUpdate = (productId: string, variantId: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        variants: p.variants.map(v => v.id === variantId ? { ...v, stock: newStock } : v)
      }
    }))
  }

  return (
    <div className="animate-in fade-in duration-300 pb-24">
      
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="font-heading font-bold text-2xl text-ink">Inventory</h2>
        <p className="text-ink/60 text-sm mt-1">Track and adjust stock levels across all variants.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-ink/10 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search products or SKUs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cloud border border-ink/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-sky/50"
          />
        </div>

        <div className="flex gap-4">
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-cloud border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky/50 min-w-[140px]"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock (&lt;5)</option>
            <option value="Out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-ink/20 border-t-sky animate-spin"></div></div>
      ) : (
        <InventoryTable products={filteredProducts} onStockUpdate={handleStockUpdate} />
      )}

    </div>
  )

}
