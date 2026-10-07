import { api } from '../api'

export interface AdminProductVariant {
  id: string
  sku: string
  size: string
  price: number
  sale_price?: number
  sale_start_date?: string
  sale_end_date?: string
  stock: number
  is_active: boolean
  product_id?: string
}

export interface ProductDetail {
  key: string
  value: string
}

export interface AdminProductListItem {
  id: string
  name: string
  slug: string
  gender: string
  category_id: string
  category: string
  status: 'Active' | 'Draft' | 'Archived'
  images: string[]
  tags: string[]
  details?: ProductDetail[]
  variant_count: number
  total_stock: number
  created_at: string
  updated_at: string
  variants?: AdminProductVariant[]
}

export interface AdminProduct {
  id: string
  name: string
  slug: string
  description: string
  gender: 'Women' | 'Kids'
  category_id: string
  category: string
  status: 'Active' | 'Draft' | 'Archived'
  images: string[]
  tags: string[]
  details?: ProductDetail[]
  variants: AdminProductVariant[]
  created_at: string
  updated_at: string
}

export const fetchAdminProducts = async (page = 1, pageSize = 50, params: any = {}) => {
  const { data } = await api.get('/api/v1/admin/products/', {
    params: { page, page_size: pageSize, ...params }
  })
  return data
}

export const fetchAdminProduct = async (id: string) => {
  const { data } = await api.get(`/api/v1/admin/products/${id}`)
  return data as AdminProduct
}

export const createAdminProduct = async (productData: any) => {
  const { data } = await api.post('/api/v1/admin/products/', productData)
  return data as AdminProduct
}

export const updateAdminProduct = async (id: string, productData: any) => {
  const { data } = await api.patch(`/api/v1/admin/products/${id}`, productData)
  return data as AdminProduct
}

export const archiveAdminProduct = async (id: string) => {
  const { data } = await api.delete(`/api/v1/admin/products/${id}`)
  return data
}

export const duplicateAdminProduct = async (id: string) => {
  const { data } = await api.post(`/api/v1/admin/products/${id}/duplicate`)
  return data as AdminProduct
}

export const addVariant = async (productId: string, variantData: any) => {
  const { data } = await api.post(`/api/v1/admin/products/${productId}/variants/`, variantData)
  return data as AdminProductVariant
}

export const updateVariant = async (productId: string, variantId: string, variantData: any) => {
  const { data } = await api.patch(`/api/v1/admin/products/${productId}/variants/${variantId}`, variantData)
  return data as AdminProductVariant
}

export const deactivateVariant = async (productId: string, variantId: string) => {
  const { data } = await api.delete(`/api/v1/admin/products/${productId}/variants/${variantId}`)
  return data
}

export const uploadProductImage = async (productId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post(`/api/v1/admin/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data as AdminProduct
}

export const deleteProductImage = async (productId: string, imageUrl: string) => {
  const { data } = await api.delete(`/api/v1/admin/products/${productId}/images`, {
    data: { image_url: imageUrl }
  })
  return data as AdminProduct
}

// Bulk Actions
export const bulkMoveCategory = async (productIds: string[], categoryId: string) => {
  const { data } = await api.post('/api/v1/admin/products/bulk/category', { product_ids: productIds, category_id: categoryId })
  return data
}

export const bulkUpdateStatus = async (productIds: string[], status: string) => {
  const { data } = await api.post('/api/v1/admin/products/bulk/status', { product_ids: productIds, status })
  return data
}

export const bulkDeleteProducts = async (productIds: string[]) => {
  const { data } = await api.post('/api/v1/admin/products/bulk/delete', { product_ids: productIds })
  return data
}

export const bulkUpdateSalePrice = async (productIds: string[], salePrice: number | null, saleStartDate?: string | null, saleEndDate?: string | null) => {
  const { data } = await api.post('/api/v1/admin/products/bulk/sale-price', { 
    product_ids: productIds, 
    sale_price: salePrice,
    sale_start_date: saleStartDate,
    sale_end_date: saleEndDate
  })
  return data
}
