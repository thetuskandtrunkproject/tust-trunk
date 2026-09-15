import { Link } from '@tanstack/react-router'

export function Hero() {
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
      title: "The Summer Drop ",
      subtitle: "Breeze through the season in our lightest fabrics.",
      cta: "Shop Women",
      align: "left"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=2000&auto=format&fit=crop",
      title: "Everyday Essentials",
      subtitle: "Premium basics that never go out of style.",
      cta: "Shop Men",
      align: "center"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=2000&auto=format&fit=crop",
      title: "New Generation",
      subtitle: "Comfortable styles for the little ones.",
      cta: "Shop Kids",
      align: "left"
    }
  ]

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] min-h-[500px] overflow-hidden bg-cloud">
      <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-full shrink-0 snap-center">
            <img 
              src={slide.image} 
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-ink/30 md:bg-transparent md:bg-gradient-to-r from-ink/70 via-ink/20 to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-24">
              <div className={`w-full max-w-2xl ${slide.align === 'center' ? 'mx-auto text-center md:bg-ink/30 md:p-8 md:rounded-3xl md:backdrop-blur-sm' : ''}`}>
                <h2 className="font-fraunces text-5xl md:text-7xl lg:text-8xl text-cloud leading-[1.05] mb-4 drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-2xl text-cloud/90 mb-8 drop-shadow-sm font-medium">
                  {slide.subtitle}
                </p>
                <Link to="/" className="inline-block bg-cloud text-ink px-10 py-4 rounded-full font-medium hover:bg-sky-soft transition-colors text-lg shadow-xl">
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Scroll indicator dots (visual only for CSS snap) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 pointer-events-none">
        {slides.map((s, i) => (
          <div key={s.id} className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-cloud' : 'bg-cloud/40'}`}></div>
        ))}
      </div>
    </section>
  )
}
