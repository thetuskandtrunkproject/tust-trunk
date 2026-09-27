import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/context/wishlist-context'

interface ProductCardProps {
  id: string
  slug: string
  name: string
  price: string
  img: string
  hoverImg?: string
  category?: string
  tags?: string[]
  sizes?: string[]
  actionButton?: React.ReactNode
}

export function ProductCard({ id, slug, name, price, img, hoverImg, category, tags = [], sizes = ['S', 'M', 'L', 'XL'], actionButton }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(id)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(id)
  }

  const getTagColor = (tag: string) => {
    const t = tag.toLowerCase()
    if (t === 'bestseller') return 'bg-coral text-white'
    if (t === 'sale') return 'bg-watermelon text-white'
    if (t === 'new') return 'bg-sky-soft text-ink'
    return 'bg-ink text-white'
  }

  return (
    <Link to="/products/$slug" params={{ slug }} className="group block w-full relative snap-start">
      {/* Card Container */}
      <div className="relative w-full bg-cloud rounded-xl overflow-hidden border border-ink/5 mb-3">
        {/* Image Crossfade */}
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <img 
            src={img} 
            alt={name} 
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-in-out ${hoverImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`}
          />
          {hoverImg && (
            <img 
              src={hoverImg} 
              alt={name} 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
            />
          )}
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {tags.map(tag => (
                <div key={tag} className={`${getTagColor(tag)} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm inline-block w-max`}>
                  {tag}
                </div>
              ))}
            </div>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 hover:scale-110 ${
              wishlisted 
                ? 'bg-watermelon text-white opacity-100' 
                : 'bg-white/80 text-ink opacity-0 group-hover:opacity-100 shadow-sm'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white text-white' : ''}`} />
          </button>

          {/* Action Button (e.g. Quick Add / Move to Cart) */}
          {actionButton && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              {actionButton}
            </div>
          )}
        </div>

        {/* Size Chips Row */}
        <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-ink/5">
          {sizes.map(size => (
            <span key={size} className="text-[9px] text-ink/60 font-bold border border-ink/15 rounded px-1.5 py-0.5 transition-colors hover:border-ink hover:bg-ink hover:text-white">
              {size}
            </span>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1">
        <h3 className="font-sans font-bold text-sm text-ink line-clamp-1">{name}</h3>
        <p className="font-sans font-bold text-sm text-ink mt-0.5">{price}</p>
      </div>
    </Link>
  )
}
