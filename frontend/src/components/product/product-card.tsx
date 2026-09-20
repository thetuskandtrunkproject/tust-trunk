import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/context/wishlist-context'

interface ProductCardProps {
  id: string
  slug: string
  name: string
  price: string
  img: string
  category?: string
  tags?: string[]
  actionButton?: React.ReactNode
}

export function ProductCard({ id, slug, name, price, img, category, tags = [], actionButton }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(id)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(id)
  }

  const getBadgeColor = (tag: string) => {
    if (tag.toLowerCase() === 'bestseller') return 'bg-coral text-white'
    return 'bg-sunshine text-ink'
  }

  return (
    <Link to="/products/$slug" params={{ slug }} className="group block w-full relative snap-start transition-all duration-300 hover:-translate-y-2">
      <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 bg-cloud border border-ink/5 group-hover:shadow-xl transition-shadow">
        <img 
          src={img} 
          alt={name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        {tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {tags.map(tag => (
              <span key={tag} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${getBadgeColor(tag)} shadow-sm`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button (e.g. Quick Add / Move to Cart) */}
        {actionButton && (
          <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            {actionButton}
          </div>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-3 rounded-full backdrop-blur-sm transition-all z-10 hover:scale-110 ${
            wishlisted 
              ? 'bg-watermelon text-white opacity-100' 
              : 'bg-white/90 text-ink opacity-100 lg:opacity-0 group-hover:opacity-100 hover:bg-white shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white text-white' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-medium text-ink group-hover:text-sky transition-colors">{name}</h3>
        {category && <p className="text-xs text-ink/60 uppercase tracking-wider">{category} Collection</p>}
        <p className="text-ink/80">{price}</p>
      </div>
    </Link>
  )
}
