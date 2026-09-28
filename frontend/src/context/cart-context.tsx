import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type CartItem = {
  productId: string
  size: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  removeItem: (productId: string, size: string) => void
  clearCart: () => void
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === newItem.productId && i.size === newItem.size)
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i)
      }
      return [...prev, newItem]
    })
  }

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.productId === productId && item.size === size
        ? { ...item, quantity }
        : item
    ))
  }

  const removeItem = (productId: string, size: string) => {
    setItems(prev => prev.filter(item => 
      !(item.productId === productId && item.size === size)
    ))
  }

  const clearCart = () => {
    setItems([])
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
