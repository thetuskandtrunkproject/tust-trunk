import { useState, useMemo, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { InventoryTable } from '@/components/admin/inventory/inventory-table'
import { fetchAdminProducts } from '@/lib/admin/products-api'
import { useToast } from '@/context/toast-context'
import type { AdminProduct } from '@/lib/admin/products-api'
import { AdminPageHeader, AdminFilterBar, AdminSearchInput, AdminSelect, AdminSpinner } from '@/components/admin/ui/primitives'

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
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesSku = product.variants.some(v => v.sku.toLowerCase().includes(query))
        if (!matchesName && !matchesSku) return false
      }
      
      if (stockFilter === 'Out') {
        if (!product.variants.some(v => v.stock === 0)) return false
      } else if (stockFilter === 'Low') {
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
      
      <AdminPageHeader 
        title="Inventory"
        description="Track and adjust stock levels across all variants."
      />

      <AdminFilterBar>
        <AdminSearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products or SKUs..."
          className="flex-1 max-w-md"
        />
        <div className="flex gap-3">
          <AdminSelect value={stockFilter} onChange={(v) => setStockFilter(v as any)}>
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock (&lt;5)</option>
            <option value="Out">Out of Stock</option>
          </AdminSelect>
        </div>
      </AdminFilterBar>

      {isLoading ? (
        <AdminSpinner />
      ) : (
        <InventoryTable products={filteredProducts} onStockUpdate={handleStockUpdate} />
      )}

    </div>
  )

}
