import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useToast } from '@/context/toast-context'
import { submitContactForm } from '@/lib/contact-stub'
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const { showToast } = useToast()
  const { showToast } = useToast()

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
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-sky/10 via-cloud to-cloud pt-16 md:pt-24 pb-24 overflow-hidden relative">
      
      {/* Decorative Blobs */}
      <div className="absolute top-40 left-10 w-64 h-64 bg-sunshine rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-80 right-10 w-64 h-64 bg-mint rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Page Header */}
      <section className="container mx-auto px-4 lg:px-8 max-w-4xl text-center mb-20 reveal-section relative z-10">
        <h1 className="font-heading font-bold text-5xl md:text-6xl text-ink mb-6 drop-shadow-sm">Contact Us</h1>
        <p className="text-lg md:text-xl text-ink/70 max-w-xl mx-auto font-medium leading-relaxed">
          Have a question about an order, a product, or just want to say hi? We'd love to hear from you.
        </p>
      </section>

      <section className="container mx-auto px-4 lg:px-8 max-w-4xl mb-32 reveal-section relative z-10 flex justify-center">
        
          {/* Contact Details */}
          <div className="w-full max-w-2xl flex flex-col gap-8 h-full">
            <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] h-full flex flex-col shadow-xl border border-white">
              <h3 className="font-heading font-bold text-3xl text-ink mb-10">Get in touch</h3>
              
              <div className="flex flex-col gap-8 text-ink/80 mb-12 flex-grow">
                <div className="flex items-start gap-5 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-sky shadow-sm shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-ink mb-1 text-lg">Email us</p>
                    <a href="mailto:hello@tuskandtrunk.com" className="font-medium hover:text-sky transition-colors text-lg">hello@tuskandtrunk.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-mint shadow-sm shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-ink mb-1 text-lg">Call us</p>
                    <p className="font-medium text-lg">+91 1800 123 4567</p>
                    <p className="text-sm font-medium text-ink/60 mt-1">Mon-Fri, 9am - 6pm IST</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-sunshine shadow-sm shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-ink mb-1 text-lg">Studio</p>
                    <p className="font-medium leading-relaxed">123 Creative Avenue, <br/>Koramangala, <br/>Bangalore 560034</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-white/50 p-6 rounded-3xl">
                <p className="font-bold text-ink mb-4 text-center">Follow us</p>
                <div className="flex justify-center gap-6 text-base">
                  <a href="#" className="font-bold text-sky hover:text-cta transition-colors">Instagram</a>
                  <a href="#" className="font-bold text-sky hover:text-cta transition-colors">Twitter</a>
                  <a href="#" className="font-bold text-sky hover:text-cta transition-colors">Facebook</a>
                </div>
              </div>
            </div>
            </div>
          </div>
      </section>

    </div>
  )
}

