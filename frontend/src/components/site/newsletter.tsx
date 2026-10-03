import { Sparkles, Heart, Shield, Leaf } from 'lucide-react'

export function Newsletter() {
  return (
    <section className="w-full py-20 md:py-28 bg-coral/20 px-4 relative overflow-hidden">
      {/* Playful background accents with smooth blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cloud rounded-full opacity-60 blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sunshine rounded-full opacity-30 blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      
      <div className="container mx-auto max-w-6xl text-center relative z-10">
        <h2 className="font-heading text-4xl md:text-5xl text-ink font-bold mb-4">
          Crafted with Love for Little Ones
        </h2>
        <p className="text-ink/70 text-base md:text-lg mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
          At Tusk & Trunk, every piece is thoughtfully designed with soft, skin-friendly fabrics — 
          because your kids deserve comfort that lasts all day long.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Card 1 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-sky-soft/60 text-[#3A9EBF] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#7EC8E3] group-hover:text-white transition-all duration-500">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-3">100% Cotton</h3>
            <p className="text-ink/60 text-sm font-medium leading-relaxed">
              Breathable, natural fibers that keep your little one cool and comfortable all day.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE8EC] text-cta flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-coral group-hover:text-white transition-all duration-500">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-3">Gentle on Skin</h3>
            <p className="text-ink/60 text-sm font-medium leading-relaxed">
              Hypoallergenic materials thoughtfully chosen to protect delicate, sensitive skin.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5D1] text-[#D4A017] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#FFD93D] group-hover:text-white transition-all duration-500">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-3">Playful Designs</h3>
            <p className="text-ink/60 text-sm font-medium leading-relaxed">
              Vibrant colors and fun patterns that spark joy and encourage creativity.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] text-[#4CAF50] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#4CAF50] group-hover:text-white transition-all duration-500">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-3">Safe & Tested</h3>
            <p className="text-ink/60 text-sm font-medium leading-relaxed">
              Rigorously tested to meet the highest safety standards for your peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


