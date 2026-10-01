import { useState, Fragment } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { AdminProduct } from '@/lib/admin/products-api'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'
import { AdminTableShell, AdminTh, AdminTd, AdminThumbnail, StatusBadge } from '@/components/admin/ui/primitives'

interface InventoryTableProps {
  products: AdminProduct[]
  onStockUpdate: (productId: string, variantId: string, newStock: number) => void
}

export function InventoryTable({ products, onStockUpdate }: InventoryTableProps) {
  const { showToast } = useToast()
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleStockBlur = async (productId: string, variantId: string, oldStock: number, newStockStr: string) => {
    const newStock = parseInt(newStockStr)
    if (isNaN(newStock) || newStock < 0) return
    if (newStock === oldStock) return
    
    onStockUpdate(productId, variantId, newStock)
    
    try {
      await api.patch(`/api/v1/admin/variants/${variantId}/stock`, { stock: newStock })
      showToast('Stock updated')
    } catch (err) {
      onStockUpdate(productId, variantId, oldStock)
      showToast('Failed to update stock')
    }
  }

  const getStockStatus = (product: AdminProduct) => {
    const hasOutOfStock = product.variants.some(v => v.stock === 0)
    const hasLowStock = product.variants.some(v => v.stock < 5 && v.stock > 0)
    if (hasOutOfStock) return 'Out of Stock'
    if (hasLowStock) return 'Low Stock'
    return 'In Stock'
  }

  return (
    <AdminTableShell isEmpty={products.length === 0} emptyMessage="No products matching the criteria.">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cloud/50 border-b border-ink/10">
            <AdminTh className="w-12"></AdminTh>
            <AdminTh>Product</AdminTh>
            <AdminTh>Total Stock</AdminTh>
            <AdminTh>Variants</AdminTh>
            <AdminTh>Status</AdminTh>
          </tr>
        </thead>
        <tbody className="text-sm">
          {products.map(product => {
            const isExpanded = expandedRows.has(product.id)
            const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0)
            const isTracking = product.variants.length > 0
            const stockStatus = getStockStatus(product)

            return (
              <Fragment key={product.id}>
                <tr 
                  onClick={() => toggleRow(product.id)}
                  className={`border-b border-ink/5 hover:bg-ink/[0.02] cursor-pointer transition-colors ${isExpanded ? 'bg-ink/[0.02]' : ''}`}
                >
                  <AdminTd className="text-ink/40">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </AdminTd>
                  <AdminTd>
                    <div className="flex items-center gap-3">
                      <AdminThumbnail src={product.images[0]} alt={product.name} />
                      <span className="font-medium text-ink">{product.name}</span>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    {isTracking ? (
                      <span className="font-medium text-ink">{totalStock} in stock</span>
                    ) : (
                      <span className="text-ink/50">Not tracked</span>
                    )}
                  </AdminTd>
                  <AdminTd className="text-ink/70">{product.variants.length}</AdminTd>
                  <AdminTd>
                    {isTracking && <StatusBadge status={stockStatus} />}
                  </AdminTd>
                </tr>

                {isExpanded && product.variants.length > 0 && (
                  <tr className="bg-cloud/30 border-b border-ink/10">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="pl-16 pr-4">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-xs font-semibold text-ink/50 uppercase tracking-wider border-b border-ink/5">
                              <th className="pb-3 w-1/3">Size</th>
                              <th className="pb-3 w-1/3">SKU</th>
                              <th className="pb-3 w-1/3">Available Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map(variant => (
                              <tr key={variant.id} className="border-b border-ink/5 last:border-0">
                                <td className="py-3 text-ink/80">{variant.size}</td>
                                <td className="py-3 font-mono text-xs text-ink/60">{variant.sku}</td>
                                <td className="py-3">
                                  <input 
                                    type="number"
                                    min="0"
                                    defaultValue={variant.stock}
                                    onBlur={(e) => handleStockBlur(product.id, variant.id, variant.stock, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`w-24 bg-white border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky/10 focus:border-sky/40 transition-all ${
                                      variant.stock === 0 ? 'border-red-300 text-red-600 font-medium' :
                                      variant.stock < 5 ? 'border-amber-300 text-amber-700 font-medium' :
                                      'border-ink/20 text-ink'
                                    }`}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </AdminTableShell>
  )
}
