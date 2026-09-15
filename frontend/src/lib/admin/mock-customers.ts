import { adminMockOrders } from './mock-orders'

export interface CustomerAddress {
  id: string
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface AdminCustomer {
  id: string
  name: string
  email: string
  phone: string
  joinedDate: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string | null
  addresses: CustomerAddress[]
}

export const adminMockCustomers: AdminCustomer[] = (() => {
  const customerMap = new Map<string, AdminCustomer>()

  // Process all orders to build customer profiles
  adminMockOrders.forEach(order => {
    const email = order.customerEmail
    
    if (!customerMap.has(email)) {
      // Create new customer profile
      // Determine a plausible join date (before their first order)
      const orderDate = new Date(order.date)
      const joinDate = new Date(orderDate)
      joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 60) - 1)

      customerMap.set(email, {
        id: `CUST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        joinedDate: joinDate.toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        addresses: [
          {
            id: 'addr-1',
            name: order.shippingAddress.name,
            address1: order.shippingAddress.address1,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            pincode: order.shippingAddress.pincode,
            isDefault: true
          }
        ]
      })
    }

    // Update existing profile
    const customer = customerMap.get(email)!
    customer.totalOrders += 1
    customer.totalSpent += order.total
    
    // Update last order date if this order is newer
    if (!customer.lastOrderDate || new Date(order.date) > new Date(customer.lastOrderDate)) {
      customer.lastOrderDate = order.date
    }
  })

  // To ensure we have around 25-30 customers, let's add some mock customers who haven't ordered yet if we don't have enough
  const currentCustomers = Array.from(customerMap.values())
  
  const additionalNames = [
    { name: 'Arjun Reddy', email: 'arjun.reddy@example.com' },
    { name: 'Meera Nair', email: 'meera.nair@example.com' },
    { name: 'Rohan Gupta', email: 'rohan.gupta@example.com' },
    { name: 'Aisha Khan', email: 'aisha.khan@example.com' },
    { name: 'Vikram Singh', email: 'vikram.singh@example.com' },
    { name: 'Neha Sharma', email: 'neha.sharma@example.com' },
    { name: 'Kunal Patel', email: 'kunal.patel@example.com' },
    { name: 'Pooja Desai', email: 'pooja.desai@example.com' }
  ]

  additionalNames.forEach(({ name, email }) => {
    if (!customerMap.has(email) && customerMap.size < 30) {
      const joinDate = new Date()
      joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 90))
      
      customerMap.set(email, {
        id: `CUST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name,
        email,
        phone: `+91 98${Math.floor(Math.random() * 100000000)}`,
        joinedDate: joinDate.toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        addresses: []
      })
    }
  })

  // Sort by most recent joined date
  return Array.from(customerMap.values()).sort((a, b) => 
    new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
  )
})()
