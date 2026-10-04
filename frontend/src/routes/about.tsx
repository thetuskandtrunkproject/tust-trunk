import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'
import logoImg from '@/assets/New_logo.png'
import { Droplets, Sparkles, ShieldCheck, Leaf, Heart, Star, Sun, Moon, Zap } from 'lucide-react'
import { ReadingProgress } from '@/components/ui/reading-progress'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { api } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

const IconMap: Record<string, any> = {
  'leaf': Leaf, 'heart': Heart, 'shield-check': ShieldCheck,
  'star': Star, 'sun': Sun, 'moon': Moon, 'zap': Zap, 'droplets': Droplets, 'sparkles': Sparkles
}

function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cmsData, setCmsData] = useState<any>(null)

  useEffect(() => {
    api.get('/cms/about-page').then(res => setCmsData(res.data)).catch(console.error)
  }, [])

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

  if (!cmsData) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-cloud pb-24 overflow-hidden">
      <ReadingProgress />
      
      {/* Hero / Intro */}
      <section className="bg-gradient-to-br from-mint/20 via-sky/10 to-cloud pt-20 pb-24 lg:pt-32 lg:pb-32 px-4 lg:px-8 mb-24 rounded-b-[3rem] relative z-10 reveal-section">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-8">
            <img src={logoImg} alt="The Tusk & Trunk" className="h-20 md:h-24 drop-shadow-sm" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-7xl text-ink mb-6 leading-tight whitespace-pre-line">
            {cmsData.introHeadline}
          </h1>
          <p className="text-lg md:text-xl text-ink/70 max-w-2xl mx-auto font-medium leading-relaxed">
            {cmsData.introSubline}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 lg:px-8 max-w-3xl mb-32 reveal-section">
        <h2 className="font-heading font-bold text-4xl text-ink mb-8 text-center md:text-left">{cmsData.storyHeadline}</h2>
        <div className="space-y-6 text-ink/70 font-sans text-lg md:text-xl leading-relaxed font-medium">
          {cmsData.storyParagraphs?.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* What we stand for (Values) */}
      <section className="bg-white border-y border-ink/5 py-24 mb-32 reveal-section">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl text-ink mb-4">{cmsData.valuesHeadline}</h2>
            <p className="text-ink/60 font-medium text-lg max-w-xl mx-auto">{cmsData.valuesSubline}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {cmsData.values?.map((v: any, i: number) => {
              const Icon = IconMap[v.icon] || Star
              // For custom tailwind classes from CMS we might need raw style if arbitrary, or just hope it matches safelist. 
              // Since we are using standard colors, bg-sky-soft/30 might not compile if dynamically constructed.
              // We will just apply them as classes if they are standard.
              return (
                <div key={i} className={`flex flex-col items-center text-center p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 ${v.bgColor.startsWith('#') ? '' : v.bgColor}`} style={v.bgColor.startsWith('#') ? { backgroundColor: v.bgColor } : {}}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${v.iconBgColor.startsWith('#') ? '' : v.iconBgColor}`} style={v.iconBgColor.startsWith('#') ? { backgroundColor: v.iconBgColor } : {}}>
                    <Icon className="w-10 h-10 text-ink" />
                  </div>
                  <h3 className="font-heading font-bold text-ink text-2xl mb-3">{v.label}</h3>
                  <p className="text-ink/70 font-medium leading-relaxed">
                    {v.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Behind the Brand */}
      <section className="container mx-auto px-4 lg:px-8 max-w-6xl mb-32 reveal-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="order-2 md:order-1 relative space-y-8">
            <div className="aspect-[4/5] bg-ink/5 rounded-[2.5rem] overflow-hidden shadow-sm relative z-10 border-4 border-white">
              <img 
                src={cmsData.brandImage1} 
                alt="Our design process" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="aspect-square bg-ink/5 rounded-[2.5rem] overflow-hidden shadow-sm relative z-10 w-4/5 ml-auto border-4 border-white -mt-20">
              <img 
                src={cmsData.brandImage2} 
                alt="Our materials" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute top-20 -right-8 w-1/2 aspect-square bg-sunshine rounded-full -z-0 hidden md:block mix-blend-multiply blur-2xl opacity-60"></div>
            <div className="absolute bottom-10 -left-8 w-2/3 aspect-square bg-coral/30 rounded-full -z-0 hidden md:block mix-blend-multiply blur-2xl opacity-60"></div>
          </div>
          
          <div className="order-1 md:order-2 md:sticky md:top-32 pt-10">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-ink mb-6">{cmsData.brandHeadline}</h2>
            {cmsData.brandParagraphs?.map((p: string, i: number) => (
              <p key={i} className="text-ink/70 text-lg font-medium leading-relaxed mb-6">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="container mx-auto px-4 lg:px-8 max-w-5xl reveal-section">
        <div className="rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-sm" style={{ backgroundColor: cmsData.ctaBgColor }}>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sunshine/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-ink mb-6">{cmsData.ctaHeadline}</h2>
            <p className="text-ink/70 font-medium text-lg md:text-xl mb-10 max-w-lg mx-auto">
              {cmsData.ctaSubline}
            </p>
            <Link 
              to={cmsData.ctaButtonLink} 
              style={{ backgroundColor: cmsData.ctaButtonBgColor, color: cmsData.ctaButtonTextColor }}
              className="inline-block px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all"
            >
              {cmsData.ctaButtonText}
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

