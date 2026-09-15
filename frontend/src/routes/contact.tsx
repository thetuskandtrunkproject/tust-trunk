import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useToast } from '@/context/toast-context'
import { submitContactForm } from '@/lib/contact-stub'
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react'

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
      a: "We offer a 30-day easy return policy for all unworn items with original tags attached. Simply initiate a return from your account dashboard."
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
    <div className="min-h-screen bg-cloud pt-12 md:pt-20 pb-24">
      
      {/* Page Header */}
      <section className="container mx-auto px-4 lg:px-8 max-w-4xl text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-fraunces text-4xl md:text-5xl text-ink mb-6">Contact Us</h1>
        <p className="text-lg text-ink/70 max-w-xl mx-auto leading-relaxed">
          Have a question about an order, a product, or just want to say hi? We'd love to hear from you.
        </p>
      </section>

      <section className="container mx-auto px-4 lg:px-8 max-w-6xl mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Contact Form (Left) */}
          <div className="lg:col-span-3 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-ink/5">
            <h2 className="font-fraunces text-2xl text-ink mb-8">Send us a message</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="jane@example.com"
                    className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Subject</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
                  >
                    <option value="" disabled>Select a topic...</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Returns/Exchanges">Returns & Exchanges</option>
                    <option value="Wholesale Inquiry">Wholesale Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Message</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="How can we help?"
                  className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-ink text-cloud py-4 rounded-xl font-medium shadow-lg hover:bg-sky-soft hover:text-ink transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Details (Right) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-sky-soft p-8 rounded-3xl h-full flex flex-col">
              <h3 className="font-fraunces text-2xl text-ink mb-8">Get in touch</h3>
              
              <div className="flex flex-col gap-6 text-ink/80 mb-12">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-sky shrink-0" />
                  <div>
                    <p className="font-medium text-ink mb-1">Email us</p>
                    <a href="mailto:hello@tuskandtrunk.com" className="hover:text-sky transition-colors">hello@tuskandtrunk.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-sky shrink-0" />
                  <div>
                    <p className="font-medium text-ink mb-1">Call us</p>
                    <p>+91 1800 123 4567</p>
                    <p className="text-sm text-ink/60 mt-1">Mon-Fri, 9am - 6pm IST</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-sky shrink-0" />
                  <div>
                    <p className="font-medium text-ink mb-1">Studio</p>
                    <p>123 Creative Avenue, <br/>Koramangala, <br/>Bangalore 560034</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <p className="font-medium text-ink mb-4">Follow us</p>
                <div className="flex gap-4 text-sm">
                  <a href="#" className="hover:text-sky transition-colors font-medium">Instagram</a>
                  <a href="#" className="hover:text-sky transition-colors font-medium">Twitter</a>
                  <a href="#" className="hover:text-sky transition-colors font-medium">Facebook</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <h2 className="font-fraunces text-3xl text-ink mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className="border-b border-ink/10 last:border-0">
                <button 
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-ink/[0.02] transition-colors"
                >
                  <span className="font-medium text-ink">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-ink/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 text-ink/70 leading-relaxed text-sm">
                    {faq.a}
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
