import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Heart, ShieldCheck, Truck, Star } from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { api } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

const AUTOPLAY_MS = 5000

interface HeroProps {
  initialData?: any | null
  isIntroActive?: boolean
  registerMatchCutTrigger?: (trigger: () => void) => void
}

export function Hero({ initialData, isIntroActive = false, registerMatchCutTrigger }: HeroProps) {
  const [cmsData, setCmsData] = useState<any | null>(initialData || null)
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
    if (!registerMatchCutTrigger) return

    const runMatchCut = (targetProgress?: number) => {
      const container = containerRef.current
      if (!container) return

      const tl = gsap.timeline()

      // 1. Photo panel wipes in from the right (0.8s, power3.inOut)
      tl.to('.hero-photo-panel', {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.8,
        ease: 'power3.inOut',
      }, 0)

      // 2. Hanging tag drops down from above and reaches rest exactly as logo lands (0.8s, power3.out)
      tl.to('.hero-intro-tag', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, 0)

      // 3. Headline lines rise in (0.7s, stagger, power3.out)
      tl.to('.hero-headline-line', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      }, 0.08)

      // 4. Parallax hero image settle
      tl.to('.hero-parallax-img', {
        scale: 1,
        duration: 1.0,
        ease: 'power2.out',
      }, 0)

      // 5. Settle phase (2.4s to 2.9s): CTA buttons and trust chips stagger in
      tl.to('.hero-intro-cta, .hero-intro-chips', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0.75)

      if (typeof targetProgress === 'number') {
        tl.progress(targetProgress).pause()
      }
    }

    registerMatchCutTrigger(runMatchCut)
  }, [registerMatchCutTrigger])

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

    if (isIntroActive) {
      // Photo panel wiped out to the right
      gsap.set('.hero-photo-panel', { clipPath: 'inset(0% 0% 0% 100%)' })
      // Headlines, CTA, trust chips hidden
      gsap.set('.hero-headline-line', { opacity: 0, y: 32 })
      gsap.set('.hero-intro-cta, .hero-intro-chips', { opacity: 0, y: 20 })
      // Tag drops from above
      gsap.set('.hero-intro-tag', { opacity: 0, y: -40 })
      // Tag logo invisible until landing handoff frame
      gsap.set('[data-brand-tag-logo]', { opacity: 0, visibility: 'hidden' })
      gsap.set('.hero-parallax-img', { scale: 1.15 })
    } else {
      // Normal state when intro is finished or subsequent visits
      gsap.set('.hero-photo-panel', { clipPath: 'inset(0% 0% 0% 0%)' })
      gsap.set('.hero-headline-line, .hero-intro-cta, .hero-intro-chips', { opacity: 1, y: 0 })
      gsap.set('.hero-intro-tag', { opacity: 1, y: 0 })
      gsap.set('[data-brand-tag-logo]', { opacity: 1, visibility: 'visible' })
      gsap.set('.hero-parallax-img', { scale: 1 })
    }

    // Parallax effect for hero image
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to('.hero-parallax-img', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    })

    return () => mm.revert()
  }, [slides, isIntroActive])

  if (!cmsData || slides.length === 0) {
    return <section className="w-full bg-[#FAF7F9] py-12 min-h-[450px]" />
  }

  return (
    <section 
      className="w-full bg-gradient-to-b from-[#FFF5F8] via-[#FAF7F9] to-white overflow-hidden relative"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="relative w-full h-full">
        {/* Decorative SVGs with Smooth CSS Hardware-Accelerated Animations */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Group 1: Far Left */}
          <div className="absolute top-[5%] left-[5%] w-16 h-16 text-sky/25 animate-float-1">
            <Sparkles className="w-full h-full" />
          </div>
          <div className="absolute top-[45%] left-[3%] w-12 h-12 text-watermelon/30 animate-float-3">
            <Star className="w-full h-full fill-watermelon/20" />
          </div>
          <div className="absolute bottom-[10%] left-[5%] w-14 h-14 text-coral/20 animate-float-2">
            <Heart className="w-full h-full fill-coral/10" />
          </div>

          {/* Group 2: Mid Left */}
          <div className="absolute top-[25%] left-[25%] w-10 h-10 text-sunshine/40 animate-float-4">
            <Star className="w-full h-full fill-sunshine/20" />
          </div>
          <div className="absolute bottom-[25%] left-[20%] w-20 h-20 text-sky/20 animate-float-1">
            <Sparkles className="w-full h-full" />
          </div>

          {/* Group 3: Center Area */}
          <div className="absolute top-[10%] left-[45%] w-14 h-14 text-mint/30 animate-float-3">
            <Heart className="w-full h-full fill-mint/10" />
          </div>
          <div className="absolute top-[60%] left-[50%] w-10 h-10 text-cta/20 animate-float-2">
            <Star className="w-full h-full fill-cta/10" />
          </div>
          <div className="absolute bottom-[5%] left-[40%] w-16 h-16 text-watermelon/20 animate-float-4">
            <Sparkles className="w-full h-full" />
          </div>

          {/* Group 4: Far Right */}
          <div className="absolute top-[5%] right-[5%] w-20 h-20 text-sunshine/30 animate-float-1">
            <Star className="w-full h-full fill-sunshine/15" />
          </div>
          <div className="absolute top-[35%] right-[2%] w-12 h-12 text-sky/30 animate-float-4">
            <Sparkles className="w-full h-full" />
          </div>
          <div className="absolute bottom-[35%] right-[4%] w-16 h-16 text-coral/30 animate-float-2">
            <Heart className="w-full h-full fill-coral/15" />
          </div>
          <div className="absolute bottom-[5%] right-[8%] w-14 h-14 text-mint/40 animate-float-3">
            <Star className="w-full h-full fill-mint/20" />
          </div>
        </div>

        <div ref={containerRef} className="relative z-10 flex flex-col lg:flex-row min-h-[600px] xl:min-h-[700px]">
          {/* Professional Editorial Vertical Branding */}
          <div className="absolute left-2 xl:left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[9px] font-black tracking-[0.4em] text-ink/15 uppercase whitespace-nowrap hidden lg:block pointer-events-none select-none">
            Tusk & Trunk • Premium Kidswear • Est 2024
          </div>
          
          {/* Left Column: Playful Content */}
          <div className="w-full lg:w-1/2 flex justify-end order-2 lg:order-1 relative">
            <div className="w-full max-w-[800px] px-4 md:px-8 xl:pr-16 flex flex-col justify-center h-full py-10 md:py-16 relative z-10">
              
              <div className="hero-headline-line inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-coral/20 shadow-xs mb-6 w-fit">
                <span className="w-2 h-2 rounded-full bg-coral animate-ping"></span>
                <span className="text-xs md:text-sm font-bold text-coral tracking-wide uppercase">
                  Little Clothes, Big Moments ✨
                </span>
              </div>

              {/* Static Content Container (Decoupled from sliding images) */}
              <div className={`relative min-h-[250px] md:min-h-[290px] flex flex-col justify-center ${
                (cmsData?.align || slides[0]?.align) === 'center' ? 'items-center text-center' :
                (cmsData?.align || slides[0]?.align) === 'right' ? 'items-end text-right' :
                'items-start text-left'
              }`}>
                <h1 
                  className="hero-headline-line font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-2"
                  style={{ color: cmsData?.textColor || slides[0]?.textColor || '#2D283E' }}
                >
                  {cmsData?.title || slides[0]?.title}
                </h1>
                <h1 
                  className="hero-headline-line font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4 sm:mb-6" 
                  style={{ color: cmsData?.accentColor || slides[0]?.accentColor || '#FF6B8B' }}
                >
                  {cmsData?.titleAccent || slides[0]?.titleAccent}
                </h1>
                
                <p 
                  className="hero-headline-line text-base sm:text-lg font-medium leading-relaxed max-w-xl mb-6 sm:mb-8 line-clamp-3"
                  style={{ color: cmsData?.textColor || slides[0]?.textColor ? `${cmsData?.textColor || slides[0]?.textColor}cc` : '#2D283Ecc' }}
                >
                  {cmsData?.subtitle || slides[0]?.subtitle}
                </p>

                <div className="hero-intro-cta flex flex-wrap items-center gap-4">
                  <Link
                    to={cmsData?.ctaLink || slides[0]?.ctaLink || '/shop'}
                    className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm shadow-md transition-all border-2 z-10 bg-white"
                    style={{ 
                      borderColor: cmsData?.accentColor || slides[0]?.accentColor || '#FF6B8B', 
                      color: cmsData?.accentColor || slides[0]?.accentColor || '#FF6B8B' 
                    }}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-0 transition-all duration-300 ease-out group-hover:w-full -z-10"
                      style={{ backgroundColor: cmsData?.accentColor || slides[0]?.accentColor || '#FF6B8B' }}
                    ></div>
                    <span className="group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                      {cmsData?.cta || slides[0]?.cta || 'Shop Collection'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </Link>

                  <Link
                    to="/shop"
                    search={{ tag: 'Sale' }}
                    className="btn-secondary"
                  >
                    Explore Offers
                  </Link>
                </div>
              </div>

              {/* Bottom Controls & Playful Trust Bar */}
              <div className="mt-8 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                

                {/* Trust Badges */}
                <div className="hero-intro-chips flex items-center gap-4 text-xs font-bold text-ink/60">
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
          </div>

          {/* Right Column: Full Bleed Half-Screen Image Frame */}
          <div className="hero-photo-panel order-1 lg:order-2 w-full lg:w-1/2 aspect-[4/5] md:aspect-auto md:h-[500px] lg:h-auto lg:absolute lg:right-0 lg:top-0 lg:bottom-0">
            <div 
              className="relative w-full h-full overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02] group lg:rounded-none lg:rounded-bl-[4rem] bg-white/90"
            >
              
              <div 
                className="relative w-full h-full overflow-hidden bg-cloud lg:rounded-none lg:rounded-bl-[4rem]"
              >
                  {slides.map((slide: any, idx: number) => (
                    <div
                      key={idx}
                      className={`hero-slide-img absolute inset-[-15%] transition-all duration-500 ${
                        idx === 0 ? 'visible opacity-100' : 'invisible opacity-0'
                      }`}
                    >
                      <img
                        src={slide.img}
                        alt={slide.alt || slide.title}
                        className="hero-parallax-img w-full h-full object-cover object-[center_15%]"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                      {(cmsData?.hasOverlay || slide.hasOverlay) && (
                        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                      )}
                    </div>
                  ))}
                </div>


              </div>
            </div>

            {/* Image Slider Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-white/30 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/40 flex items-center gap-4">
              {slides.length > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={prev} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={next} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
              <div className="flex items-center gap-1.5 pr-2">
                {slides.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Hanging Brand Clothing Tag Badge with Match-Cut Landing */}
          <div 
            className="hero-intro-tag flex absolute top-4 sm:top-8 lg:top-10 left-1/2 -translate-x-1/2 z-40 flex-col items-center justify-center bg-white shadow-2xl px-3 sm:px-4 pt-4 sm:pt-5 pb-5 sm:pb-7 w-[110px] sm:w-[130px] lg:w-[150px] origin-top rounded-b-[2rem] border-x border-b border-ink/10"
          >
            {/* Stitch marks at the top */}
            <div className="absolute top-1.5 w-8 sm:w-12 h-px bg-ink/15"></div>
            <div className="absolute top-2.5 w-8 sm:w-12 h-px bg-ink/15"></div>
            
            {/* Brand Logo landing slot: 90px desktop, 64px min on mobile */}
            <BrandLogo 
              data-brand-tag-logo="true"
              className="w-[64px] sm:w-[76px] lg:w-[90px] h-auto mb-2.5 object-contain select-none"
            />
            
            <div className="h-px w-8 sm:w-12 bg-ink/10 mb-2"></div>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.22em] font-black text-ink/70 text-center leading-relaxed">
              Premium<br/>Quality
            </span>
          </div>

        </div>
      {/* Marquee Ribbon - Positioned at bottom with high z-index to overlay next section's waves */}
      <div className="relative z-30 w-full bg-sunshine text-ink font-bold py-2.5 text-center text-xs md:text-sm uppercase tracking-wider overflow-hidden border-y border-sunshine/20 mt-4 md:mt-8 shadow-sm">
        <div className="animate-marquee whitespace-nowrap inline-block w-[200%]">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8">Free Shipping on orders over ₹3000 • 100% Skin Friendly Fabrics • Crafted with Care • </span>
          ))}
        </div>
      </div>
    </section>
  )
}
