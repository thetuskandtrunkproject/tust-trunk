import { mockProducts } from '../mock-products'

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'requires_review'
export type PaymentStatus = 'Paid' | 'Failed' | 'Refunded' | 'Pending'

export interface AdminOrderItem {
  productId: string
  size: string
  quantity: number
  priceAtPurchase: number
}

export interface AdminOrder {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  date: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string
  shipping_address: {
    name: string
    address1: string
    address2?: string
    city: string
    state: string
    pincode: string
  }
  items: AdminOrderItem[]
  subtotal_paise: number
  delivery_fee_paise: number
  total_paise: number
}

// Generate ~30 mock orders
const generateMockOrders = (): AdminOrder[] => {
  const statuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  const pStatuses: PaymentStatus[] = ['Paid', 'Failed', 'Refunded', 'Pending']
  const methods = ['Credit Card', 'UPI', 'Cash on Delivery']
  const firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Neha', 'Rohan', 'Ananya', 'Karan', 'Pooja']
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Desai', 'Mehta', 'Joshi', 'Chawla', 'Verma']
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune']
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Maharashtra']

  const orders: AdminOrder[] = []

  for (let i = 0; i < 35; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${fName} ${lName}`
    const cityIdx = Math.floor(Math.random() * cities.length)
    
    // Generate 1-3 items
    const itemCount = Math.floor(Math.random() * 3) + 1
    const items: AdminOrderItem[] = []
    let subtotal = 0

    for (let j = 0; j < itemCount; j++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      const qty = Math.floor(Math.random() * 2) + 1
      items.push({
        productId: product.id,
        size: product.sizes[Math.floor(Math.random() * product.sizes.length)],
        quantity: qty,
        priceAtPurchase: product.price
      })
      subtotal += product.price * qty
    }

    const deliveryFee = subtotal > 3000 ? 0 : 60
    
    // Dates mostly in the past 30 days
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))

    const isDelivered = date.getTime() < Date.now() - 5 * 24 * 60 * 60 * 1000
    let status: OrderStatus = isDelivered ? 'Delivered' : statuses[Math.floor(Math.random() * statuses.length)]
    
    // Weight statuses so there are more delivered/shipped
    if (Math.random() > 0.6) status = 'Delivered'

    const sequenceNumber = (i + 1).toString().padStart(5, '0')
    const orderNumber = `ORD-TT-${sequenceNumber}`

    orders.push({
      id: orderNumber,
      order_number: orderNumber,
      customer_name: name,
      customer_email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
      customer_phone: `+91 98${Math.floor(Math.random() * 100000000)}`,
      date: date.toISOString(),
      status,
      payment_status: status === 'Cancelled' ? 'Refunded' : (Math.random() > 0.1 ? 'Paid' : 'Failed'),
      payment_method: methods[Math.floor(Math.random() * methods.length)],
      shipping_address: {
        name,
        address1: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: cities[cityIdx],
        state: states[cityIdx],
        pincode: `4000${Math.floor(Math.random() * 99)}`
      },
      items,
      subtotal_paise: subtotal * 100,
      delivery_fee_paise: deliveryFee * 100,
      total_paise: (subtotal + deliveryFee) * 100
    })
  }

  // Sort by newest first
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const adminMockOrders = generateMockOrders()
