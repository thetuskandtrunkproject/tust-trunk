import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) return null

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnails (Desktop: Side, Mobile: Hidden or bottom) */}
      <div className="hidden md:flex md:flex-col gap-4 overflow-y-auto max-h-[600px] hide-scrollbar w-20 lg:w-24 shrink-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              idx === activeIndex ? 'border-sunshine ring-2 ring-sunshine scale-105 shadow-sm' : 'border-transparent hover:border-ink/20'
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image Container */}
      <div className="relative w-full aspect-[3/4] md:max-h-[600px] rounded-2xl overflow-hidden bg-ink/5 flex-1 group">
        {/* Mobile Swipe Gallery */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory h-full hide-scrollbar scroll-smooth" onScroll={(e) => {
          const target = e.target as HTMLElement
          const index = Math.round(target.scrollLeft / target.clientWidth)
          setActiveIndex(index)
        }}>
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full shrink-0 snap-center">
              <img src={img} alt={`${productName} view ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Desktop Main Image */}
        <div className="hidden md:block w-full h-full overflow-hidden">
          <img 
            src={images[activeIndex]} 
            alt={productName} 
            className="w-full h-full object-cover object-center transition-all duration-500 hover:scale-105"
            key={images[activeIndex]} // Forces re-render for transition if needed, though simple replacement is fine
          />
        </div>
        
        {/* Mobile Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-coral w-6' : 'bg-ink/20'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
