export interface MockAddress {
  id: string
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface MockUser {
  name: string
  email: string
  phone: string
  addresses: MockAddress[]
}

export interface MockOrderItem {
  productId: string
  size: string
  color: string
  quantity: number
  priceAtPurchase: number
}

export interface MockOrder {
  orderNumber: string
  date: string
  status: 'Delivered' | 'Shipped' | 'Out for Delivery' | 'Processing' | 'Cancelled'
  items: MockOrderItem[]
  shippingAddress: MockAddress
  total: number
}

export const mockUser: MockUser = {
  name: "Arjun Mehta",
  email: "arjun.mehta@example.com",
  phone: "+91 98765 43210",
  addresses: [
    {
      id: "addr_1",
      name: "Arjun Mehta",
      address1: "A-102, Sunrise Apartments",
      address2: "Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400020",
      isDefault: true
    }
  ]
}

export const mockOrders: MockOrder[] = [
  {
    orderNumber: "ORD-928X4H",
    date: "2023-10-15T14:30:00Z",
    status: "Delivered",
    shippingAddress: mockUser.addresses[0],
    total: 8498,
    items: [
      {
        productId: "men-linen-shirt-01",
        size: "L",
        color: "#FAF7F2",
        quantity: 1,
        priceAtPurchase: 2499
      },
      {
        productId: "men-jeans-01",
        size: "M",
        color: "#30343D",
        quantity: 2,
        priceAtPurchase: 2999
      }
    ]
  },
  {
    orderNumber: "ORD-381F9Y",
    date: "2023-11-20T09:15:00Z",
    status: "Shipped",
    shippingAddress: mockUser.addresses[0],
    total: 3999,
    items: [
      {
        productId: "women-hoodie-01",
        size: "M",
        color: "#2C3E50",
        quantity: 1,
        priceAtPurchase: 3999
      }
    ]
  },
  {
    orderNumber: "ORD-774M2P",
    date: "2023-12-05T18:45:00Z",
    status: "Processing",
    shippingAddress: mockUser.addresses[0],
    total: 1499,
    items: [
      {
        productId: "kids-tee-01",
        size: "4Y",
        color: "#3395FF",
        quantity: 1,
        priceAtPurchase: 1499
      }
    ]
  },
  {
    orderNumber: "ORD-192K3Z",
    date: "2023-08-10T11:20:00Z",
    status: "Cancelled",
    shippingAddress: mockUser.addresses[0],
    total: 5998,
    items: [
      {
        productId: "men-linen-shirt-01",
        size: "XL",
        color: "#4A5D23",
        quantity: 2,
        priceAtPurchase: 2999
      }
    ]
  },
  {
    orderNumber: "ORD-556Q8L",
    date: "2023-05-22T16:00:00Z",
    status: "Delivered",
    shippingAddress: mockUser.addresses[0],
    total: 2999,
    items: [
      {
        productId: "women-tee-01",
        size: "S",
        color: "#FFFFFF",
        quantity: 1,
        priceAtPurchase: 2999
      }
    ]
  }
]
