import { createFileRoute, Link } from '@tanstack/react-router'
import logoImg from '@/assets/logo_full_hd.png'
import { Droplets, Sparkles, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="min-h-screen bg-cloud pt-12 md:pt-20 pb-24">
      
      {/* Hero / Intro */}
      <section className="container mx-auto px-4 lg:px-8 max-w-4xl text-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-8">
          <img src={logoImg} alt="The Tusk & Trunk" className="h-16 md:h-20" />
        </div>
        <h1 className="font-fraunces text-4xl md:text-5xl lg:text-6xl text-ink mb-6">
          Everyday essentials,<br className="hidden md:block" /> crafted with care.
        </h1>
        <p className="text-lg text-ink/70 max-w-2xl mx-auto leading-relaxed">
          We believe that what you wear every day matters most. That's why we focus on exceptional comfort, timeless design, and sustainable quality.
        </p>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 lg:px-8 max-w-3xl mb-32">
        <h2 className="font-fraunces text-3xl text-ink mb-8 text-center md:text-left">Our Story</h2>
        <div className="space-y-6 text-ink/80 text-lg leading-relaxed">
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
      <section className="bg-white border-y border-ink/10 py-24 mb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-fraunces text-3xl text-ink mb-4">What we stand for</h2>
            <p className="text-ink/60 max-w-xl mx-auto">The core principles that guide everything we make.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-sky/10 rounded-full flex items-center justify-center text-sky mb-6">
                <Droplets className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-ink text-lg mb-3">Premium Fabrics</h3>
              <p className="text-ink/70 leading-relaxed">
                We source the finest, most breathable materials to ensure all-day comfort.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-butter/20 rounded-full flex items-center justify-center text-[#B28A00] mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-ink text-lg mb-3">Thoughtful Design</h3>
              <p className="text-ink/70 leading-relaxed">
                Timeless silhouettes that flatter without restricting your movement.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-rust/10 rounded-full flex items-center justify-center text-rust mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-ink text-lg mb-3">Made to Last</h3>
              <p className="text-ink/70 leading-relaxed">
                Durability is a feature. Our clothes are stitched to withstand real life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Behind the Brand */}
      <section className="container mx-auto px-4 lg:px-8 max-w-6xl mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="aspect-[4/5] bg-ink/5 rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1fac08404a?q=80&w=1000&auto=format&fit=crop" 
                alt="Our design process" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-1/2 aspect-square bg-sky-soft rounded-2xl -z-10 hidden md:block"></div>
          </div>
          
          <div className="order-1 md:order-2">
            <h2 className="font-fraunces text-3xl md:text-4xl text-ink mb-6">Behind the brand</h2>
            <p className="text-ink/80 text-lg leading-relaxed mb-6">
              Every piece in our collection starts in our small studio, where we obsess over fit, form, and function. We work closely with ethical manufacturing partners who share our commitment to fair labor and sustainable practices.
            </p>
            <p className="text-ink/80 text-lg leading-relaxed">
              When you wear The Tusk & Trunk, you're not just wearing a garment—you're wearing months of careful prototyping and testing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <div className="bg-butter rounded-3xl p-12 md:p-20 text-center">
          <h2 className="font-fraunces text-3xl md:text-4xl text-ink mb-6">Experience the difference</h2>
          <p className="text-ink/80 text-lg mb-10 max-w-lg mx-auto">
            Explore our latest arrivals and find your new everyday favorites.
          </p>
          <Link 
            to="/shop" 
            className="inline-block bg-ink text-cloud px-10 py-4 rounded-full font-medium text-lg hover:bg-sky hover:text-white transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      </section>

    </div>
  )
}
