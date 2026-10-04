import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const sections = gsap.utils.toArray('.reveal-section') as HTMLElement[]
    
    sections.forEach((section, i) => {
      gsap.fromTo(section,
        { 
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            toggleActions: "play none none none"
          }
        }
      )
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-cloud pt-20 md:pt-32 pb-24 overflow-hidden relative font-sans">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#F2F9FF] to-transparent pointer-events-none"></div>

      {/* Page Header */}
      <section className="container mx-auto px-4 lg:px-8 max-w-4xl text-center mb-24 reveal-section relative z-10">
        <h1 className="font-heading font-bold text-5xl md:text-7xl text-ink mb-6 tracking-tight">Contact Us</h1>
        <p className="text-lg md:text-xl text-ink/60 max-w-2xl mx-auto font-medium leading-relaxed">
          We're here to help. Whether you have a question about an order, need sizing advice, or want to explore wholesale opportunities, reach out to us.
        </p>
      </section>

      {/* Contact Cards Grid */}
      <section className="container mx-auto px-4 lg:px-8 max-w-6xl mb-24 reveal-section relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Email Card */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-ink/5 flex flex-col group hover:-translate-y-2 transition-all duration-300 ease-out">
            <div className="w-16 h-16 bg-[#F2F9FF] rounded-2xl flex items-center justify-center text-sky mb-8 group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-ink mb-3">Email Support</h3>
            <p className="text-ink/60 font-medium mb-8 leading-relaxed flex-grow">
              Send us an email anytime. Our support team typically responds within 24 hours.
            </p>
            <a href="mailto:hello@tuskandtrunk.com" className="inline-flex items-center gap-2 font-bold text-sky hover:text-ink transition-colors group/link">
              hello@tuskandtrunk.com
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Phone Card */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-ink/5 flex flex-col group hover:-translate-y-2 transition-all duration-300 ease-out">
            <div className="w-16 h-16 bg-[#F2F9FF] rounded-2xl flex items-center justify-center text-sky mb-8 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-ink mb-3">Call Us</h3>
            <p className="text-ink/60 font-medium mb-8 leading-relaxed flex-grow">
              Speak directly with our team. We're available Monday through Friday, 9am - 6pm IST.
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-bold text-ink text-lg">+91 1800 123 4567</p>
              <p className="font-bold text-ink text-lg">+91 94434 60663</p>
            </div>
          </div>

          {/* Studio Card */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-ink/5 flex flex-col group hover:-translate-y-2 transition-all duration-300 ease-out">
            <div className="w-16 h-16 bg-[#F2F9FF] rounded-2xl flex items-center justify-center text-sky mb-8 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-ink mb-3">Our Studio</h3>
            <p className="text-ink/60 font-medium mb-8 leading-relaxed flex-grow">
              No: 23, Muthaiyan Kovil, 4th Street, 60 Feet Road, Vellaiyan Kadu, Tirupur - 641 604
            </p>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-sky hover:text-ink transition-colors group/link">
              Get Directions
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>
      </section>

      {/* Map Section */}
      <section className="container mx-auto px-4 lg:px-8 max-w-6xl reveal-section">
        <div className="w-full h-[400px] md:h-[500px] bg-ink/5 rounded-[2rem] overflow-hidden relative shadow-sm border border-ink/5">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15655.454261763784!2d77.3444!3d11.1085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907b8b4b00001%3A0x8b0b8b0b8b0b8b0b!2sTiruppur%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Tusk and Trunk Studio Location"
            className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-1000"
          ></iframe>
        </div>
      </section>

    </div>
  )
}

