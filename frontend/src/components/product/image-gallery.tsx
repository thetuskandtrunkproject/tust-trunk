import { useState, useRef, useCallback } from 'react'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }, [])

  const handleMouseEnter = useCallback(() => setIsZooming(true), [])
  const handleMouseLeave = useCallback(() => setIsZooming(false), [])

  if (!images || images.length === 0) return null

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnails */}
      <div className="hidden md:flex md:flex-col gap-3 overflow-y-auto max-h-[700px] hide-scrollbar w-20 lg:w-[88px] shrink-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              idx === activeIndex 
                ? 'border-ink ring-1 ring-ink/20 shadow-md scale-105' 
                : 'border-transparent opacity-60 hover:opacity-100 hover:border-ink/20'
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image Container */}
      <div className="relative w-full aspect-[4/5] md:max-h-[700px] rounded-2xl overflow-hidden bg-white flex-1">
        {/* Mobile Swipe Gallery */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory h-full hide-scrollbar scroll-smooth" onScroll={(e) => {
          const target = e.target as HTMLElement
          const index = Math.round(target.scrollLeft / target.clientWidth)
          setActiveIndex(index)
        }}>
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full shrink-0 snap-center">
              <img src={img} alt={`${productName} view ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Desktop Main Image with Zoom */}
        <div 
          ref={imageRef}
          className="hidden md:block w-full h-full overflow-hidden cursor-crosshair relative"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img 
            src={images[activeIndex]} 
            alt={productName} 
            className="w-full h-full object-cover object-center transition-opacity duration-500"
            style={{
              opacity: isZooming ? 0 : 1,
            }}
            key={`normal-${images[activeIndex]}`}
          />
          {/* Zoomed version */}
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              opacity: isZooming ? 1 : 0,
              backgroundImage: `url(${images[activeIndex]})`,
              backgroundSize: '250%',
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Zoom indicator hint */}
          {!isZooming && (
            <div className="absolute bottom-4 right-4 bg-ink/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
              Hover to zoom
            </div>
          )}
        </div>
        
        {/* Mobile Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-ink w-6' : 'bg-ink/20'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

