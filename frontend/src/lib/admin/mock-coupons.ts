export type CouponType = 'percent' | 'flat' | 'free_shipping'
export type CouponScope = 'store_wide' | 'Kids' | 'Women'
export type CouponStatus = 'Active' | 'Inactive' | 'Expired'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number // Not applicable for free_shipping
  minCartValue: number
  totalUsageLimit: number | null
  perCustomerLimit: number | null
  usageCount: number
  scope: CouponScope
  startDate: string
  endDate: string
  isActive: boolean // Used for manual toggle
}

export interface CouponRedemption {
  id: string
  couponId: string
  orderNumber: string
  date: string
  customer: string
  discountAmount: number
}

export let MOCK_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minCartValue: 500,
    totalUsageLimit: null,
    perCustomerLimit: 1,
    usageCount: 142,
    scope: 'store_wide',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'c2',
    code: 'FLAT500',
    type: 'flat',
    value: 500,
    minCartValue: 2000,
    totalUsageLimit: 500,
    perCustomerLimit: 1,
    usageCount: 450,
    scope: 'store_wide',
    startDate: '2025-05-01',
    endDate: '2025-08-31',
    isActive: true,
  },
  {
    id: 'c3',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minCartValue: 1000,
    totalUsageLimit: null,
    perCustomerLimit: null,
    usageCount: 890,
    scope: 'store_wide',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'c4',
    code: 'KIDS20',
    type: 'percent',
    value: 20,
    minCartValue: 1500,
    totalUsageLimit: 100,
    perCustomerLimit: 2,
    usageCount: 45,
    scope: 'Kids',
    startDate: '2025-09-01',
    endDate: '2025-10-31',
    isActive: true,
  },
  {
    id: 'c5',
    code: 'WOMEN50',
    type: 'flat',
    value: 50,
    minCartValue: 1000,
    totalUsageLimit: null,
    perCustomerLimit: 1,
    usageCount: 0,
    scope: 'Women',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    isActive: false, // Inactive
  },
  {
    id: 'c6',
    code: 'SUMMER25',
    type: 'percent',
    value: 25,
    minCartValue: 3000,
    totalUsageLimit: 200,
    perCustomerLimit: 1,
    usageCount: 200, // Maxed out
    scope: 'store_wide',
    startDate: '2024-06-01',
    endDate: '2024-08-31', // Expired
    isActive: true,
  }
]

export const MOCK_REDEMPTIONS: CouponRedemption[] = [
  { id: 'r1', couponId: 'c1', orderNumber: 'ORD-2025-101', date: '2025-10-01', customer: 'john@example.com', discountAmount: 150 },
  { id: 'r2', couponId: 'c1', orderNumber: 'ORD-2025-105', date: '2025-10-02', customer: 'sarah@example.com', discountAmount: 85 },
  { id: 'r3', couponId: 'c2', orderNumber: 'ORD-2025-108', date: '2025-10-02', customer: 'mike@example.com', discountAmount: 500 },
  { id: 'r4', couponId: 'c4', orderNumber: 'ORD-2025-112', date: '2025-10-03', customer: 'emma@example.com', discountAmount: 400 },
  { id: 'r5', couponId: 'c3', orderNumber: 'ORD-2025-115', date: '2025-10-04', customer: 'alex@example.com', discountAmount: 120 },
]

export const getCouponStatus = (coupon: Coupon): CouponStatus => {
  if (!coupon.isActive) return 'Inactive'
  if (new Date(coupon.endDate) < new Date()) return 'Expired'
  return 'Active'
}
