import { api } from '@/lib/api'

export interface ComboOffer {
  id: string
  title?: string
  category_id: string
  category_name?: string
  category_slug?: string
  min_quantity: number
  sequence_type: 'even' | 'odd'
  discount_type: 'flat' | 'percent'
  discount_value: number // In paise for flat (₹ = value / 100), or percent (1-100)
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface ComboOfferFormData {
  title?: string
  category_id: string
  min_quantity: number
  sequence_type: 'even' | 'odd'
  discount_type: 'flat' | 'percent'
  discount_value: number // in Rupees for flat input, or % (1-100)
  is_active: boolean
}

export interface AppliedComboOffer {
  offer_id: string
  category_id: string
  category_name: string
  eligible_quantity: number
  total_quantity?: number
  remaining_quantity?: number
  sequence_type: string
  discount_type: string
  discount_value: number
  discount_paise: number
  description: string
}

export interface PotentialComboOffer {
  category_id: string
  category_name: string
  current_quantity: number
  needed_quantity: number
  target_quantity: number
  message: string
}

export interface ComboCalculationResult {
  subtotal_paise: number
  combo_discount_paise: number
  final_subtotal_paise: number
  applied_offers: AppliedComboOffer[]
  potential_offers: PotentialComboOffer[]
}

export async function fetchAdminOffers(): Promise<ComboOffer[]> {
  const res = await api.get('/api/v1/admin/combo-offers')
  return res.data
}

export async function fetchAdminOfferById(id: string): Promise<ComboOffer> {
  const res = await api.get(`/api/v1/admin/combo-offers/${id}`)
  return res.data
}

export async function createAdminOffer(data: ComboOfferFormData): Promise<ComboOffer> {
  // Convert flat discount rupees to paise for backend
  const payload = {
    ...data,
    discount_value: data.discount_type === 'flat' ? Math.round(data.discount_value * 100) : data.discount_value,
  }
  const res = await api.post('/api/v1/admin/combo-offers', payload)
  return res.data
}

export async function updateAdminOffer(id: string, data: Partial<ComboOfferFormData>): Promise<ComboOffer> {
  const payload: any = { ...data }
  if (data.discount_value !== undefined && data.discount_type === 'flat') {
    payload.discount_value = Math.round(data.discount_value * 100)
  }
  const res = await api.patch(`/api/v1/admin/combo-offers/${id}`, payload)
  return res.data
}

export async function deleteAdminOffer(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/combo-offers/${id}`)
}

export async function calculatePublicComboOffers(items: { variant_id: string; quantity: number }[]): Promise<ComboCalculationResult> {
  const res = await api.post('/public/combo-offers/calculate', { items })
  return res.data
}

export async function fetchActiveComboOffers(): Promise<ComboOffer[]> {
  const res = await api.get('/public/combo-offers')
  return res.data
}
