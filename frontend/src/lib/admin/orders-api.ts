import { api } from '@/lib/api'

export interface AdminOrderItem {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  date: string
  status: string
  payment_status: string
  payment_method: string
  total_paise: number
}

export interface AdminOrdersListResponse {
  orders: AdminOrderItem[]
  total_count: number
  page: number
  page_size: number
}

export async function fetchAdminOrders(startDate?: string, endDate?: string): Promise<AdminOrdersListResponse> {
  const params = new URLSearchParams()
  // Fetching a large page_size since it's for reporting/exporting
  params.append('page_size', '100')
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  
  const res = await api.get(`/api/v1/admin/orders?${params.toString()}`)
  return res.data
}
