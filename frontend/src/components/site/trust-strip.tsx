import { Truck, Leaf, ShieldCheck, Tag } from 'lucide-react'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function TrustStrip() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const items = [
    { icon: Truck, text: 'Free Shipping over ₹3,000', color: 'bg-cloud text-ink' },
    { icon: Leaf, text: 'Soft, Skin-Friendly Fabrics', color: 'bg-mint text-ink' },
    { icon: ShieldCheck, text: 'Secure Payments via Razorpay', color: 'bg-sunshine text-ink' },
    { icon: Tag, text: 'New Season Arrivals', color: 'bg-watermelon text-white' },
  ]

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.trust-item', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        }
      })
    })
    return () => mm.revert()
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="w-full bg-sky py-10 md:py-16 border-y border-ink/5 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          {items.map((item, i) => (
            <div key={i} className="trust-item flex flex-col items-center gap-4 group opacity-100">
              <div className={`p-4 rounded-full ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <item.icon className="w-8 h-8" />
              </div>
              <span className="text-sm md:text-base font-bold tracking-wide text-ink">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


