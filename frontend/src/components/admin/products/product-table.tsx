import { Archive, PenLine, CheckSquare, Eye, Copy, Trash2, ArchiveRestore } from 'lucide-react'
import type { AdminProductListItem } from '@/lib/admin/products-api'
import { Link, useRouter } from '@tanstack/react-router'
import { AdminTableShell, AdminTh, AdminTd, StatusBadge, AdminThumbnail, AdminButton, AdminActionsDropdown, AdminCheckbox } from '@/components/admin/ui/primitives'

interface ProductTableProps {
  products: AdminProductListItem[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  onQuickAction: (id: string, action: 'edit' | 'archive' | 'unarchive' | 'duplicate') => void
}

export function ProductTable({ products, selectedIds, onToggleSelect, onToggleAll, onQuickAction }: ProductTableProps) {
  const router = useRouter()
  const allSelected = products.length > 0 && selectedIds.length === products.length

  // Desktop Table
  const DesktopTable = () => (
    <div className="hidden lg:block">
      <AdminTableShell isEmpty={products.length === 0} emptyMessage="No products found.">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cloud/50 border-b border-ink/10">
              <AdminTh className="w-12">
                <AdminCheckbox 
                  checked={allSelected}
                  onChange={onToggleAll}
                />
              </AdminTh>
              <AdminTh>Product</AdminTh>
              <AdminTh>Category</AdminTh>
              <AdminTh>Price</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Stock</AdminTh>
              <AdminTh>Variants</AdminTh>
              <AdminTh className="text-right">Actions</AdminTh>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map(product => {
              const isSelected = selectedIds.includes(product.id)
              return (
                <tr 
                  key={product.id} 
                  onClick={() => onToggleSelect(product.id)}
                  className={`border-b border-ink/5 hover:bg-ink/[0.02] transition-colors cursor-pointer ${isSelected ? 'bg-sky/5' : ''}`}
                >
                  <AdminTd>
                    <AdminCheckbox 
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id)}
                    />
                  </AdminTd>
                  <AdminTd>
                    <div className="flex items-center gap-3">
                      <AdminThumbnail src={product.images[0]} alt={product.name} size="lg" />
                      <span className="font-medium text-ink">{product.name}</span>
                    </div>
                  </AdminTd>
                  <AdminTd className="text-ink/70 capitalize">{product.gender} • {product.category}</AdminTd>
                  <AdminTd className="font-medium text-ink">₹{(product.price / 100).toLocaleString('en-IN')}</AdminTd>
                  <AdminTd><StatusBadge status={product.status} /></AdminTd>
                  <AdminTd className="font-medium text-ink">{product.total_stock}</AdminTd>
                  <AdminTd className="text-ink/70">{product.variant_count}</AdminTd>
                  <AdminTd className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <AdminActionsDropdown 
                        actions={[
                          {
                            label: 'Select',
                            icon: <CheckSquare className="w-4 h-4" />,
                            onClick: () => onToggleSelect(product.id)
                          },
                          {
                            label: 'Edit',
                            icon: <PenLine className="w-4 h-4" />,
                            onClick: () => router.navigate({ to: '/admin/products/$productId', params: { productId: product.id } })
                          },
                          {
                            label: 'View in store',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => window.open(`/products/${product.slug}`, '_blank')
                          },
                          {
                            label: 'Duplicate',
                            icon: <Copy className="w-4 h-4" />,
                            onClick: () => onQuickAction(product.id, 'duplicate')
                          },
                          {
                            label: product.status === 'Archived' ? 'Unarchive' : 'Archive',
                            icon: product.status === 'Archived' ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />,
                            onClick: () => onQuickAction(product.id, product.status === 'Archived' ? 'unarchive' : 'archive'),
                            danger: product.status !== 'Archived'
                          }
                        ]}
                      />
                    </div>
                  </AdminTd>
                </tr>
              )
            })}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  )

  // Mobile List
  const MobileList = () => (
    <div className="lg:hidden flex flex-col gap-4">
      {products.map(product => {
        const isSelected = selectedIds.includes(product.id)
        return (
          <div 
            key={product.id} 
            onClick={() => onToggleSelect(product.id)}
            className={`bg-white border rounded-xl p-4 shadow-sm transition-colors cursor-pointer ${isSelected ? 'border-sky bg-sky/5' : 'border-ink/10'}`}
          >
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <AdminCheckbox 
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <AdminThumbnail src={product.images[0]} alt={product.name} size="lg" />
                    <div>
                      <p className="font-medium text-ink truncate mb-1">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-ink text-sm">₹{(product.price / 100).toLocaleString('en-IN')}</p>
                        <p className="font-medium text-ink/70 text-xs text-nowrap">• Stock: {product.total_stock}</p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-ink/5">
                  <span className="text-xs text-ink/60 capitalize">{product.gender} • {product.category} ({product.variant_count} var)</span>
                  <div className="flex gap-3">
                    <AdminActionsDropdown 
                      actions={[
                        {
                          label: 'Select',
                          icon: <CheckSquare className="w-4 h-4" />,
                          onClick: () => onToggleSelect(product.id)
                        },
                        {
                          label: 'Edit',
                          icon: <PenLine className="w-4 h-4" />,
                          onClick: () => router.navigate({ to: '/admin/products/$productId', params: { productId: product.id } })
                        },
                        {
                          label: 'View in store',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => window.open(`/products/${product.slug}`, '_blank')
                        },
                        {
                          label: 'Duplicate',
                          icon: <Copy className="w-4 h-4" />,
                          onClick: () => onQuickAction(product.id, 'duplicate')
                        },
                        {
                          label: product.status === 'Archived' ? 'Unarchive' : 'Archive',
                          icon: product.status === 'Archived' ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />,
                          onClick: () => onQuickAction(product.id, product.status === 'Archived' ? 'unarchive' : 'archive'),
                          danger: product.status !== 'Archived'
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      {products.length === 0 && (
        <div className="bg-white border border-ink/10 rounded-xl p-12 text-center text-ink/50 shadow-sm">
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

