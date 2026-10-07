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
            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} loading="lazy" className="w-full h-full object-cover object-top" />
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
              <img src={img} alt={`${productName} view ${idx + 1}`} loading="lazy" className="w-full h-full object-cover object-top" />
            </div>
          ))}
        </div>

        {/* Desktop Main Image */}
        <div className="hidden md:block w-full h-full overflow-hidden relative">
          <img 
            src={images[activeIndex]} 
            alt={productName} 
            className="w-full h-full object-cover object-top transition-opacity duration-500"
            key={`normal-${images[activeIndex]}`}
          />
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

