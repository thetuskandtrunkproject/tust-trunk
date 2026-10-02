import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'

interface WishlistContextType {
  wishlistIds: string[]
  toggleWishlist: (productId: string) => Promise<void>
  isWishlisted: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  const fetchBackendWishlist = async () => {
    try {
      const res = await api.get('/api/v1/wishlist')
      // backend returns items: [{ product_id, created_at, product_name_snapshot }]
      const ids = res.data.items.map((i: any) => i.product_id).filter(Boolean)
      setWishlistIds(ids)
    } catch (err) {
      console.error("Failed to fetch wishlist", err)
    }
  }

  useEffect(() => {
    let mounted = true
    const initAuth = async () => {
      if (user) {
        if (wishlistIds.length > 0) {
          try {
            await api.post('/api/v1/wishlist/merge', {
              product_ids: wishlistIds
            })
          } catch (err) {
            console.error("Failed to merge wishlist", err)
          }
        }
        if (mounted) {
          await fetchBackendWishlist()
        }
      } else {
        setWishlistIds([])
      }
    }
    initAuth()
    
    return () => { mounted = false }
  }, [user])

  const toggleWishlist = async (productId: string) => {
    const adding = !wishlistIds.includes(productId)
    
    if (user) {
      try {
        if (adding) {
          await api.post(`/api/v1/wishlist/${productId}`)
        } else {
          await api.delete(`/api/v1/wishlist/${productId}`)
        }
        await fetchBackendWishlist()
      } catch (err) {
        console.error("Failed to toggle wishlist", err)
      }
    } else {
      setWishlistIds(prev => 
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      )
    }
  }

  const isWishlisted = (productId: string) => wishlistIds.includes(productId)

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider")
  return context
}
