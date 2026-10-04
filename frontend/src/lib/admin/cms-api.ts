import { api } from '@/lib/api'

export const cmsApi = {
  getHeroBanner: async () => {
    const res = await api.get('/cms/hero')
    return res.data
  },
  
  updateHeroBanner: async (data: any) => {
    const res = await api.put('/cms/hero', { value: data })
    return res.data
  },

  resetHeroBanner: async () => {
    const res = await api.post('/cms/hero/reset')
    return res.data
  },

  setDefaultHeroBanner: async (data: any) => {
    const res = await api.post('/cms/hero/set_default', { value: data })
    return res.data
  },

  getCategoryTiles: async () => {
    const res = await api.get('/cms/category-tiles')
    return res.data
  },

  updateCategoryTiles: async (data: any) => {
    const res = await api.put('/cms/category-tiles', { value: data })
    return res.data
  },

  resetCategoryTiles: async () => {
    const res = await api.post('/cms/category-tiles/reset')
    return res.data
  },

  setDefaultCategoryTiles: async (data: any) => {
    const res = await api.post('/cms/category-tiles/set_default', { value: data })
    return res.data
  },

  getHomeProducts: async () => {
    const res = await api.get('/cms/home-products')
    return res.data
  },
  updateHomeProducts: async (data: any) => {
    const res = await api.put('/cms/home-products', { value: data })
    return res.data
  },
  resetHomeProducts: async () => {
    const res = await api.post('/cms/home-products/reset')
    return res.data
  },
  setDefaultHomeProducts: async (data: any) => {
    const res = await api.post('/cms/home-products/set_default', { value: data })
    return res.data
  },

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/cms/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }
}
