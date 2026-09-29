import { api } from '../api'

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get('/admin/categories')
  return res.data
}

export const createCategory = async (data: { name: string, slug: string, description: string, is_active: boolean }): Promise<Category> => {
  const res = await api.post('/admin/categories', data)
  return res.data
}

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const res = await api.patch(`/admin/categories/${id}`, data)
  return res.data
}

export const deleteCategory = async (id: string): Promise<Category> => {
  const res = await api.delete(`/admin/categories/${id}`)
  return res.data
}
