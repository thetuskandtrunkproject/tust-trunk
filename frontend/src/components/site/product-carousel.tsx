import { ProductCard } from '@/components/product/product-card'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function ProductCarousel() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const res = await api.get('/api/v1/public/products', { 
          params: { sort: 'newest', page_size: 6 } 
        })
        setProducts(res.data.items || [])
      } catch (err) {
        console.error("Failed to load new products", err)
      }
    }
    fetchNew()
  }, [])
  
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  const containerRef = useRef<HTMLElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollPrev = () => {
    if (scrollerRef.current) {
      const cardWidth = 320 // approx width of a card + gap
      scrollerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' })
    }
  }

  const scrollNext = () => {
    if (scrollerRef.current) {
      const cardWidth = 320 // approx width of a card + gap
      scrollerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
    }
  }

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Fade-in reveal
      gsap.from(containerRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        }
      })

      // Zoom/Scale center card on scroll
      const scroller = scrollerRef.current
      if (!scroller) return

      const cards = scroller.querySelectorAll('.carousel-card')
      const updateScales = () => {
        const scrollerRect = scroller.getBoundingClientRect()
        const scrollerCenter = scrollerRect.left + scrollerRect.width / 2

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect()
          const cardCenter = rect.left + rect.width / 2
          
          // Calculate distance from center
          const dist = Math.abs(scrollerCenter - cardCenter)
          
          // Max scale when dist is 0, normal scale when dist is > half scroller width
          const maxDist = scrollerRect.width / 2
          const scale = 1 + Math.max(0, 1 - dist / maxDist) * 0.05 // 1.0 to 1.05

          gsap.set(card, { scale, transformOrigin: 'center center' })
        })
      }

      // Drag to scroll
      let isDown = false
      let startX: number
      let scrollLeft: number

      const onMouseDown = (e: MouseEvent) => {
        isDown = true
        scroller.classList.add('cursor-grabbing')
        scroller.classList.remove('cursor-grab')
        startX = e.pageX - scroller.offsetLeft
        scrollLeft = scroller.scrollLeft
      }
      
      const onMouseLeave = () => {
        isDown = false
        scroller.classList.remove('cursor-grabbing')
        scroller.classList.add('cursor-grab')
      }
      
      const onMouseUp = () => {
        isDown = false
        scroller.classList.remove('cursor-grabbing')
        scroller.classList.add('cursor-grab')
      }
      
      const onMouseMove = (e: MouseEvent) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - scroller.offsetLeft
        const walk = (x - startX) * 2 // Scroll speed multiplier
        scroller.scrollLeft = scrollLeft - walk
      }

      scroller.addEventListener('mousedown', onMouseDown)
      scroller.addEventListener('mouseleave', onMouseLeave)
      scroller.addEventListener('mouseup', onMouseUp)
      scroller.addEventListener('mousemove', onMouseMove)
      scroller.addEventListener('scroll', updateScales)
      window.addEventListener('resize', updateScales)
      updateScales() // Initial check

      return () => {
        scroller.removeEventListener('mousedown', onMouseDown)
        scroller.removeEventListener('mouseleave', onMouseLeave)
        scroller.removeEventListener('mouseup', onMouseUp)
        scroller.removeEventListener('mousemove', onMouseMove)
        scroller.removeEventListener('scroll', updateScales)
        window.removeEventListener('resize', updateScales)
      }
    })
    return () => mm.revert()
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="w-full py-16 md:py-24 bg-cloud overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-4xl md:text-5xl text-ink font-bold">New In</h2>
          <p className="text-ink/70 mt-2 text-lg">The latest additions to our collection.</p>
        </div>
        <Link to="/shop" search={{ sort: 'newest' }} className="hidden md:flex items-center gap-2 font-bold text-ink hover:text-sky transition-colors">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="relative group/carousel">
        <div ref={scrollerRef} className="w-full pl-4 lg:pl-8 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory flex cursor-grab active:cursor-grabbing">
          <div className="flex gap-6 pr-4 lg:pr-8 w-max items-center py-4">
            {products.map(p => (
              <div key={p.id} className="carousel-card w-[280px] lg:w-[320px] snap-center shrink-0 transition-shadow">
                <ProductCard 
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={formatPrice(p.price)}
                  img={p.images[0]}

                  category={p.category}
                  tags={p.tags}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={scrollPrev}
          className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 -mt-4 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-ink hover:bg-white hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
          aria-label="Previous items"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 -mt-4 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-ink hover:bg-white hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
          aria-label="Next items"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      <div className="container mx-auto px-4 mt-2 md:hidden">
        <Link to="/shop" search={{ sort: 'newest' }} className="flex items-center justify-center w-full py-4 bg-cloud border border-ink/20 hover:border-ink rounded-xl font-bold text-ink transition-colors">
          View all products
        </Link>
      </div>
    </section>
  )
}
