import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

import { api } from '@/lib/api'

const AUTOPLAY_MS = 5000

export function Hero() {
  const [cmsData, setCmsData] = useState<{ promoRibbonText: string, slides: any[] } | null>(null)
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const isAnimating = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    api.get('/cms/hero').then(res => setCmsData(res.data)).catch(console.error)
  }, [])

  const slides = cmsData?.slides || []

  const animateTo = useCallback((index: number, direction: 'next' | 'prev' = 'next') => {
    if (isAnimating.current || index === current) return
    isAnimating.current = true
    setProgress(0)

    const container = containerRef.current
    if (!container) {
      isAnimating.current = false
      return
    }

    const allSlides = container.querySelectorAll<HTMLDivElement>('.hero-slide')
    const fromSlide = allSlides[current]
    const toSlide = allSlides[index]
    if (!fromSlide || !toSlide) {
      isAnimating.current = false
      return
    }

    const xFrom = direction === 'next' ? '100%' : '-100%'
    const xTo = direction === 'next' ? '-100%' : '100%'

    // Position incoming slide off-screen
    gsap.set(toSlide, { xPercent: direction === 'next' ? 100 : -100, visibility: 'visible', zIndex: 2 })
    gsap.set(fromSlide, { zIndex: 1 })

    // Animate text out on outgoing
    const fromText = fromSlide.querySelector('.hero-text-block')
    const toText = toSlide.querySelector('.hero-text-block')

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(fromSlide, { visibility: 'hidden', zIndex: 0, xPercent: 0 })
        setCurrent(index)
        isAnimating.current = false
      }
    })

    // Slide outgoing away
    tl.to(fromSlide, { 
      xPercent: direction === 'next' ? -100 : 100, 
      duration: 0.9, 
      ease: 'power3.inOut' 
    }, 0)

    // Fade out old text
    if (fromText) {
      tl.to(fromText, { autoAlpha: 0, x: direction === 'next' ? -60 : 60, duration: 0.4, ease: 'power2.in' }, 0)
    }

    // Slide incoming in
    tl.to(toSlide, { 
      xPercent: 0, 
      duration: 0.9, 
      ease: 'power3.inOut' 
    }, 0)

    // Animate incoming text
    if (toText) {
      gsap.set(toText, { autoAlpha: 0, x: direction === 'next' ? 60 : -60 })
      tl.to(toText, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power2.out' }, 0.45)
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

  // Auto-play
  useEffect(() => {
    // Reset progress to 0 for a tiny fraction of a second, then animate to 100
    setProgress(0)
    const frame = requestAnimationFrame(() => {
      setProgress(100)
    })
    
    timerRef.current = setInterval(next, AUTOPLAY_MS)
    return () => {
      cancelAnimationFrame(frame)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [current, next, slides.length])

  const pauseAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setProgress(0)
  }
  const resumeAutoplay = () => {
    setProgress(100)
    timerRef.current = setInterval(next, AUTOPLAY_MS)
  }

  // Initialize
  useEffect(() => {
    const container = containerRef.current
    if (!container || slides.length === 0) return
    const allSlides = container.querySelectorAll<HTMLDivElement>('.hero-slide')
    allSlides.forEach((slide, i) => {
      gsap.set(slide, { visibility: i === 0 ? 'visible' : 'hidden', xPercent: 0, zIndex: i === 0 ? 2 : 0 })
      const textBlock = slide.querySelector('.hero-text-block')
      if (textBlock) gsap.set(textBlock, { autoAlpha: i === 0 ? 1 : 0 })
    })
  }, [slides])

  // Parallax background effect
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Scale up initially slightly so we can translate without showing edges
      gsap.set('.hero-slide img', { scale: 1.1 })
      
      gsap.to('.hero-slide img', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: '+=1000',
          scrub: true,
        }
      })
    })
    return () => mm.revert()
  }, { scope: containerRef, dependencies: [slides] })

  if (!cmsData || slides.length === 0) {
    return (
      <section className="sticky top-[80px] w-full overflow-hidden bg-cloud" style={{ aspectRatio: '16/9' }} />
    )
  }

  return (
    <section
      className="sticky top-[80px] w-full overflow-hidden"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      {/* Slides */}
      <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`hero-slide absolute inset-0 will-change-transform ${idx === 0 ? 'visible' : 'invisible'}`}
          >
            {/* Image */}
            <img
              src={slide.img}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />

            {/* Bottom gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/10 to-transparent pointer-events-none"></div>

            {/* Text Overlay */}
            {slide.hasOverlay && (
              <div
                className={`hero-text-block absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 ${
                  slide.align === 'right' ? 'items-end text-right' : 
                  slide.align === 'center' ? 'items-center text-center' : 'items-start text-left'
                }`}
              >
                <h2 
                  className="font-heading text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight drop-shadow-xl mb-2"
                  style={{ color: slide.textColor || '#FFFFFF' }}
                >
                  {slide.title}
                </h2>
                <h2 
                  className="font-heading text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight drop-shadow-xl mb-5" 
                  style={{ color: slide.accentColor }}
                >
                  {slide.titleAccent}
                </h2>
                <p 
                  className="text-base md:text-xl max-w-lg font-medium drop-shadow-lg mb-8"
                  style={{ color: slide.textColor ? `${slide.textColor}e6` : 'rgba(255,255,255,0.9)' }}
                >
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.ctaLink || '/shop'}
                  className="inline-flex items-center justify-center gap-2.5 font-bold text-base md:text-lg px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
                  style={{ 
                    backgroundColor: slide.accentColor,
                    color: '#FFFFFF' // keeping button text white for contrast, as asked to change "button color"
                  }}
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-lg text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-white/30 transition-all hover:scale-110 group shadow-xl"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-lg text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-white/30 transition-all hover:scale-110 group shadow-xl"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* Bottom: Counter + Progress Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
            <span className="text-white/50 text-xs font-bold tracking-[0.2em] tabular-nums">
              {String(current + 1).padStart(2, '0')}
            </span>

          <div className="flex items-center gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="relative h-1 rounded-full overflow-hidden transition-all duration-500 cursor-pointer"
                style={{ width: idx === current ? 48 : 16 }}
                aria-label={`Slide ${idx + 1}`}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full"></div>
                {idx === current && (
                  <div
                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                    style={{ 
                      width: `${progress}%`, 
                      transition: progress === 0 ? 'none' : `width ${AUTOPLAY_MS}ms linear` 
                    }}
                  ></div>
                )}
              </button>
            ))}
          </div>

          <span className="text-white/50 text-xs font-bold tracking-[0.2em] tabular-nums">
            {String(slides.length).padStart(2, '0')}
          </span>
        </div>
        )}
      </div>

      {/* Promo ribbon */}
      <div className="w-full bg-sunshine text-ink font-bold py-3 text-center text-sm uppercase tracking-wider overflow-hidden">
        <div className="animate-marquee whitespace-nowrap inline-block w-[200%]">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8">Free Shipping on orders over ₹3000 • </span>
          ))}
        </div>
      </div>
    </section>
  )
}
