import { Link } from '@tanstack/react-router'
import { useRef, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function CategoryTiles({ initialData }: { initialData?: any }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])
  
  const [cmsData, setCmsData] = useState<any>(initialData || null)

  useEffect(() => {
    if (initialData && initialData.tiles) {
      setCmsData(initialData)
      return
    }
    const fetchCms = async () => {
      try {
        const res = await api.get('/cms/category-tiles')
        setCmsData(res.data)
      } catch (err) {
        console.error("Failed to load category tiles CMS data", err)
      }
    }
    fetchCms()
  }, [initialData])

  // Split heading into individual words for GSAP text animation
  const headingWords = cmsData 
    ? `${cmsData.title} ${cmsData.titleAccent}`.trim().split(/\s+/).filter(Boolean) 
    : ['Playful', '&', 'Breathable']

  useGSAP(() => {
    if (!headingWords || headingWords.length === 0) return;
    
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

  }, { scope: containerRef, dependencies: [headingWords, cmsData?.tiles] })

  return (
    <section ref={containerRef} className="w-full py-12 md:py-24 lg:py-40 relative bg-cloud">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-white"></div>



      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* GSAP Animated Heading — Each word animates individually */}
        <div className="text-center mb-24 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight leading-[1.1] flex flex-wrap justify-center gap-x-3 sm:gap-x-5 md:gap-x-8" style={{ perspective: '600px' }}>
            {headingWords.map((word, i) => (
              <span
                key={i}
                className={`inline-block opacity-0 animated-word-${i}`}
                style={{ transformStyle: 'preserve-3d', color: cmsData?.textColor || '#2D283E' }}
              >
                {word}
              </span>
            ))}
          </h2>
          <p className="animated-subtext font-medium text-base sm:text-xl mt-4 sm:mt-8 max-w-2xl mx-auto opacity-0 px-2" style={{ color: cmsData?.textColor || '#2D283E', opacity: 0 }}>
            {cmsData?.subtitle || "Made with skin-friendly fabrics, perfect for India's climate. Explore our vibrant new arrivals designed for everyday adventures."}
          </p>
        </div>

        {/* Tiles Grid with Professional Hover Overlays */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 justify-center">
          {cmsData?.tiles?.map((tile: any, idx: number) => {
            return (
            <Link 
              key={idx}
              ref={el => { cardsRef.current[idx] = el }}
              to={tile.link} 
              className="group flex flex-col items-center gap-3 md:block md:relative md:aspect-[4/5] md:rounded-[2.5rem] md:overflow-hidden md:bg-cloud md:shadow-sm hover:shadow-xl transition-shadow duration-500 will-change-transform opacity-0"
            >
              {/* Image Container: Circle on Mobile, Full Card on Desktop */}
              <div className="relative w-[85%] sm:w-full aspect-square md:w-full md:h-full md:aspect-auto rounded-full md:rounded-none overflow-hidden bg-cloud shadow-md md:shadow-none mx-auto border-4 border-white md:border-0">
                <img 
                  src={tile.image} 
                  alt={tile.label} 
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Permanent Bottom Gradient for Text Legibility (Desktop Only) */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
              </div>
              
              {/* Content Label */}
              <div className="md:absolute md:inset-0 flex flex-col justify-end md:p-6 lg:p-8 text-center md:text-left w-full">
                <div className="flex flex-col items-center md:items-start transform md:group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                  <h3 className="font-heading font-black text-[15px] sm:text-lg md:text-3xl lg:text-4xl text-ink md:text-white capitalize drop-shadow-none md:drop-shadow-sm">
                    {tile.label}
                  </h3>
                  
                  {/* Hover Button (Desktop Only) */}
                  <div className="hidden md:block overflow-hidden h-0 group-hover:h-10 transition-all duration-500 ease-out mt-1">
                    <span className="inline-flex items-center gap-2 bg-cta/90 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      Explore {tile.label} <span className="text-lg leading-none">&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )})}
        </div>
        
        <div className="mt-12 sm:mt-24 text-center">
           <Link to={cmsData?.buttonLink || "/shop"} className="btn-secondary">
             {cmsData?.buttonText || "View Complete Collection"} <span className="text-xl">&rarr;</span>
           </Link>
        </div>

      </div>
    </section>
  )
}


