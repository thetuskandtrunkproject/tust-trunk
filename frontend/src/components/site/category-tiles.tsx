import { Link } from '@tanstack/react-router'
import { mockProducts } from '@/lib/mock-products'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function CategoryTiles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgFillRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])
  const textRef = useRef<HTMLHeadingElement>(null)

  // Get 4 featured products for the cards
  const featuredProducts = mockProducts.filter(p => p.id.startsWith('k')).slice(0, 4)

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  const textFillRef = useRef<HTMLHeadingElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)

  useGSAP(() => {
    // The timeline is tied directly to the scrollbar using scrub.
    // If the user stops scrolling, the animation pauses.
    // scrub: 1 adds a 1-second smoothing effect so it's not strictly rigid but follows the scroll in real-time.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
        end: 'center 40%', // Animation finishes when center of section hits 40% down the screen
        scrub: 1, 
      }
    });

    // 1. Professional Background Fill (Sleek solid color sweeping from left)
    tl.fromTo(bgFillRef.current, 
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', transformOrigin: 'left' },
      0 // Start at the very beginning of the scroll trigger
    )

    // 2. Text Color Fill Animation (Gradient sweeping from left to match background)
    tl.fromTo(textFillRef.current, 
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', ease: 'none' },
      0 // Start at the same time as the background
    )

    // 3. Subtext Fade In
    tl.fromTo(subtextRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, ease: 'power2.out' },
      0.1 
    )

    // 4. Product Cards Slide Up (Staggered)
    tl.fromTo(cardsRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, ease: 'power2.out' },
      0.2
    )

  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="w-full py-24 md:py-40 relative overflow-hidden bg-cloud">
      {/* Animated Background Fill Layer (Professional Light Mint Tint) */}
      <div 
        ref={bgFillRef}
        className="absolute inset-0 bg-[#E8F3F1] z-0"
        style={{ transformOrigin: 'left', transform: 'scaleX(0)' }}
      ></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Heading */}
        <div className="text-center mb-24 max-w-4xl mx-auto flex flex-col items-center">
          <div className="relative inline-block">
            {/* Background text (faint grey outline base) */}
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-ink/10 select-none">
              Playful & Breathable
            </h2>
            {/* Foreground text (vibrant gradient fill) */}
            <h2 
              ref={textFillRef}
              className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-coral via-sunshine to-sky absolute inset-0 z-10 select-none"
              style={{ clipPath: 'inset(0 100% 0 0)' }}
            >
              Playful & Breathable
            </h2>
          </div>
          <p ref={subtextRef} className="text-ink/70 font-medium text-xl mt-8 max-w-2xl mx-auto">
            Made with skin-friendly fabrics, perfect for India's climate. Explore our vibrant new arrivals designed for everyday adventures.
          </p>
        </div>

        {/* 4-Product Grid with Professional Hover Overlays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, idx) => {
            // Give each card a unique brand color gradient overlay for the hover state
            const gradientColors = [
              'from-sky/95 via-sky/40 to-transparent',
              'from-sunshine/95 via-sunshine/40 to-transparent',
              'from-coral/95 via-coral/40 to-transparent',
              'from-mint/95 via-mint/40 to-transparent'
            ];
            const hoverGradient = gradientColors[idx % gradientColors.length];

            return (
            <Link 
              key={product.id}
              ref={el => { cardsRef.current[idx] = el }}
              to={`/products/${product.slug}`} 
              className="group block relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:shadow-2xl will-change-transform opacity-0"
            >
              {/* Image */}
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Colorful Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-t ${hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 lg:p-8`}>
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <h3 className="font-bold text-xl text-ink mb-3 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-ink/90 font-bold text-lg">{formatPrice(product.price)}</span>
                    <span className="bg-ink text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform">
                      Shop Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Default Price Tag (Hides on Hover) */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-ink font-bold px-4 py-2 rounded-full text-sm shadow-sm opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                {formatPrice(product.price)}
              </div>
            </Link>
          )})}
        </div>
        
        <div className="mt-24 text-center">
           <Link to="/shop" className="inline-flex items-center gap-3 bg-ink text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:scale-105 hover:bg-sky transition-all duration-300">
             View Complete Collection <span className="text-xl">&rarr;</span>
           </Link>
        </div>

      </div>
    </section>
  )
}
