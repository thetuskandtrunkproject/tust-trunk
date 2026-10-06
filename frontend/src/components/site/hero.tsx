import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Heart, ShieldCheck, Truck, Star } from 'lucide-react'
import { api } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

const AUTOPLAY_MS = 5000

export function Hero({ initialData }: { initialData?: { promoRibbonText: string, slides: any[] } | null }) {
  const [cmsData, setCmsData] = useState<{ promoRibbonText: string, slides: any[] } | null>(initialData || null)
  const [current, setCurrent] = useState(0)
  const isAnimating = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!initialData) {
      api.get('/cms/hero').then(res => setCmsData(res.data)).catch(console.error)
    } else {
      setCmsData(initialData)
    }
  }, [initialData])

  const slides = cmsData?.slides || []

  const animateTo = useCallback((index: number, direction: 'next' | 'prev' = 'next') => {
    if (isAnimating.current || index === current) return
    isAnimating.current = true

    const container = containerRef.current
    if (!container) {
      isAnimating.current = false
      return
    }

    const allSlides = container.querySelectorAll<HTMLDivElement>('.hero-slide-img')
    const allText = container.querySelectorAll<HTMLDivElement>('.hero-content-slide')
    
    const fromImg = allSlides[current]
    const toImg = allSlides[index]
    const fromText = allText[current]
    const toText = allText[index]

    if (!fromImg || !toImg) {
      isAnimating.current = false
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(fromImg, { visibility: 'hidden', zIndex: 0, opacity: 0 })
        if (fromText) gsap.set(fromText, { visibility: 'hidden', opacity: 0 })
        setCurrent(index)
        isAnimating.current = false
      }
    })

    gsap.set(toImg, { visibility: 'visible', zIndex: 2, opacity: 0, scale: 1.04 })
    gsap.set(fromImg, { zIndex: 1 })

    if (toText) {
      gsap.set(toText, { visibility: 'visible', opacity: 0, y: direction === 'next' ? 20 : -20 })
    }

    tl.to(fromImg, { opacity: 0, scale: 0.96, duration: 0.5, ease: 'power2.inOut' }, 0)
    tl.to(toImg, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.inOut' }, 0)

    if (fromText) {
      tl.to(fromText, { opacity: 0, y: direction === 'next' ? -20 : 20, duration: 0.3, ease: 'power2.in' }, 0)
    }
    if (toText) {
      tl.to(toText, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.2)
    }

  }, [current, slides.length])

  const next = useCallback(() => {
    if (slides.length <= 1) return
    animateTo((current + 1) % slides.length, 'next')
  }, [current, animateTo, slides.length])

  const prev = useCallback(() => {
    if (slides.length <= 1) return
    animateTo((current - 1 + slides.length) % slides.length, 'prev')
  }, [current, animateTo, slides.length])

  const goTo = useCallback((index: number) => {
    if (slides.length <= 1) return
    animateTo(index, index > current ? 'next' : 'prev')
  }, [current, animateTo, slides.length])

  useEffect(() => {
    timerRef.current = setInterval(next, AUTOPLAY_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [current, next, slides.length])

  const pauseAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }
  const resumeAutoplay = () => {
    timerRef.current = setInterval(next, AUTOPLAY_MS)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container || slides.length === 0) return
    const allSlides = container.querySelectorAll<HTMLDivElement>('.hero-slide-img')
    const allText = container.querySelectorAll<HTMLDivElement>('.hero-content-slide')
    
    allSlides.forEach((img, i) => {
      gsap.set(img, { visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0 })
    })
    allText.forEach((text, i) => {
      gsap.set(text, { visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0, y: 0 })
    })
  }, [slides])

  if (!cmsData || slides.length === 0) {
    return <section className="w-full bg-[#FAF7F9] py-12 min-h-[450px]" />
  }

  return (
    <section 
      className="w-full bg-gradient-to-b from-[#FFF5F8] via-[#FAF7F9] to-white pt-4 pb-8 md:py-12 overflow-hidden relative"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      {/* Decorative SVGs */}
      <div className="absolute top-6 left-6 w-14 h-14 text-sky/25 pointer-events-none animate-pulse">
        <Sparkles className="w-full h-full" />
      </div>
      <div className="absolute top-16 right-12 w-16 h-16 text-coral/20 pointer-events-none rotate-12">
        <Heart className="w-full h-full fill-coral/10" />
      </div>
      <div className="absolute bottom-12 left-1/3 w-20 h-20 text-sunshine/40 pointer-events-none -rotate-6">
        <Star className="w-full h-full fill-sunshine/20" />
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Playful Content */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1 relative z-10">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-coral/20 shadow-xs mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-coral animate-ping"></span>
              <span className="text-xs md:text-sm font-bold text-coral tracking-wide uppercase">
                Little Clothes, Big Moments ✨
              </span>
            </div>

            {/* Slides Content Container */}
            <div className="relative min-h-[250px] md:min-h-[290px]">
              {slides.map((slide, idx) => (
                <div 
                  key={idx} 
                  className={`hero-content-slide absolute inset-0 flex flex-col justify-center ${idx === 0 ? 'visible' : 'invisible'}`}
                >
                  <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.1] mb-2">
                    {slide.title}
                  </h1>
                  <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4 sm:mb-6" style={{ color: slide.accentColor || '#FF6B8B' }}>
                    {slide.titleAccent}
                  </h1>
                  
                  <p className="text-base sm:text-lg text-ink/70 font-medium leading-relaxed max-w-xl mb-6 sm:mb-8 line-clamp-3">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to={slide.ctaLink || '/shop'}
                      className="inline-flex items-center justify-center gap-2 font-bold text-base md:text-lg px-8 py-4 rounded-2xl bg-coral text-white shadow-lg hover:shadow-xl hover:bg-coral/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                    >
                      {slide.cta || 'Shop Collection'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </Link>

                    <Link
                      to="/shop"
                      search={{ tag: 'Sale' }}
                      className="inline-flex items-center justify-center gap-2 font-bold text-sm md:text-base px-6 py-4 rounded-2xl bg-white border border-ink/10 text-ink hover:bg-cloud hover:border-sky/40 transition-all duration-300"
                    >
                      Explore Offers
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls & Playful Trust Bar */}
            <div className="mt-8 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                {slides.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prev}
                      className="w-10 h-10 rounded-xl bg-white border border-ink/10 flex items-center justify-center text-ink hover:bg-sky/10 hover:text-sky transition-colors cursor-pointer"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={next}
                      className="w-10 h-10 rounded-xl bg-white border border-ink/10 flex items-center justify-center text-ink hover:bg-sky/10 hover:text-sky transition-colors cursor-pointer"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Progress Dots */}
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goTo(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === current ? 'w-8 bg-coral' : 'w-2.5 bg-ink/20 hover:bg-ink/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 text-xs font-bold text-ink/60">
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-ink/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  100% Skin-Friendly
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-ink/5">
                  <Truck className="w-4 h-4 text-sky" />
                  Fast Shipping
                </span>
              </div>

            </div>

          </div>

          {/* Right Column: Strict 4:5 Aspect Ratio Image Frame */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[2.5rem] p-3 bg-white shadow-2xl border border-white/80 ring-1 ring-ink/5 overflow-hidden group">
              
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-cloud">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`hero-slide-img absolute inset-0 transition-all duration-500 ${
                      idx === 0 ? 'visible opacity-100' : 'invisible opacity-0'
                    }`}
                  >
                    <img
                      src={slide.img}
                      alt={slide.alt || slide.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60"></div>
                  </div>
                ))}

                {/* Floating Badge on 4:5 image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-sunshine/30 text-sunshine flex items-center justify-center font-bold text-sm">
                      🧸
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">Premium Comfort</p>
                      <p className="text-[11px] text-ink/60 font-medium">Crafted for Everyday Joy</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-coral bg-coral/10 px-2.5 py-1 rounded-full">
                    New
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Marquee Ribbon */}
      <div className="w-full bg-sunshine text-ink font-bold py-2.5 text-center text-xs md:text-sm uppercase tracking-wider overflow-hidden mt-8 border-y border-sunshine-dark/10">
        <div className="animate-marquee whitespace-nowrap inline-block w-[200%]">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8">Free Shipping on orders over ₹3000 • 100% Skin Friendly Fabrics • Crafted with Care • </span>
          ))}
        </div>
      </div>
    </section>
  )
}
