import { Link } from '@tanstack/react-router'
import logoImg from '@/assets/New_logo.png'

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
)

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
)

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
)

// Icon for Whatsapp
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

export function SiteFooter() {
  return (
    <footer className="w-full bg-sky-soft/50 text-ink pt-16 md:pt-20 pb-8 mt-auto">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* Column 1: Info & Map */}
          <div className="col-span-1 md:col-span-5 space-y-6">
            <div className="bg-white p-3 rounded-2xl inline-block">
              <img src={logoImg} alt="The Tusk & Trunk" className="w-24 h-auto object-contain" />
            </div>
            <p className="text-sm md:text-base text-ink/80 leading-relaxed font-medium max-w-sm">
              Everyday essentials, crafted with care. Comfort and quality for your whole family.
            </p>
            
            <div className="space-y-1 text-sm md:text-base text-ink/80">
              <p><strong>Store:</strong> No : 23, Muthaiyan Kovil,</p>
              <p>4th Street 60 Feet Road,</p>
              <p>Vellaiyan Kadu, Tirupur - 641 604.</p>
              <p className="pt-2"><strong>Mob:</strong> <a href="tel:+918220127475" className="hover:text-sky">+91 82201 27475</a></p>
              <p><strong>WA:</strong> <a href="https://wa.me/919443460663" className="hover:text-sky" target="_blank" rel="noreferrer">+91 94434 60663</a></p>
            </div>

            <div className="w-full h-32 md:h-40 rounded-xl overflow-hidden border border-ink/10 mt-4 max-w-md">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15654.542792875323!2d77.3486333!3d11.1396262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907481ba9dcdb%3A0x63321db8d46db1d!2sTiruppur%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1716301234567!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="flex gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 hover:text-sky transition-colors"><InstagramIcon /></a>
              <a href="https://wa.me/919443460663" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 hover:text-sky transition-colors"><WhatsAppIcon /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 hover:text-sky transition-colors"><FacebookIcon /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 hover:text-sky transition-colors"><YoutubeIcon /></a>
            </div>
          </div>
          
          {/* Nav Columns Wrapper */}
          <div className="col-span-1 md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Shop Column */}
            <div>
              <h4 className="font-heading font-bold text-xl text-ink mb-6">Shop</h4>
              <ul className="space-y-4 text-ink/80 text-base font-medium">
                <li><Link to="/shop" className="hover:text-sky transition-colors">All Products</Link></li>
                <li><Link to="/shop" search={{ sort: 'newest' }} className="hover:text-sky transition-colors">New Arrivals</Link></li>
                <li><Link to="/shop" search={{ gender: 'Women' }} className="hover:text-sky transition-colors">Women</Link></li>
                <li><Link to="/shop" search={{ gender: 'Kids' }} className="hover:text-sky transition-colors">Kids</Link></li>
                <li><Link to="/shop" search={{ tag: 'Sale' }} className="hover:text-sky transition-colors">Offers</Link></li>
              </ul>
            </div>
            
            {/* Help Column */}
            <div>
              <h4 className="font-heading font-bold text-xl text-ink mb-6">Help</h4>
              <ul className="space-y-4 text-ink/80 text-base font-medium">
                <li><Link to="/faq" className="hover:text-sky transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-sky transition-colors">Contact us</Link></li>
              </ul>
            </div>
            
            {/* Policies Column */}
            <div>
              <h4 className="font-heading font-bold text-xl text-ink mb-6">Policies</h4>
              <ul className="space-y-4 text-ink/80 text-base font-medium">
                <li><Link to="/policies/shipping" className="hover:text-sky transition-colors">Shipping Policy</Link></li>
                <li><Link to="/policies/return-refund" className="hover:text-sky transition-colors">Return & Refund</Link></li>
                <li><Link to="/policies/terms-conditions" className="hover:text-sky transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/policies/privacy" className="hover:text-sky transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

        </div>
        
        <div className="pt-8 border-t border-ink/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink/60 font-medium text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} The Tusk & Trunk. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
