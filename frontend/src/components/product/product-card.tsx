import { Link } from '@tanstack/react-router'
import { Heart, Plus } from 'lucide-react'
import { useWishlist } from '@/context/wishlist-context'

interface ProductCardProps {
  id: string
  slug: string
  name: string
  price: string | number
  originalPrice?: string | number
  discountPercent?: number
  img: string
  hoverImg?: string
  category?: string
  tags?: string[]
  sizes?: string[]
  actionButton?: React.ReactNode
  eagerLoad?: boolean
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  discountPercent,
  img,
  hoverImg,
  category,
  tags = [],
  sizes = ['6-12M', '1-2Y', '2-3Y', '3-4Y'],
  actionButton,
  eagerLoad
}: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(id)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(id)
  }

  // Helper to parse numerical price
  const parseNum = (val: string | number | undefined): number => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'number') return val
    const cleaned = String(val).replace(/[^0-9.]/g, '')
    const n = parseFloat(cleaned)
    return isNaN(n) ? 0 : n
  }

  const currentPriceNum = parseNum(price)
  const originalPriceNum = parseNum(originalPrice)

  // Calculate discount percentage if original price > current price
  let computedPercent = discountPercent
  if (!computedPercent && originalPriceNum > currentPriceNum && currentPriceNum > 0) {
    computedPercent = Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100)
  }

  const hasDiscount = originalPriceNum > currentPriceNum && currentPriceNum > 0

  const formatDisplayPrice = (val: string | number) => {
    if (typeof val === 'number') {
      return `Rs. ${val.toLocaleString('en-IN')}`
    }
    const str = String(val).trim()
    if (str.startsWith('Rs.') || str.startsWith('₹')) return str
    const num = parseNum(str)
    return num > 0 ? `Rs. ${num.toLocaleString('en-IN')}` : str
  }

  const getTagStyle = (tag: string): { bg: string; text: string; label: string } => {
    const t = tag.toLowerCase()
    if (t === 'bestseller') return { bg: '#FFD166', text: '#5C4000', label: 'Bestseller' }
    if (t === 'sale') return { bg: '#FF6B8B', text: '#FFFFFF', label: 'Sale' }
    if (t === 'new') return { bg: '#70A6FF', text: '#FFFFFF', label: 'New' }
    return { bg: '#FAF7F9', text: '#2D283E', label: tag }
  }

  return (
    <Link to="/products/$slug" params={{ slug }} className="group block w-full relative outline-none">
      {/* Playful Kids Unified Product Card Container */}
      <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-sm transition-all duration-300 mb-2 border border-pink-50">
        
        {/* Square Aspect Ratio Image Frame (shorter) */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#FAF7F9]">
          <img 
            src={img} 
            alt={name} 
            loading={eagerLoad ? undefined : "lazy"}
            className={`w-full h-full object-cover object-top transition-all duration-700 ease-out ${
              hoverImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
            }`}
          />
          {hoverImg && (
            <img 
              src={hoverImg} 
              alt={name} 
              loading={eagerLoad ? undefined : "lazy"}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          )}

          {/* Badges / Discount % Pill */}
          <div className="absolute top-2 left-0 flex flex-col gap-1.5 z-10">
            {computedPercent && computedPercent > 0 && (
              <div className="bg-[#FF5A79] text-white text-[11px] font-sans font-bold tracking-wider px-2.5 py-0.5 rounded-r-xl shadow-sm transform -rotate-1 origin-left border-y border-r border-white/30">
                {computedPercent}% OFF
              </div>
            )}
            {tags.map(tag => {
              if (tag.toLowerCase() === 'sale' && computedPercent && computedPercent > 0) return null
              const style = getTagStyle(tag)
              return (
                <div 
                  key={tag} 
                  className="text-[10px] font-sans font-bold tracking-wider px-2.5 py-0.5 rounded-r-xl shadow-sm transform -rotate-1 origin-left border-y border-r border-white/30"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {style.label}
                </div>
              )
            })}
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlist}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 shadow-sm border ${
              wishlisted 
                ? 'bg-[#FF5A79] text-white border-[#FF5A79]' 
                : 'bg-white/90 text-[#6B4C9A] border-transparent hover:bg-[#FF5A79] hover:text-white backdrop-blur-md'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          {actionButton && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              {actionButton}
            </div>
          )}
        </div>

        {/* Unified Product Information inside the card */}
        <div className="p-3 flex flex-col gap-1 relative bg-white z-20">
          
          <h3 className="font-sans font-semibold text-[13px] md:text-sm text-[#4A3B69] line-clamp-2 group-hover:text-[#FF5A79] transition-colors duration-200 leading-snug">
            {name}
          </h3>

          {/* Dynamic Offer & Strikeout Price Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans font-bold text-[15px] md:text-base text-[#FF5A79] tracking-tight">
              {formatDisplayPrice(price)}
            </span>

            {hasDiscount && (
              <span className="font-sans font-medium text-[12px] text-[#A78BFA] line-through decoration-[#FF5A79]/50">
                {formatDisplayPrice(originalPrice!)}
              </span>
            )}
          </div>

          {/* Size Chips Section inline in card */}
          {sizes && sizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1 pt-2 border-t border-[#FCE7F3] border-dashed">
              {sizes.slice(0, 4).map(size => (
                <span 
                  key={size} 
                  className="text-[9px] md:text-[10px] font-sans font-semibold text-[#6B4C9A] bg-[#FDF4FF] border border-[#FCE7F3] rounded-md px-1.5 py-0.5 hover:bg-[#FCE7F3] hover:text-[#9D174D] transition-colors cursor-pointer"
                >
                  {size}
                </span>
              ))}
              {sizes.length > 4 && (
                <span className="text-[9px] md:text-[10px] font-sans font-semibold text-[#6B4C9A] bg-[#FDF4FF] border border-[#FCE7F3] rounded-md px-1.5 py-0.5">
                  +{sizes.length - 4}
                </span>
              )}
            </div>
          )}

        </div>
      </div>
    </Link>
  )
}
