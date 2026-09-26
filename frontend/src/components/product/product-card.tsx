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
  sizes?: string[]
  actionButton?: React.ReactNode
}

export function ProductCard({ id, slug, name, price, img, category, tags = [], sizes = ['2-3Y', '4-5Y', '6-7Y'], actionButton }: ProductCardProps) {
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

        {/* Available Sizes Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-2 z-20">
          {sizes.map(size => (
            <span key={size} className="bg-white/90 backdrop-blur-sm text-ink text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              {size}
            </span>
          ))}
        </div>

        {/* Action Button (e.g. Quick Add / Move to Cart) */}
        {actionButton && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
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
      
      <div className="space-y-1.5 px-2">
        <h3 className="font-heading font-bold text-lg text-ink group-hover:text-coral transition-colors line-clamp-1">{name}</h3>
        {category && <p className="text-[10px] text-sky font-bold uppercase tracking-widest">{category} Collection</p>}
        <p className="text-coral font-bold text-lg">{price}</p>
      </div>
    </Link>
  )
}
