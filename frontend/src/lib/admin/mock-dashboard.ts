export const mockDashboard = {
  todayRevenue: 24500,
  yesterdayRevenue: 21200,
  totalOrdersToday: 42,
  totalOrdersMonth: 1240,
  pendingOrders: 18,
  lowStockCount: 5,
  
  revenueData30Days: Array.from({ length: 30 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    
    // Generate realistic looking fluctuation
    const baseVal = 20000
    const randomNoise = (Math.random() - 0.5) * 10000
    const weekendBoost = (date.getDay() === 0 || date.getDay() === 6) ? 8000 : 0
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.max(0, Math.round(baseVal + randomNoise + weekendBoost))
    }
  }),
  
  topProducts: [
    {
      id: 'men-linen-shirt-01',
      name: 'Classic Linen Shirt',
      unitsSold: 342,
      revenue: 854658,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&fit=crop'
    },
    {
      id: 'women-tee-01',
      name: 'Essential Cotton Tee',
      unitsSold: 289,
      revenue: 288711,
      image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db8?q=80&w=800&fit=crop'
    },
    {
      id: 'men-jeans-01',
      name: 'Everyday Straight Fit Jeans',
      unitsSold: 215,
      revenue: 644785,
      image: 'https://images.unsplash.com/photo-1542272604-780c8d52a5ce?q=80&w=800&fit=crop'
    },
    {
      id: 'women-hoodie-01',
      name: 'Oversized Premium Hoodie',
      unitsSold: 187,
      revenue: 747813,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&fit=crop'
    },
    {
      id: 'kids-tee-01',
      name: 'Kids Play Tee',
      unitsSold: 156,
      revenue: 116844,
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&fit=crop'
    }
  ],
  
  recentActivity: [
    { id: 1, type: 'order', message: 'New order #ORD-928X4H placed', time: '5 min ago' },
    { id: 2, type: 'alert', message: "Product 'Everyday Straight Fit Jeans' is low on stock", time: '32 min ago' },
    { id: 3, type: 'customer', message: 'New customer account created: Jane Doe', time: '1 hour ago' },
    { id: 4, type: 'order', message: 'Order #ORD-774M2P has been shipped', time: '2 hours ago' },
    { id: 5, type: 'alert', message: 'Payment failed for order #ORD-381F9Y', time: '3 hours ago' }
  ]
}
