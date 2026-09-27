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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await submitContactForm(formData)
    
    showToast("Message sent! We'll get back to you soon.")
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  // FAQ Data
  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard shipping typically takes 3-5 business days within India. Express shipping options are available at checkout for 1-2 day delivery."
    },
    {
      q: "What is your return policy?",
      a: "As part of our commitment to hygiene and product quality, we do not offer returns or exchanges on any items. Please review the size guide carefully before placing an order."
    },
    {
      q: "How can I track my order?",
      a: "Once your order ships, you'll receive an email with a tracking link. You can also view the live status of your order in the Order History section of your account."
    },
    {
      q: "Do you offer wholesale?",
      a: "Yes, we do! Please select 'Wholesale Inquiry' in the contact form subject and provide details about your store."
    }
  ]

  // Accordion Component for FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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

      <section className="container mx-auto px-4 lg:px-8 max-w-6xl mb-32 reveal-section relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-stretch">
          
          {/* Contact Form (Left) */}
          <div className="lg:col-span-3 bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-white flex flex-col">
            <h2 className="font-heading font-bold text-3xl text-ink mb-8">Send us a message</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="w-full bg-white border-2 border-ink/10 rounded-2xl px-6 py-4 text-ink font-medium placeholder:text-ink/30 focus:border-peach focus:ring-0 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="jane@example.com"
                    className="w-full bg-white border-2 border-ink/10 rounded-2xl px-6 py-4 text-ink font-medium placeholder:text-ink/30 focus:border-peach focus:ring-0 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2 ml-2">Subject</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-white border-2 border-ink/10 rounded-2xl px-6 py-4 text-ink font-medium focus:border-peach focus:ring-0 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a topic...</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Sizing">Sizing & Fit</option>
                    <option value="Wholesale Inquiry">Wholesale Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-ink/40 pointer-events-none" />
                </div>
              </div>

              <div className="flex-grow flex flex-col">
                <label className="block text-sm font-bold text-ink mb-2 ml-2">Message</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="How can we help?"
                  className="w-full flex-grow bg-white border-2 border-ink/10 rounded-2xl px-6 py-4 text-ink font-medium placeholder:text-ink/30 focus:border-peach focus:ring-0 outline-none transition-colors resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-coral text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-coral/90 transition-all mt-4 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Details (Right) */}
          <div className="lg:col-span-2 flex flex-col gap-8 h-full">
            <div className="bg-sky-soft/40 backdrop-blur-md p-8 sm:p-12 rounded-[2.5rem] h-full flex flex-col shadow-sm border border-white">
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
                  <a href="#" className="font-bold text-sky hover:text-coral transition-colors">Instagram</a>
                  <a href="#" className="font-bold text-sky hover:text-coral transition-colors">Twitter</a>
                  <a href="#" className="font-bold text-sky hover:text-coral transition-colors">Facebook</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 lg:px-8 max-w-4xl reveal-section relative z-10">
        <h2 className="font-heading font-bold text-4xl text-ink mb-10 text-center">Frequently Asked Questions</h2>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 transition-colors duration-300 ${isOpen ? 'border-sky-soft/50' : 'border-ink/5 hover:border-ink/10'}`}
              >
                <button 
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-sky' : 'text-ink group-hover:text-ink/80'}`}>{faq.q}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-sky text-white' : 'bg-cloud text-ink/40 group-hover:bg-ink/5'}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-8 pb-8 pt-2 text-ink/70 leading-relaxed font-medium text-lg">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
