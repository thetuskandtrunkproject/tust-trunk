import { api } from '@/lib/api'

// Module-level promise caches — each CMS value is fetched at most once per
// browser session. These mirror the server-side Cache-Control headers (5 min)
// but also prevent duplicate parallel requests from multiple components
// (e.g. SiteFooter + __root.tsx both reading shop-settings on first load).
let footerCache: Promise<any> | null = null
let shopSettingsCache: Promise<any> | null = null

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

  getAboutPage: async () => {
    const res = await api.get('/cms/about-page')
    return res.data
  },
  updateAboutPage: async (data: any) => {
    const res = await api.put('/cms/about-page', { value: data })
    return res.data
  },
  resetAboutPage: async () => {
    const res = await api.post('/cms/about-page/reset')
    return res.data
  },
  setDefaultAboutPage: async (data: any) => {
    const res = await api.post('/cms/about-page/set_default', { value: data })
    return res.data
  },

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/cms/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  // Cached: fetched once per session. Admin editors bypass this by calling the
  // update endpoint directly (which invalidates by reloading the editor state).
  getFooter: async () => {
    if (!footerCache) {
      footerCache = api.get('/cms/footer').then(res => res.data)
    }
    return footerCache
  },
  updateFooter: async (data: any) => {
    footerCache = null  // Invalidate cache on write
    const res = await api.put('/cms/footer', { value: data })
    return res.data
  },

  // Cached: fetched once per session.
  getShopSettings: async () => {
    if (!shopSettingsCache) {
      shopSettingsCache = api.get('/cms/shop-settings').then(res => res.data)
    }
    return shopSettingsCache
  },
  updateShopSettings: async (data: any) => {
    shopSettingsCache = null  // Invalidate cache on write
    const res = await api.put('/cms/shop-settings', { value: data })
    return res.data
  }
}
