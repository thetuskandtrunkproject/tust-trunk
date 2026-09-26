import { Link } from '@tanstack/react-router'
import { mockProducts } from '@/lib/mock-products'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function CategoryTiles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveWrapRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([])
  const subtextRef = useRef<HTMLParagraphElement>(null)

  // Get 4 featured products for the cards
  const featuredProducts = mockProducts.filter(p => p.id.startsWith('k')).slice(0, 4)

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  // Split heading into individual words for GSAP text animation
  const headingWords = ['Playful', '&', 'Breathable']

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'center 35%',
        scrub: 1,
      }
    });

    // 1. WAVE BACKGROUND — Slide the wave container from left to right
    gsap.set(waveWrapRef.current, { xPercent: -110 })
    tl.to(waveWrapRef.current,
      { xPercent: 0, ease: 'none', duration: 1 },
      0
    )

    // 2. GSAP TEXT ANIMATION — Each word pops up individually with stagger
    wordsRef.current.forEach((word, i) => {
      if (!word) return
      tl.fromTo(word,
        { y: 80, opacity: 0, rotateX: 45, scale: 0.8 },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0, 
          scale: 1, 
          duration: 0.3, 
          ease: 'back.out(1.7)' 
        },
        0.15 + i * 0.12 // Staggered start — each word comes slightly after the previous
      )
    })

    // 3. Subtext slides up and fades in
    tl.fromTo(subtextRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      0.5
    )

    // 4. Product Cards fly up with stagger
    tl.fromTo(cardsRef.current,
      { y: 120, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.4, ease: 'power3.out' },
      0.55
    )

  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="w-full py-24 md:py-40 relative overflow-hidden bg-cloud">
      
      {/* WAVE BACKGROUND — A warm coral-peach wave that sweeps across */}
      <div 
        ref={waveWrapRef}
        className="absolute inset-0 z-0 will-change-transform"
      >
        {/* Main wave body */}
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #FFECD2 0%, #FCB69F 50%, #FF9A9E 100%)' }}
        ></div>

        {/* Wavy right edge — created with an SVG wave shape */}
        <svg 
          className="absolute top-0 -right-px h-full w-24 md:w-40"
          viewBox="0 0 100 800" 
          preserveAspectRatio="none"
          fill="none"
        >
          <path 
            d="M0,0 L0,800 L100,800 C60,700 90,600 50,500 C10,400 80,300 40,200 C0,100 70,50 100,0 Z" 
            fill="#FF9A9E"
          />
        </svg>

        {/* Second wave layer (slightly transparent, offset) for depth */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            background: 'linear-gradient(180deg, #a18cd1 0%, #fbc2eb 100%)',
            clipPath: 'polygon(0 0, 85% 0, 95% 25%, 80% 50%, 95% 75%, 85% 100%, 0 100%)',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* GSAP Animated Heading — Each word animates individually */}
        <div className="text-center mb-24 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight leading-[1.1] flex flex-wrap justify-center gap-x-5 md:gap-x-8" style={{ perspective: '600px' }}>
            {headingWords.map((word, i) => (
              <span
                key={i}
                ref={el => { wordsRef.current[i] = el }}
                className="inline-block opacity-0 text-white drop-shadow-xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {word}
              </span>
            ))}
          </h2>
          <p ref={subtextRef} className="text-white/80 font-medium text-xl mt-8 max-w-2xl mx-auto opacity-0 drop-shadow-md">
            Made with skin-friendly fabrics, perfect for India's climate. Explore our vibrant new arrivals designed for everyday adventures.
          </p>
        </div>

        {/* 4-Product Grid with Professional Hover Overlays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, idx) => {
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
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out text-center">
                  <h3 className="font-heading font-bold text-3xl text-ink mb-2 capitalize">{product.category}</h3>
                  <span className="inline-block bg-ink text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg mt-2">
                    Explore
                  </span>
                </div>
              </div>
            </Link>
          )})}
        </div>
        
        <div className="mt-24 text-center">
           <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-ink px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300">
             View Complete Collection <span className="text-xl">&rarr;</span>
           </Link>
        </div>

      </div>
    </section>
  )
}
