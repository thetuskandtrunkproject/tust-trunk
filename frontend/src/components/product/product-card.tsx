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
    if (t === 'bestseller') return { bg: '#FFD166', text: '#5C4000', label: '🔥 Bestseller' }
    if (t === 'sale') return { bg: '#FF6B8B', text: '#FFFFFF', label: 'Sale' }
    if (t === 'new') return { bg: '#70A6FF', text: '#FFFFFF', label: '✨ New' }
    return { bg: '#FAF7F9', text: '#2D283E', label: tag }
  }

  return (
    <Link to="/products/$slug" params={{ slug }} className="group block w-full relative">
      {/* Playful Kids Product Card Container */}
      <div className="relative w-full bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-[0_4px_20px_rgba(255,107,139,0.06)] hover:shadow-[0_12px_32px_rgba(255,107,139,0.16)] hover:-translate-y-1 transition-all duration-300 mb-2.5">
        
        {/* 4:5 Aspect Ratio Image Frame */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#FAF7F9]">
          <img 
            src={img} 
            alt={name} 
            loading={eagerLoad ? undefined : "lazy"}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              hoverImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
            }`}
          />
          {hoverImg && (
            <img 
              src={hoverImg} 
              alt={name} 
              loading={eagerLoad ? undefined : "lazy"}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          )}

          {/* Badges / Discount % Pill */}
          <div className="absolute top-3 left-0 flex flex-col gap-1.5 z-10">
            {computedPercent && computedPercent > 0 && (
              <div className="bg-coral text-white text-[11px] font-black tracking-wide pl-3 pr-3 py-1 rounded-r-full shadow-md animate-pulse">
                {computedPercent}% OFF
              </div>
            )}
            {tags.map(tag => {
              if (tag.toLowerCase() === 'sale' && computedPercent && computedPercent > 0) return null
              const style = getTagStyle(tag)
              return (
                <div 
                  key={tag} 
                  className="text-[10px] font-black tracking-wide pl-3 pr-3 py-1 rounded-r-full shadow-sm"
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
            className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 z-10 hover:scale-110 shadow-md ${
              wishlisted 
                ? 'bg-coral text-white opacity-100' 
                : 'bg-white/90 text-ink/70 opacity-90 group-hover:opacity-100 hover:bg-coral hover:text-white backdrop-blur-md'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current text-white' : ''}`} />
          </button>

          {/* Quick Select Size Hover Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
            <div className="flex items-center justify-between bg-gradient-to-r from-coral via-[#FF5A79] to-cta text-white rounded-full pl-4 pr-1.5 py-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-transform">
              <span className="text-xs font-black tracking-wider uppercase font-['Nunito',sans-serif]">Select Size</span>
              <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>

          {actionButton && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              {actionButton}
            </div>
          )}
        </div>

        {/* Size Chips Section */}
        {sizes && sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-pink-100/60 bg-[#FAF7F9]/60">
            {sizes.map(size => (
              <span 
                key={size} 
                className="text-[10px] md:text-[11px] font-black text-ink/75 bg-white border border-pink-200/70 rounded-md px-2 py-0.5 shadow-2xs hover:border-coral hover:text-coral transition-all cursor-pointer"
              >
                {size}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Product Information */}
      <div className="px-2 pt-0.5">
        <h3 className="font-['Nunito',sans-serif] font-black text-xs md:text-sm text-ink line-clamp-1 group-hover:text-coral transition-colors duration-200 mb-1">
          {name}
        </h3>

        {/* Dynamic Offer & Strikeout Price Row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-['Baloo_2',sans-serif] font-black text-sm md:text-base text-coral tracking-tight">
            {formatDisplayPrice(price)}
          </span>

          {hasDiscount && (
            <span className="font-['Nunito',sans-serif] font-bold text-xs text-ink/40 line-through">
              {formatDisplayPrice(originalPrice!)}
            </span>
          )}

          {computedPercent && computedPercent > 0 && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full">
              {computedPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
