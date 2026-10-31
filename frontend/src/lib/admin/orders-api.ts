import { api } from '@/lib/api'

export interface OrderItemDetail {
  variant_id?: string
  product_name_snapshot: string
  size_snapshot: string
  quantity: number
  price_at_purchase: number
  image_url?: string | null
}

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
  subtotal_paise?: number
  delivery_fee_paise?: number
  discount_paise?: number
  gst_paise?: number
  total_paise: number
  items?: OrderItemDetail[]
  shipping_address?: any
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

export async function deleteAdminOrder(orderId: string): Promise<any> {
  const res = await api.delete(`/api/v1/admin/orders/${orderId}`)
  return res.data
}

export async function bulkDeleteAdminOrders(orderIds: string[]): Promise<any> {
  const res = await api.post('/api/v1/admin/orders/bulk/delete', { order_ids: orderIds })
  return res.data
}
