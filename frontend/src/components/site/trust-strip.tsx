import { Truck, RefreshCcw, ShieldCheck, Tag } from 'lucide-react'

export function TrustStrip() {
  const items = [
    { icon: Truck, text: 'Free Shipping over RS:3000', color: 'bg-cloud text-ink' },
    { icon: RefreshCcw, text: '30-Day Easy Returns', color: 'bg-mint text-ink' },
    { icon: ShieldCheck, text: 'Secure Checkout', color: 'bg-sunshine text-ink' },
    { icon: Tag, text: 'Festival Offer - 20% Off', color: 'bg-watermelon text-white' },
  ]

  return (
    <div className="w-full bg-sky py-10 md:py-16 border-y border-ink/5">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-4 group">
              <div className={`p-4 rounded-full ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <item.icon className="w-8 h-8" />
              </div>
              <span className="text-sm md:text-base font-bold tracking-wide text-ink">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

