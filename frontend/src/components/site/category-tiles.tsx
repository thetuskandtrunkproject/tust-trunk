import { Link } from '@tanstack/react-router'
import { useRef, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function CategoryTiles({ initialData }: { initialData?: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])
  
  const [featuredProducts, setFeaturedProducts] = useState<any[]>(initialData || [])

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setFeaturedProducts(initialData)
      return
    }
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/public/products', { params: { page_size: 4 } })
        setFeaturedProducts(res.data.items || [])
      } catch (err) {
        console.error("Failed to load featured products", err)
      }
    }
    fetchFeatured()
  }, [initialData])

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

    // 1. WAVE BACKGROUND — GSAP animation removed in favor of continuous CSS waves
    // 2. GSAP TEXT ANIMATION — Each word pops up individually with stagger
    headingWords.forEach((_, i) => {
      tl.fromTo(`.animated-word-${i}`,
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
    tl.fromTo('.animated-subtext',
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

  // GSAP Scroll Animation for Background Color
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Create a timeline linked to the scroll of this section
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom', // Start when section enters screen
          end: 'bottom center', // End when section is mostly scrolled past
          scrub: true,
        }
      })
      // Animate the Forest Green layers with an organic curved sweep from the left edge!
      .to('.sweep-green', {
        clipPath: 'circle(150% at 0% 50%)', // Expands to cover the whole screen
        WebkitClipPath: 'circle(150% at 0% 50%)',
        ease: 'none',
      }, 0)
    })
    return () => mm.revert()
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="w-full py-24 md:py-40 relative bg-cloud">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* PEACH BASE LAYER */}
        <div className="absolute inset-0">
          {/* Peach Background */}
          <div className="absolute inset-0" style={{ backgroundColor: '#FFF0ED' }}></div>
          {/* Peach Wave */}
          <div className="absolute top-0 left-0 w-full -mt-[8vw] h-[8vw]">
            <div className="absolute inset-0 animate-wave-bg"></div>
          </div>
        </div>

        {/* GREEN SWEEPING LAYER */}
        <div className="sweep-green absolute inset-0" style={{ clipPath: 'circle(0% at 0% 50%)', WebkitClipPath: 'circle(0% at 0% 50%)' }}>
          {/* Green Background */}
          <div className="absolute inset-0" style={{ backgroundColor: '#1B4332' }}></div>
          {/* Green Wave */}
          <div className="absolute top-0 left-0 w-full -mt-[8vw] h-[8vw]">
            <div className="absolute inset-0 animate-wave-bg-green"></div>
          </div>
        </div>

        <style>{`
          @keyframes wave-bg-move {
            0% { mask-position-x: 0; -webkit-mask-position-x: 0; }
            100% { mask-position-x: -1440px; -webkit-mask-position-x: -1440px; }
          }
          .animate-wave-bg {
            -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="black" d="M 0,160 C 180,0 540,320 720,160 C 900,0 1260,320 1440,160 L 1440,320 L 0,320 Z"></path></svg>');
            mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="black" d="M 0,160 C 180,0 540,320 720,160 C 900,0 1260,320 1440,160 L 1440,320 L 0,320 Z"></path></svg>');
            -webkit-mask-size: 1440px 100%;
            mask-size: 1440px 100%;
            -webkit-mask-repeat: repeat-x;
            mask-repeat: repeat-x;
            background-color: #FFF0ED; /* Base Peach */
            animation: wave-bg-move 15s linear infinite;
            transform: translateZ(0); 
          }
          .animate-wave-bg-green {
            -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="black" d="M 0,160 C 180,0 540,320 720,160 C 900,0 1260,320 1440,160 L 1440,320 L 0,320 Z"></path></svg>');
            mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="black" d="M 0,160 C 180,0 540,320 720,160 C 900,0 1260,320 1440,160 L 1440,320 L 0,320 Z"></path></svg>');
            -webkit-mask-size: 1440px 100%;
            mask-size: 1440px 100%;
            -webkit-mask-repeat: repeat-x;
            mask-repeat: repeat-x;
            background-color: #1B4332; /* Sweeping Green */
            animation: wave-bg-move 15s linear infinite;
            transform: translateZ(0); 
          }
          @media (min-width: 1440px) {
            @keyframes wave-bg-move-large {
              0% { mask-position-x: 0; -webkit-mask-position-x: 0; }
              100% { mask-position-x: -100vw; -webkit-mask-position-x: -100vw; }
            }
            .animate-wave-bg, .animate-wave-bg-green {
              -webkit-mask-size: 100vw 100%;
              mask-size: 100vw 100%;
              animation: wave-bg-move-large 15s linear infinite;
            }
          }
        `}</style>
        
        <style>{`
          @keyframes wave-move {
            0% { transform: translateX(0) translateZ(0); }
            100% { transform: translateX(-50%) translateZ(0); }
          }
          .animate-wave-slow { animation: wave-move 20s linear infinite; }
          .animate-wave-medium { animation: wave-move 15s linear infinite reverse; }
          .animate-wave-fast { animation: wave-move 10s linear infinite; }
        `}</style>

        {/* ABSTRACT WARM WAVES CONTAINER (overflow-hidden to prevent horizontal scroll) */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Abstract Warm Wave 1 */}
          <div className="absolute -bottom-10 left-0 w-[200%] h-[200px] md:h-[400px] animate-wave-slow opacity-[0.15] flex">
            <svg className="w-full h-full flex-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#FF8A65" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L0,320Z"></path>
            </svg>
            <svg className="w-full h-full flex-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#FF8A65" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L0,320Z"></path>
            </svg>
          </div>

          {/* Abstract Warm Wave 2 */}
          <div className="absolute -bottom-5 left-0 w-[200%] h-[150px] md:h-[300px] animate-wave-medium opacity-[0.12] flex">
            <svg className="w-full h-full flex-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#FF6B6B" d="M0,160L48,181.3C96,203,192,245,288,240C384,235,480,181,576,170.7C672,160,768,192,864,197.3C960,203,1056,181,1152,160C1248,139,1344,117,1392,106.7L1440,96L1440,320L0,320Z"></path>
            </svg>
            <svg className="w-full h-full flex-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#FF6B6B" d="M0,160L48,181.3C96,203,192,245,288,240C384,235,480,181,576,170.7C672,160,768,192,864,197.3C960,203,1056,181,1152,160C1248,139,1344,117,1392,106.7L1440,96L1440,320L0,320Z"></path>
            </svg>
          </div>

          {/* Abstract Warm Wave 3 */}
          <div className="absolute bottom-0 left-0 w-[200%] h-[100px] md:h-[200px] animate-wave-fast opacity-[0.1] flex">
            <svg className="w-full h-full flex-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#FCD34D" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,245.3C840,267,960,277,1080,250.7C1200,224,1320,160,1380,128L1440,96L1440,320L0,320Z"></path>
            </svg>
            <svg className="w-full h-full flex-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#FCD34D" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,245.3C840,267,960,277,1080,250.7C1200,224,1320,160,1380,128L1440,96L1440,320L0,320Z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* SWEEPING GREEN TEXT LAYER (z-20 to perfectly overlay original text!) */}
      <div className="sweep-green absolute inset-0 z-20 pointer-events-none" style={{ clipPath: 'circle(0% at 0% 50%)', WebkitClipPath: 'circle(0% at 0% 50%)' }}>
        <div className="w-full py-24 md:py-40 flex flex-col h-full absolute inset-0">
          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="text-center mb-24 max-w-4xl mx-auto flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight leading-[1.1] flex flex-wrap justify-center gap-x-5 md:gap-x-8" style={{ perspective: '600px' }}>
                {headingWords.map((word, i) => (
                  <span
                    key={i}
                    className={`inline-block opacity-0 text-cloud animated-word-${i}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {word}
                  </span>
                ))}
              </h2>
              <p className="text-cloud/90 animated-subtext font-medium text-xl mt-8 max-w-2xl mx-auto opacity-0">
                Made with skin-friendly fabrics, perfect for India's climate. Explore our vibrant new arrivals designed for everyday adventures.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* GSAP Animated Heading — Each word animates individually */}
        <div className="text-center mb-24 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight leading-[1.1] flex flex-wrap justify-center gap-x-5 md:gap-x-8" style={{ perspective: '600px' }}>
            {headingWords.map((word, i) => (
              <span
                key={i}
                className={`inline-block opacity-0 text-ink animated-word-${i}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {word}
              </span>
            ))}
          </h2>
          <p className="text-ink/80 animated-subtext font-medium text-xl mt-8 max-w-2xl mx-auto opacity-0">
            Made with skin-friendly fabrics, perfect for India's climate. Explore our vibrant new arrivals designed for everyday adventures.
          </p>
        </div>

        {/* 4-Product Grid with Professional Hover Overlays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, idx) => {
            return (
            <Link 
              key={product.id}
              ref={el => { cardsRef.current[idx] = el }}
              to="/shop" search={{ category: product.category }} 
              className="group block relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-cloud shadow-sm hover:shadow-xl transition-shadow duration-500 will-change-transform opacity-0"
            >
              {/* Image */}
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Permanent Bottom Gradient for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                <div className="flex flex-col items-start transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                  <h3 className="font-heading font-bold text-3xl lg:text-4xl text-white capitalize drop-shadow-sm">
                    {product.category}
                  </h3>
                  
                  {/* Hover Button */}
                  <div className="overflow-hidden h-0 group-hover:h-10 transition-all duration-500 ease-out mt-1">
                    <span className="inline-flex items-center gap-2 bg-coral/90 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      Explore {product.category.toLowerCase()} <span className="text-lg leading-none">&rarr;</span>
                    </span>
                  </div>
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
