import { Truck, RefreshCcw, ShieldCheck, Tag } from 'lucide-react'

export function TrustStrip() {
  const items = [
    { icon: Truck, text: 'Free Shipping over RS:3000' },
    { icon: RefreshCcw, text: '30-Day Easy Returns' },
    { icon: ShieldCheck, text: 'Secure Checkout' },
    { icon: Tag, text: 'Festival Offer - 20% Off' },
  ]

  return (
    <div className="w-full bg-ink text-cloud py-6 md:py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 text-center">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <item.icon className="w-6 h-6 text-blush" />
              <span className="text-sm font-medium tracking-wide">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
