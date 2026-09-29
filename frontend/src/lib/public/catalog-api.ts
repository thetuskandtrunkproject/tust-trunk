import { api } from '../api'

export type PublicVariant = {
  id: string
  sku: string
  size: string
  price: number // in rupees
  stock: number
}

export type PublicProduct = {
  id: string
  slug: string
  name: string
  description: string
  gender: 'Women' | 'Kids'
  category: string
  category_id: string
  images: string[]
  tags: string[]
  variants: PublicVariant[]
}

export type PublicProductListItem = {
  id: string
  slug: string
  name: string
  gender: 'Women' | 'Kids'
  category: string
  images: string[]
  tags: string[]
  min_price: number
  max_price: number
  available_sizes: string[]
  total_stock: number
}

export type PublicProductListResponse = {
  items: PublicProductListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type PublicCategory = {
  id: string
  name: string
  slug: string
}

export const fetchPublicCategories = async (): Promise<PublicCategory[]> => {
  const res = await api.get('/public/categories')
  return res.data
}

export const searchPublicProducts = async (params: Record<string, any>): Promise<PublicProductListResponse> => {
  const res = await api.get('/public/products', { params })
  return res.data
}

export const getPublicProduct = async (slug: string): Promise<PublicProduct> => {
  const res = await api.get(`/public/products/${slug}`)
  return res.data
}
