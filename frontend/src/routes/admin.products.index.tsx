import { useState, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { ProductTable } from '@/components/admin/products/product-table'
import { BulkActionsBar } from '@/components/admin/products/bulk-actions-bar'
import { useToast } from '@/context/toast-context'
import type { AdminProductListItem } from '@/lib/admin/products-api'
import { fetchAdminProducts, archiveAdminProduct, duplicateAdminProduct, bulkMoveCategory, bulkUpdateStatus, bulkDeleteProducts } from '@/lib/admin/products-api'
import { useEffect } from 'react'
import type { Category } from '@/lib/admin/categories-api'
import { fetchCategories } from '@/lib/admin/categories-api'
import { AdminPageHeader, AdminFilterBar, AdminSearchInput, AdminSelect, AdminButton, AdminSpinner, ConfirmModal } from '@/components/admin/ui/primitives'
import { CategoryManagerPanel } from '@/components/admin/products/category-manager-panel'
import { DiscountManagerPanel } from '@/components/admin/products/discount-manager-panel'

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
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false)
  const [isDiscountPanelOpen, setIsDiscountPanelOpen] = useState(false)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetchAdminProducts(1, 100, {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        search: searchQuery || undefined
      })
      setProducts(res.items)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to fetch products', 'error')
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
  const handleQuickAction = async (id: string, action: 'edit' | 'archive' | 'unarchive' | 'delete' | 'duplicate') => {
    if (action === 'archive') {
      try {
        await archiveAdminProduct(id)
        showToast('Product archived successfully')
        loadProducts()
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to archive product')
      }
    } else if (action === 'unarchive') {
      try {
        await bulkUpdateStatus([id], 'Active')
        showToast('Product unarchived successfully')
        loadProducts()
      } catch (err: any) {
        showToast('Failed to unarchive product', 'error')
      }
    } else if (action === 'delete') {
      showToast('Delete not supported. Use Archive instead.')
    } else if (action === 'duplicate') {
      try {
        showToast('Duplicating product...', 'info')
        await duplicateAdminProduct(id)
        showToast('Product duplicated successfully', 'success')
        loadProducts()
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to duplicate product', 'error')
      }
    }
  }

  const handleBulkUpdateStatus = async (status: string) => {
    try {
      await bulkUpdateStatus(selectedIds, status)
      showToast(`Updated ${selectedIds.length} products to ${status}`)
      setSelectedIds([])
      loadProducts()
    } catch (err: any) {
      showToast('Failed to update status', 'error')
    }
  }

  const handleBulkDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Products',
      message: `Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`,
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }))
        try {
          await bulkDeleteProducts(selectedIds)
          showToast(`Deleted ${selectedIds.length} products`)
          setSelectedIds([])
          loadProducts()
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        } catch (err: any) {
          showToast('Failed to delete products. They may have orders attached.', 'error')
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        } finally {
          setConfirmModal(prev => ({ ...prev, isLoading: false }))
        }
      }
    })
  }

  const handleBulkMoveCategory = async (categoryId: string) => {
    try {
      await bulkMoveCategory(selectedIds, categoryId)
      showToast(`Moved ${selectedIds.length} products to new category`)
      setSelectedIds([])
      loadProducts()
    } catch (err: any) {
      showToast('Failed to move products', 'error')
    }
  }

  return (
    <div className="animate-in fade-in duration-300 relative pb-24">
      
      <AdminPageHeader 
        title="Products"
        description="Manage your catalog, pricing, and statuses."
        actions={
          <>
            <button 
              onClick={() => setIsCategoryPanelOpen(true)}
              className="bg-cloud text-ink/70 px-4 py-2.5 rounded-xl font-semibold text-sm hover:text-ink hover:bg-ink/5 transition-colors border border-ink/10"
            >
              Categories
            </button>
            <button 
              onClick={() => setIsDiscountPanelOpen(true)}
              className="bg-cloud text-ink/70 px-4 py-2.5 rounded-xl font-semibold text-sm hover:text-ink hover:bg-ink/5 transition-colors border border-ink/10"
            >
              Discounts
            </button>
            <Link to="/admin/products/new">
              <AdminButton icon={<Plus className="w-4 h-4" />}>
                Add Product
              </AdminButton>
            </Link>
          </>
        }
      />

      {/* Filters Bar */}
      <AdminFilterBar>
        <AdminSearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products..."
          className="flex-1 max-w-md"
        />
        <div className="flex gap-3">
          <AdminSelect value={statusFilter} onChange={(v) => setStatusFilter(v)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </AdminSelect>
          <AdminSelect value={categoryFilter} onChange={setCategoryFilter} className="capitalize">
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </AdminSelect>
        </div>
      </AdminFilterBar>

      {/* Table */}
      {loading ? (
        <AdminSpinner />
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
        onBulkMoveCategory={handleBulkMoveCategory}
        categories={categoriesList}
      />

      {/* Panels */}
      {isCategoryPanelOpen && (
        <CategoryManagerPanel onClose={() => {
          setIsCategoryPanelOpen(false)
          // reload categories and products in case something changed
          const loadCats = async () => {
            try {
              const cats = await fetchCategories()
              setCategoriesList(cats)
            } catch (e) {
              // ignore
            }
          }
          loadCats()
          loadProducts()
        }} />
      )}

      {isDiscountPanelOpen && (
        <DiscountManagerPanel onClose={() => {
          setIsDiscountPanelOpen(false)
          loadProducts()
        }} />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        isLoading={confirmModal.isLoading}
      />
    </div>
  )
}

