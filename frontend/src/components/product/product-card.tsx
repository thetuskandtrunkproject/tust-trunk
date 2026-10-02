import { Link } from '@tanstack/react-router'
import { Heart, Plus } from 'lucide-react'
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

  const getTagStyle = (tag: string): { bg: string; text: string; accent: string } => {
    const t = tag.toLowerCase()
    if (t === 'bestseller') return { bg: '#FFF3CD', text: '#856404', accent: '#FFD93D' }
    if (t === 'sale') return { bg: '#FFE8EC', text: '#CC2936', accent: '#FF6B6B' }
    if (t === 'new') return { bg: '#E8F4FD', text: '#1565C0', accent: '#7EC8E3' }
    return { bg: '#F0F0F0', text: '#333', accent: '#666' }
  }

  return (
    <Link to="/products/$slug" params={{ slug }} className="group block w-full relative">
      {/* Card Container */}
      <div className="relative w-full bg-white rounded-2xl overflow-hidden border border-ink/6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-500 mb-3">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#FAFAFA]">
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
          
          {/* Tags — ribbon style */}
          {tags.length > 0 && (
            <div className="absolute top-3 left-0 flex flex-col gap-1.5 z-10">
              {tags.map(tag => {
                const style = getTagStyle(tag)
                return (
                  <div 
                    key={tag} 
                    className="text-[10px] font-extrabold uppercase tracking-wider pl-3 pr-3 py-1 rounded-r-full shadow-sm"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {tag}
                  </div>
                )
              })}
            </div>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10 hover:scale-110 ${
              wishlisted 
                ? 'bg-coral text-white opacity-100 shadow-md' 
                : 'bg-white/90 text-ink/40 opacity-0 group-hover:opacity-100 shadow-md backdrop-blur-sm hover:text-coral'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Add Floating Button — appears on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
            <div className="flex items-center justify-between bg-gradient-to-r from-coral to-[#FF8FA3] text-white rounded-full pl-4 pr-1.5 py-1.5 shadow-lg">
              <span className="text-xs font-bold tracking-wide">Select Size</span>
              <div className="w-7 h-7 bg-white/25 rounded-full flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Action Button (e.g. Quick Add / Move to Cart) */}
          {actionButton && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              {actionButton}
            </div>
          )}
        </div>

        {/* Size Chips Row */}
        <div className="flex flex-wrap gap-1.5 px-3 py-2.5">
          {sizes.map(size => (
            <span 
              key={size} 
              className="text-[10px] text-ink/70 font-bold border border-ink/12 rounded-md px-2 py-1 bg-white transition-colors hover:border-ink/40 hover:text-ink"
            >
              {size}
            </span>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1">
        <h3 className="font-sans font-semibold text-[13px] text-ink line-clamp-1 leading-snug">{name}</h3>
        <p className="font-sans font-bold text-[14px] text-ink mt-1">{price}</p>
      </div>
    </Link>
  )
}
