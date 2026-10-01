import { useState, Fragment } from 'react'
import { ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react'
import type { AdminProduct } from '@/lib/admin/products-api'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'
import { AdminTableShell, AdminThumbnail, StatusBadge } from '@/components/admin/ui/primitives'

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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Out of Stock'
    if (stock < 5) return 'Low Stock'
    return 'In Stock'
  }
  
  const getProductStockStatus = (product: AdminProduct) => {
    const hasOutOfStock = product.variants.some(v => v.stock === 0)
    const hasLowStock = product.variants.some(v => v.stock < 5 && v.stock > 0)
    if (hasOutOfStock) return 'Out of Stock'
    if (hasLowStock) return 'Low Stock'
    return 'In Stock'
  }

  const Th = ({ children, sortable }: { children: React.ReactNode, sortable?: boolean }) => (
    <th className="px-4 py-3 text-left text-[12px] font-bold text-[#202223] whitespace-nowrap bg-white border-b border-[#E3E3E3]">
      <div className="flex items-center gap-1.5">
        {children}
        {sortable && <ArrowUpDown className="w-3.5 h-3.5 text-[#5C5F62]" />}
      </div>
    </th>
  )

  const Td = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <td className={`px-4 py-4 text-[13px] text-[#202223] align-middle ${className}`}>
      {children}
    </td>
  )

  return (
    <AdminTableShell isEmpty={products.length === 0} emptyMessage="No products matching the criteria.">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Variant</Th>
            <Th>SKU</Th>
            <Th sortable>Total Stock</Th>
            <Th sortable>Reserved</Th>
            <Th sortable>Available</Th>
            <Th sortable>Sold</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {products.map(product => {
            const isExpanded = expandedRows.has(product.id)
            const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0)
            const isTracking = product.variants.length > 0
            const stockStatus = getProductStockStatus(product)

            return (
              <Fragment key={product.id}>
                {/* Parent Row */}
                <tr className="border-b border-[#E3E3E3] hover:bg-[#F4F6F8] transition-colors">
                  <Td>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleRow(product.id)}
                        className="p-1 hover:bg-black/5 rounded text-[#5C5F62]"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <AdminThumbnail src={product.images[0]} alt={product.name} />
                      <div className="flex flex-col">
                        <span className="font-semibold">{product.name}</span>
                        <span className="text-[#6D7175] text-[12px]">{product.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-[#6D7175]">{product.variants.length} Variants</Td>
                  <Td className="text-[#6D7175]">{product.variants.length > 1 ? 'Multiple' : product.variants[0]?.sku || 'N/A'}</Td>
                  <Td className="font-medium">{isTracking ? totalStock : '-'}</Td>
                  <Td>0</Td>
                  <Td className="font-medium">{isTracking ? totalStock : '-'}</Td>
                  <Td>0</Td>
                  <Td>
                    {isTracking && <StatusBadge status={stockStatus} />}
                  </Td>
                </tr>

                {/* Child Variant Rows */}
                {isExpanded && product.variants.map((variant) => (
                  <tr key={variant.id} className="border-b border-[#E3E3E3] bg-[#FAFAFA] hover:bg-[#F4F6F8] transition-colors">
                    <Td>
                      <div className="flex items-center gap-3 pl-9">
                        <AdminThumbnail src={product.images[0]} alt={product.name} />
                        <div className="flex flex-col">
                          <span className="font-semibold">{product.name}</span>
                          <span className="text-[#6D7175] text-[12px]">{product.category || 'Uncategorized'}</span>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-[#6D7175]">{variant.size}</Td>
                    <Td className="font-mono text-[12px] text-[#6D7175]">{variant.sku}</Td>
                    <Td className="font-medium">{variant.stock}</Td>
                    <Td>0</Td>
                    <Td>
                      <input 
                        type="number"
                        min="0"
                        defaultValue={variant.stock}
                        onBlur={(e) => handleStockBlur(product.id, variant.id, variant.stock, e.target.value)}
                        className={`w-20 bg-white border rounded px-2 py-1 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#005bd3] focus:border-transparent transition-all ${
                          variant.stock === 0 ? 'border-red-300 text-red-600' :
                          variant.stock < 5 ? 'border-amber-300 text-amber-700' :
                          'border-[#C9CCCF] text-[#202223]'
                        }`}
                      />
                    </Td>
                    <Td>0</Td>
                    <Td>
                      <StatusBadge status={getStockStatus(variant.stock)} />
                    </Td>
                  </tr>
                ))}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </AdminTableShell>
  )
}
