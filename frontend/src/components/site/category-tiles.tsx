import { Link } from '@tanstack/react-router'
import menImg from '@/assets/men\'s/Mens-T-shirt-Fit-Mockup.webp'
import womenImg from '@/assets/women/photo-1698651013868-f88728fc4d3e.webp'
import kidsImg from '@/assets/logo_full_hd.png' // using logo as fallback

export function CategoryTiles() {
  const categories = [
    { title: "Men", img: menImg, link: "/shop", search: { category: 'Men' } },
    { title: "Women", img: womenImg, link: "/shop", search: { category: 'Women' } },
    { title: "Kids", img: kidsImg, link: "/shop", search: { category: 'Kids' } },
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-cloud">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.title} 
              to={cat.link}
              search={cat.search}
              className="relative aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden group block"
            >
              <img 
                src={cat.img} 
                alt={cat.title} 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-3xl md:text-4xl text-cloud font-fraunces mb-2">{cat.title}</h3>
                <span className="text-cloud/90 font-medium tracking-wide text-sm uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
                  Shop {cat.title} <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
