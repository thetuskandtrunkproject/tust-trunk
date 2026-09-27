import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef } from 'react'
import logoImg from '@/assets/logo_full_hd.png'
import { Droplets, Sparkles, ShieldCheck } from 'lucide-react'
import { ReadingProgress } from '@/components/ui/reading-progress'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const sections = gsap.utils.toArray('.reveal-section') as HTMLElement[]
    
    sections.forEach((section) => {
      gsap.fromTo(section,
        { 
          opacity: 0,
          y: 40
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-cloud pb-24 overflow-hidden">
      <ReadingProgress />
      
      {/* Hero / Intro */}
      <section className="bg-gradient-to-br from-mint/20 via-sky/10 to-cloud pt-20 pb-24 lg:pt-32 lg:pb-32 px-4 lg:px-8 mb-24 rounded-b-[3rem] relative z-10 reveal-section">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-8">
            <img src={logoImg} alt="The Tusk & Trunk" className="h-20 md:h-24 drop-shadow-sm" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-7xl text-ink mb-6 leading-tight">
            Everyday essentials,<br className="hidden md:block" /> crafted with care.
          </h1>
          <p className="text-lg md:text-xl text-ink/70 max-w-2xl mx-auto font-medium leading-relaxed">
            We believe that what you wear every day matters most. That's why we focus on exceptional comfort, timeless design, and sustainable quality.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 lg:px-8 max-w-3xl mb-32 reveal-section">
        <h2 className="font-heading font-bold text-4xl text-ink mb-8 text-center md:text-left">Our Story</h2>
        <div className="space-y-6 text-ink/70 font-sans text-lg md:text-xl leading-relaxed font-medium">
          <p>
            The Tusk & Trunk was born out of a simple frustration: why is it so hard to find well-made, comfortable basics that don't cost a fortune or fall apart after a few washes? We set out to change that.
          </p>
          <p>
            Starting with just a single perfect t-shirt, we've slowly grown into a full collection of everyday wear for men, women, and kids. We don't believe in fast fashion trends. Instead, we obsess over the details—the exact weight of the cotton, the perfect drape of a linen shirt, and the durability of our stitching.
          </p>
          <p>
            Our name represents strength (tusk) and rootedness (trunk). It's a reminder to stay grounded in quality and build things that are meant to last.
          </p>
        </div>
      </section>

      {/* What we stand for (Values) */}
      <section className="bg-white border-y border-ink/5 py-24 mb-32 reveal-section">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl text-ink mb-4">What we stand for</h2>
            <p className="text-ink/60 font-medium text-lg max-w-xl mx-auto">The core principles that guide everything we make.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-8 bg-sky-soft/30 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-sky rounded-full flex items-center justify-center text-white mb-6 shadow-sm">
                <Droplets className="w-10 h-10" />
              </div>
              <h3 className="font-heading font-bold text-ink text-2xl mb-3">Premium Fabrics</h3>
              <p className="text-ink/70 font-medium leading-relaxed">
                We source the finest, most breathable materials to ensure all-day comfort.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-mint/10 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-mint rounded-full flex items-center justify-center text-ink mb-6 shadow-sm">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="font-heading font-bold text-ink text-2xl mb-3">Thoughtful Design</h3>
              <p className="text-ink/70 font-medium leading-relaxed">
                Timeless silhouettes that flatter without restricting your movement.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-sunshine/10 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-sunshine rounded-full flex items-center justify-center text-ink mb-6 shadow-sm">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="font-heading font-bold text-ink text-2xl mb-3">Made to Last</h3>
              <p className="text-ink/70 font-medium leading-relaxed">
                Durability is a feature. Our clothes are stitched to withstand real life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Behind the Brand */}
      <section className="container mx-auto px-4 lg:px-8 max-w-6xl mb-32 reveal-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="order-2 md:order-1 relative space-y-8">
            <div className="aspect-[4/5] bg-ink/5 rounded-[2.5rem] overflow-hidden shadow-sm relative z-10 border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1fac08404a?q=80&w=1000&auto=format&fit=crop" 
                alt="Our design process" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="aspect-square bg-ink/5 rounded-[2.5rem] overflow-hidden shadow-sm relative z-10 w-4/5 ml-auto border-4 border-white -mt-20">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop" 
                alt="Our materials" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute top-20 -right-8 w-1/2 aspect-square bg-sunshine rounded-full -z-0 hidden md:block mix-blend-multiply blur-2xl opacity-60"></div>
            <div className="absolute bottom-10 -left-8 w-2/3 aspect-square bg-coral/30 rounded-full -z-0 hidden md:block mix-blend-multiply blur-2xl opacity-60"></div>
          </div>
          
          <div className="order-1 md:order-2 md:sticky md:top-32 pt-10">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-ink mb-6">Behind the brand</h2>
            <p className="text-ink/70 text-lg font-medium leading-relaxed mb-6">
              Every piece in our collection starts in our small studio, where we obsess over fit, form, and function. We work closely with ethical manufacturing partners who share our commitment to fair labor and sustainable practices.
            </p>
            <p className="text-ink/70 text-lg font-medium leading-relaxed">
              When you wear The Tusk & Trunk, you're not just wearing a garment—you're wearing months of careful prototyping and testing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="container mx-auto px-4 lg:px-8 max-w-5xl reveal-section">
        <div className="bg-mint rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-sm">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sunshine/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-ink mb-6">Experience the difference</h2>
            <p className="text-ink/70 font-medium text-lg md:text-xl mb-10 max-w-lg mx-auto">
              Explore our latest arrivals and find your new everyday favorites.
            </p>
            <Link 
              to="/shop" 
              className="inline-block bg-coral text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 hover:bg-coral/90 transition-all"
            >
              Shop the collection
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
