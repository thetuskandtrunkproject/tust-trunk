import { useState, Fragment } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { AdminProduct } from '@/lib/admin/mock-admin-products'
import { useAdminProducts } from '@/context/admin-product-context'
import { useToast } from '@/context/toast-context'

interface InventoryTableProps {
  products: AdminProduct[]
}

export function InventoryTable({ products }: InventoryTableProps) {
  const { updateVariantStock } = useAdminProducts()
  const { showToast } = useToast()
  
  // Track expanded rows (product IDs)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleStockBlur = (productId: string, variantId: string, oldStock: number, newStockStr: string) => {
    const newStock = parseInt(newStockStr)
    if (isNaN(newStock) || newStock < 0) return // Invalid input
    if (newStock === oldStock) return // No change
    
    updateVariantStock(productId, variantId, newStock)
    showToast('Stock updated')
  }

  return (
    <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cloud border-b border-ink/10 text-xs font-medium text-ink/60 uppercase tracking-wider">
              <th className="px-6 py-4 w-12"></th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Total Stock</th>
              <th className="px-6 py-4">Variants</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map(product => {
              const isExpanded = expandedRows.has(product.id)
              const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0)
              const hasLowStock = product.variants.some(v => v.stock < 5 && v.stock > 0)
              const hasOutOfStock = product.variants.some(v => v.stock === 0)
              const isTracking = product.variants.length > 0

              return (
                <Fragment key={product.id}>
                  {/* Main Product Row */}
                  <tr 
                    onClick={() => toggleRow(product.id)}
                    className={`border-b border-ink/5 hover:bg-ink/[0.02] cursor-pointer transition-colors ${isExpanded ? 'bg-ink/[0.02]' : ''}`}
                  >
                    <td className="px-6 py-4 text-ink/40">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cloud rounded-lg overflow-hidden shrink-0 border border-ink/5">
                          {product.images[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-ink">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isTracking ? (
                        <span className="font-medium text-ink">{totalStock} in stock</span>
                      ) : (
                        <span className="text-ink/50">Not tracked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink/70">{product.variants.length}</td>
                    <td className="px-6 py-4">
                      {!isTracking ? null : hasOutOfStock ? (
                        <span className="flex items-center gap-1.5 text-rust text-xs font-medium">
                          <AlertCircle className="w-4 h-4" /> Out of stock
                        </span>
                      ) : hasLowStock ? (
                        <span className="flex items-center gap-1.5 text-[#B28A00] text-xs font-medium">
                          <AlertCircle className="w-4 h-4" /> Low stock
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-green-700 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> In stock
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Variants Row */}
                  {isExpanded && product.variants.length > 0 && (
                    <tr className="bg-cloud/50 border-b border-ink/10">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="pl-16 pr-4">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-xs font-medium text-ink/50 uppercase tracking-wider border-b border-ink/5">
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
                                      onClick={(e) => e.stopPropagation()} // Prevent row toggle
                                      className={`w-24 bg-white border rounded-md px-3 py-1 text-sm focus:outline-none focus:border-sky/50 ${
                                        variant.stock === 0 ? 'border-rust text-rust font-medium' :
                                        variant.stock < 5 ? 'border-[#F2C94C] text-[#B28A00] font-medium' :
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
      </div>
      {products.length === 0 && (
        <div className="p-12 text-center text-ink/50">No products matching the criteria.</div>
      )}
    </div>
  )
}
