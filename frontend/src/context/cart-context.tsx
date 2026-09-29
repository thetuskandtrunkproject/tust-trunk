import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'

export type CartItem = {
  variant_id: string
  quantity: number
  // Backend populated fields for logged-in users
  id?: string
  product?: {
    id: string
    name: string
    slug: string
    images: string[]
  }
  variant?: {
    id: string
    sku: string
    size: string
    price: number
    stock: number
    is_active: boolean
  }
  is_available?: boolean
  resolve_failed?: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  updateQuantity: (variant_id: string, quantity: number) => Promise<void>
  removeItem: (variant_id: string) => Promise<void>
  clearCart: () => Promise<void>
  cartCount: number
  serverSubtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [items, setItems] = useState<CartItem[]>([])
  const [serverSubtotal, setServerSubtotal] = useState(0)

  // Fetch cart from backend
  const fetchBackendCart = async () => {
    try {
      const res = await api.get('/api/v1/cart')
      // The backend response gives us full item info. We map it to our CartItem type.
      // Notice the backend cart item might return variant_id implicitly inside `variant.id`.
      const mapped = res.data.items.map((i: any) => ({
        ...i,
        variant_id: i.variant.id,
      }))
      setItems(mapped)
      setServerSubtotal(res.data.subtotal || 0)
    } catch (err) {
      console.error("Failed to fetch cart", err)
    }
  }

  // Handle capping logic
  const handleCapInfo = (cap_info?: any[]) => {
    if (cap_info && cap_info.length > 0) {
      for (const cap of cap_info) {
        showToast(`Quantity capped to ${cap.actual_quantity} due to stock limits.`)
      }
    }
  }

  // Merge and Sync on login
  useEffect(() => {
    let mounted = true
    const initAuth = async () => {
      if (user) {
        // Logged in: merge local cart if any, then fetch
        if (items.length > 0 && !items[0].product) {
          // If we have local guest items (no product info), merge them
          try {
            await api.post('/api/v1/cart/merge', {
              items: items.map(i => ({ variant_id: i.variant_id, quantity: i.quantity }))
            })
          } catch (err) {
            console.error("Failed to merge cart", err)
          }
        }
        if (mounted) {
          await fetchBackendCart()
        }
      } else {
        // Logged out: clear synced state, keep empty
        setItems([])
        setServerSubtotal(0)
      }
    }
    initAuth()
    
    return () => { mounted = false }
  }, [user]) // Re-run when user changes

  // Resolve guest cart items
  useEffect(() => {
    let mounted = true
    const resolveGuestCart = async () => {
      if (user) return // Logged-in cart is handled by fetchBackendCart
      
      const unresolvedIds = items
        .filter(i => !i.product && i.is_available !== false && !i.resolve_failed)
        .map(i => i.variant_id)
        
      if (unresolvedIds.length === 0) return
      
      try {
        const res = await api.get(`/api/v1/public/variants/resolve?ids=${unresolvedIds.join(',')}`)
        const resolvedData = res.data.items
        
        if (!mounted) return
        
        setItems(prev => prev.map(item => {
          if (item.product || item.is_available === false || item.resolve_failed) return item // Already processed
          
          const resolved = resolvedData.find((r: any) => r.variant.id === item.variant_id)
          if (resolved) {
            return {
              ...item,
              product: resolved.product,
              variant: resolved.variant,
              is_available: resolved.is_available
            }
          } else {
            // Missing from backend (deleted/inactive)
            return {
              ...item,
              is_available: false
            }
          }
        }))
      } catch (err) {
        console.error("Failed to resolve guest cart", err)
        if (mounted) {
          setItems(prev => prev.map(item => {
            if (unresolvedIds.includes(item.variant_id) && !item.product && item.is_available !== false) {
              return { ...item, resolve_failed: true }
            }
            return item
          }))
          showToast("Failed to load cart item details. Please refresh the page.")
        }
      }
    }
    
    resolveGuestCart()
    return () => { mounted = false }
  }, [items, user])

  const addItem = async (newItem: CartItem) => {
    if (user) {
      try {
        const res = await api.post('/api/v1/cart/items', {
          variant_id: newItem.variant_id,
          quantity: newItem.quantity
        })
        handleCapInfo(res.data.cap_info)
        await fetchBackendCart()
      } catch (err) {
        showToast("Failed to add item to cart")
        console.error(err)
      }
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.variant_id === newItem.variant_id)
        if (existing) {
          return prev.map(i => i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i)
        }
        return [...prev, newItem]
      })
    }
  }

  const updateQuantity = async (variant_id: string, quantity: number) => {
    if (user) {
      try {
        const res = await api.patch(`/api/v1/cart/items/${variant_id}`, { quantity })
        handleCapInfo(res.data.cap_info)
        await fetchBackendCart()
      } catch (err) {
        showToast("Failed to update quantity")
        console.error(err)
      }
    } else {
      setItems(prev => prev.map(item =>
        item.variant_id === variant_id
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const removeItem = async (variant_id: string) => {
    if (user) {
      try {
        const res = await api.delete(`/api/v1/cart/items/${variant_id}`)
        handleCapInfo(res.data.cap_info)
        await fetchBackendCart()
      } catch (err) {
        showToast("Failed to remove item")
        console.error(err)
      }
    } else {
      setItems(prev => prev.filter(item => item.variant_id !== variant_id))
    }
  }

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/api/v1/cart')
        await fetchBackendCart()
      } catch (err) {
        showToast("Failed to clear cart")
        console.error(err)
      }
    } else {
      setItems([])
    }
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, cartCount, serverSubtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
