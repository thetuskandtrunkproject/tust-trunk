import { createContext, useContext, useState, ReactNode } from 'react'
import { initialAdminProducts } from '@/lib/admin/mock-admin-products'
import type { AdminProduct } from '@/lib/admin/mock-admin-products'

interface AdminProductContextType {
  products: AdminProduct[]
  addProduct: (product: AdminProduct) => void
  updateProduct: (product: AdminProduct) => void
  deleteProduct: (id: string) => void
  updateVariantStock: (productId: string, variantId: string, newStock: number) => void
  bulkUpdateStatus: (productIds: string[], newStatus: AdminProduct['status']) => void
  bulkDeleteProducts: (productIds: string[]) => void
}

const AdminProductContext = createContext<AdminProductContextType | undefined>(undefined)

export function AdminProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(initialAdminProducts)

  const addProduct = (product: AdminProduct) => {
    setProducts(prev => [product, ...prev])
  }

  const updateProduct = (updatedProduct: AdminProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
  }

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const updateVariantStock = (productId: string, variantId: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p
      return {
        ...p,
        variants: p.variants.map(v => v.id === variantId ? { ...v, stock: newStock } : v)
      }
    }))
  }

  const bulkUpdateStatus = (productIds: string[], newStatus: AdminProduct['status']) => {
    setProducts(prev => prev.map(p => 
      productIds.includes(p.id) ? { ...p, status: newStatus } : p
    ))
  }

  const bulkDeleteProducts = (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(p.id)))
  }

  return (
    <AdminProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      updateVariantStock,
      bulkUpdateStatus,
      bulkDeleteProducts
    }}>
      {children}
    </AdminProductContext.Provider>
  )
}

export function useAdminProducts() {
  const context = useContext(AdminProductContext)
  if (context === undefined) {
    throw new Error('useAdminProducts must be used within an AdminProductProvider')
  }
  return context
}
