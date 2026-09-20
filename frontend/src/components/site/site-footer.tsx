import { Link } from '@tanstack/react-router'
import logoImg from '@/assets/logo_full_hd.png'

export function SiteFooter() {
  return (
    <footer className="w-full bg-cloud border-t border-ink/10 pt-16 md:pt-24 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-1 md:col-span-1">
            <img src={logoImg} alt="The Tusk & Trunk" className="w-32 mb-6" />
            <p className="text-ink/70 text-sm max-w-xs mb-6">
              Premium essentials crafted for everyday living. Designed with care, made for comfort.
            </p>
            <div className="flex gap-4 text-ink font-medium text-sm">
              <a href="#" className="hover:text-sky transition-colors">Instagram</a>
              <a href="#" className="hover:text-sky transition-colors">Twitter</a>
              <a href="#" className="hover:text-sky transition-colors">Facebook</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading text-xl text-ink mb-6">Shop</h4>
            <ul className="space-y-4 text-ink/80 text-sm font-medium">
              <li><Link to="/shop" search={{ sort: 'newest' }} className="hover:text-sky transition-colors">New In</Link></li>
              <li><Link to="/shop" search={{ gender: 'Women' }} className="hover:text-sky transition-colors">Women</Link></li>
              <li><Link to="/shop" search={{ gender: 'Kids' }} className="hover:text-sky transition-colors">Kids</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading text-xl text-ink mb-6">Help</h4>
            <ul className="space-y-4 text-ink/80 text-sm font-medium">
              <li><Link to="/contact" className="hover:text-sky transition-colors">Contact Us</Link></li>
              <li><Link to="/" className="hover:text-sky transition-colors">Shipping Info</Link></li>
              <li><Link to="/" className="hover:text-sky transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/" className="hover:text-sky transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading text-xl text-ink mb-6">Company</h4>
            <ul className="space-y-4 text-ink/80 text-sm font-medium">
              <li><Link to="/about" className="hover:text-sky transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-sky transition-colors">Sustainability</Link></li>
              <li><Link to="/" className="hover:text-sky transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-sky transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-ink/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink/60 font-medium">
          <p>&copy; {new Date().getFullYear()} The Tusk & Trunk. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
