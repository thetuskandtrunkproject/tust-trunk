import { useState } from 'react'
import { Archive, ArrowDownToLine, MoreHorizontal, PenLine, Plus, Trash2 } from 'lucide-react'
import type { AdminProduct, ProductStatus } from '@/lib/admin/mock-admin-products'
import { Link } from '@tanstack/react-router'

interface ProductTableProps {
  products: AdminProduct[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  onQuickAction: (id: string, action: 'edit' | 'archive' | 'delete') => void
}

export function ProductTable({ products, selectedIds, onToggleSelect, onToggleAll, onQuickAction }: ProductTableProps) {
  
  const allSelected = products.length > 0 && selectedIds.length === products.length
  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`

  const StatusBadge = ({ status }: { status: ProductStatus }) => {
    switch (status) {
      case 'Active': return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Active</span>
      case 'Draft': return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2C94C]/20 text-[#B28A00] border border-[#F2C94C]/30">Draft</span>
      case 'Archived': return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-ink/10 text-ink/70 border border-ink/20">Archived</span>
    }
  }

  // Desktop Table
  const DesktopTable = () => (
    <div className="hidden lg:block bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cloud border-b border-ink/10 text-xs font-medium text-ink/60 uppercase tracking-wider">
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="w-4 h-4 rounded border-ink/20 text-sky focus:ring-sky cursor-pointer"
                />
              </th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Variants</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map(product => {
              const isSelected = selectedIds.includes(product.id)
              return (
                <tr key={product.id} className={`border-b border-ink/5 hover:bg-ink/[0.02] transition-colors ${isSelected ? 'bg-sky/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id)}
                      className="w-4 h-4 rounded border-ink/20 text-sky focus:ring-sky cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cloud rounded-lg overflow-hidden shrink-0 border border-ink/5">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink/20"><Plus className="w-4 h-4" /></div>
                        )}
                      </div>
                      <span className="font-medium text-ink">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink/70 capitalize">{product.gender} • {product.category}</td>
                  <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                  <td className="px-6 py-4 font-medium text-ink">{formatPrice(product.basePrice)}</td>
                  <td className="px-6 py-4 text-ink/70">{product.variants.length}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/products/${product.id}`}
                        className="p-2 text-ink/40 hover:text-sky hover:bg-sky/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PenLine className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => onQuickAction(product.id, 'archive')}
                        className="p-2 text-ink/40 hover:text-rust hover:bg-rust/10 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="p-12 text-center text-ink/50">No products found.</div>
      )}
    </div>
  )

  // Mobile List
  const MobileList = () => (
    <div className="lg:hidden flex flex-col gap-4">
      {products.map(product => {
        const isSelected = selectedIds.includes(product.id)
        return (
          <div key={product.id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-colors ${isSelected ? 'border-sky bg-sky/5' : 'border-ink/10'}`}>
            <div className="flex gap-4">
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelect(product.id)}
                className="mt-1 w-4 h-4 rounded border-ink/20 text-sky focus:ring-sky cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cloud rounded-lg overflow-hidden shrink-0 border border-ink/5">
                      {product.images[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium text-ink truncate mb-1">{product.name}</p>
                      <p className="font-semibold text-ink text-sm">{formatPrice(product.basePrice)}</p>
                    </div>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-ink/5">
                  <span className="text-xs text-ink/60 capitalize">{product.gender} • {product.category} ({product.variants.length} var)</span>
                  <div className="flex gap-3">
                    <Link to={`/admin/products/${product.id}`} className="text-xs font-medium text-sky">Edit</Link>
                    <button onClick={() => onQuickAction(product.id, 'archive')} className="text-xs font-medium text-rust">Archive</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      {products.length === 0 && (
        <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-ink/50">
          No products found.
        </div>
      )}
    </div>
  )

  return (
    <>
      <DesktopTable />
      <MobileList />
    </>
  )
}
