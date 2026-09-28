import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface WishlistContextType {
  wishlistIds: string[]
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  const toggleWishlist = (productId: string) => {
    setWishlistIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
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
