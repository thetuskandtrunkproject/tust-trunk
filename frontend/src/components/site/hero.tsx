import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'

import hero1 from '@/assets/hero/hero1.webp'
import hero2 from '@/assets/hero/hero2.webp'
import hero3 from '@/assets/hero/hero3.webp'

const AUTOPLAY_MS = 6000

const slides = [
  { 
    img: hero1, 
    alt: 'For Every Little You & Every You',
    hasOverlay: false, // hero1 already has full branding baked in
    accent: 'from-sky/40 via-sky/10 to-transparent',
    dotColor: 'bg-sky',
    label: 'Our Story',
  },
  { 
    img: hero2, 
    alt: 'Mother and daughter sharing a tender moment',
    hasOverlay: true,
    title: 'New Season, New Styles',
    subtitle: 'Soft fabrics, playful prints — designed for little adventures & big smiles.',
    cta: 'Explore New Arrivals',
    ctaLink: '/shop',
    align: 'left' as const,
    accent: 'from-coral/30 via-coral/5 to-transparent',
    cardGradient: 'from-coral/95 to-[#FF8E8E]/95',
    dotColor: 'bg-coral',
    label: 'New In',
  },
  { 
    img: hero3, 
    alt: 'Mother and daughter picking out a floral dress',
    hasOverlay: true,
    title: 'Little Clothes, Big Moments',
    subtitle: 'Curated collections that grow with your family. Because every outfit tells a story.',
    cta: 'Shop Collection',
    ctaLink: '/shop',
    align: 'right' as const,
    accent: 'from-mint/30 via-mint/5 to-transparent',
    cardGradient: 'from-[#2D6A4F] to-mint/90',
    dotColor: 'bg-mint',
    label: 'Curated',
  },
]

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const textRefs = useRef<(HTMLDivElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    if (isTransitioning || index === current) return
    setIsTransitioning(true)
    setProgress(0)

    const fromSlide = slideRefs.current[current]
    const toSlide = slideRefs.current[index]
    const fromText = textRefs.current[current]
    const toText = textRefs.current[index]

    if (!fromSlide || !toSlide) return

    gsap.set(toSlide, { autoAlpha: 1, zIndex: 2 })
    gsap.set(fromSlide, { zIndex: 1 })

    // Ken Burns zoom out on outgoing
    gsap.to(fromSlide.querySelector('img'), { scale: 1.08, duration: 1.4, ease: 'power2.inOut' })
    // Subtle zoom in on incoming
    gsap.fromTo(toSlide.querySelector('img'), { scale: 1.1 }, { scale: 1, duration: 1.4, ease: 'power2.out' })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(fromSlide, { autoAlpha: 0, zIndex: 0 })
        gsap.set(fromSlide.querySelector('img'), { scale: 1 })
        setCurrent(index)
        setIsTransitioning(false)
      }
    })

    // Fade out old text
    if (fromText) {
      tl.to(fromText, { autoAlpha: 0, y: -40, duration: 0.4, ease: 'power2.in' }, 0)
    }

    // Crossfade slides
    tl.fromTo(toSlide, 
      { autoAlpha: 0 }, 
      { autoAlpha: 1, duration: 1, ease: 'power2.inOut' }, 
      0.1
    )

    // Fade in new text with stagger
    if (toText) {
      tl.fromTo(toText, 
        { autoAlpha: 0, y: 50 }, 
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 
        0.5
      )
    }

  }, [current, isTransitioning])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  // Progress bar timer
  const startProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current)
    setProgress(0)
    const step = 100 / (AUTOPLAY_MS / 50) // update every 50ms
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + step
      })
    }, 50)
  }, [])

  // Auto-play
  useEffect(() => {
    startProgress()
    timerRef.current = setInterval(next, AUTOPLAY_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [current, next, startProgress])

  const pauseAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
  }
  const resumeAutoplay = () => {
    startProgress()
    timerRef.current = setInterval(next, AUTOPLAY_MS)
  }

  // Initialize slides
  useEffect(() => {
    slideRefs.current.forEach((slide, i) => {
      if (slide) gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 0 })
    })
    textRefs.current.forEach((text, i) => {
      if (text) gsap.set(text, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 50 })
    })
  }, [])

  return (
    <section 
      className="relative w-full bg-ink overflow-hidden"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      {/* Slides Container */}
      <div className="relative w-full" style={{ aspectRatio: '16/7' }}>
        {slides.map((slide, idx) => (
          <div 
            key={idx}
            ref={el => { slideRefs.current[idx] = el }}
            className="absolute inset-0 will-change-transform"
          >
            <img 
              src={slide.img} 
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />

            {/* Color gradient overlay — gives each slide its unique brand mood */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} pointer-events-none`}></div>
            
            {/* Bottom vignette for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent pointer-events-none"></div>

            {/* Text overlay for lifestyle shots */}
            {slide.hasOverlay && (
              <div 
                ref={el => { textRefs.current[idx] = el }}
                className={`absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 ${
                  slide.align === 'right' ? 'items-end text-right' : 'items-start text-left'
                }`}
              >
                <div className={`bg-gradient-to-br ${slide.cardGradient} backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-lg shadow-2xl shadow-ink/20 border border-white/20`}>
                  {/* Decorative tag */}
                  <div className="inline-flex items-center gap-2 bg-white/20 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {slide.label}
                  </div>

                  <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl text-white font-black leading-[1.05] mb-4 tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-base md:text-lg text-white/85 mb-8 font-medium leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <Link 
                    to={slide.ctaLink || '/shop'} 
                    className="inline-flex items-center gap-2 bg-white text-ink px-8 py-4 rounded-full font-bold text-base md:text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
                  >
                    {slide.cta}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows — premium glass morphism style */}
        <button 
          onClick={prev}
          className="absolute left-5 md:left-10 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/30 backdrop-blur-md text-white w-14 h-14 rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 group shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button 
          onClick={next}
          className="absolute right-5 md:right-10 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/30 backdrop-blur-md text-white w-14 h-14 rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 group shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Bottom Controls — dots + progress bar */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          {/* Slide counter label */}
          <div className="text-white/60 text-xs font-bold uppercase tracking-[0.25em]">
            {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>

          {/* Dots with progress */}
          <div className="flex items-center gap-3">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="relative overflow-hidden rounded-full transition-all duration-500"
                style={{ 
                  width: idx === current ? 48 : 12, 
                  height: 12,
                }}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {/* Background of dot */}
                <div className={`absolute inset-0 rounded-full ${idx === current ? 'bg-white/30' : 'bg-white/40 hover:bg-white/60'} transition-colors`}></div>

                {/* Animated progress fill for active dot */}
                {idx === current && (
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full ${slide.dotColor} transition-none`}
                    style={{ width: `${progress}%` }}
                  ></div>
                )}
              </button>
            ))}
          </div>
        </div>
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
