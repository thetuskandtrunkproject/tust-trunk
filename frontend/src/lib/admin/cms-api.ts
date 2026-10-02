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
  }
}
