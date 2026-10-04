import { createFileRoute } from '@tanstack/react-router'
import { PolicyLayout } from '@/components/site/policy-layout'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/faq')({
  component: FAQPage,
})

function FAQPage() {
  const faqs = [
    {
      q: "1. How can I place an order?",
      a: "You can browse our products, select your preferred product and quantity, add it to your cart, and complete the checkout process using the available payment options."
    },
    {
      q: "2. What payment methods do you accept?",
      a: "We accept payments through the secure payment methods and payment gateways available on our website at the time of checkout."
    },
    {
      q: "3. How long will it take to receive my order?",
      a: "Delivery times may vary depending on your location and courier service availability. Please refer to our Shipping Policy for detailed information about delivery timelines."
    },
    {
      q: "4. How can I track my order?",
      a: "Once your order has been shipped, tracking information may be provided through your registered contact details. You can use the tracking information to check the current status of your shipment."
    },
    {
      q: "5. Can I cancel my order after placing it?",
      a: "Orders may be processed shortly after they are placed. If you need to cancel an order, please contact our customer support team as soon as possible. Cancellation requests are subject to order status and processing conditions."
    },
    {
      q: "6. Do you accept returns or exchanges?",
      a: "We generally follow a No Return & No Refund Policy. Returns or replacements may only be considered in cases where you receive a damaged, defective, or incorrect product, subject to verification."
    },
    {
      q: "7. What should I do if I receive a damaged or incorrect product?",
      a: "Please contact us within 48 hours of receiving your order. You may be required to provide your order details, an unboxing video, and clear photographs of the product for verification."
    },
    {
      q: "8. Is an unboxing video required for a damaged or incorrect product claim?",
      a: "Yes. An unboxing video may be required to help us verify the condition of the package and product at the time of delivery."
    },
    {
      q: "9. Can I get a refund if I ordered the wrong product?",
      a: "Orders generally cannot be returned or refunded due to an incorrect product selection by the customer. Please carefully review the product details before placing your order."
    },
    {
      q: "10. Will the product look exactly like the pictures on the website?",
      a: "We make every effort to display our products accurately. However, slight differences in colour, texture, or appearance may occur due to photography lighting, screen settings, and individual displays."
    },
    {
      q: "11. What happens if I enter the wrong delivery address?",
      a: "Please contact our customer support team immediately if you notice an incorrect delivery address. Once an order has been processed or shipped, changes may not be possible."
    },
    {
      q: "12. What if my order is delayed?",
      a: "Delivery timelines are estimates and may be affected by courier delays, weather conditions, public holidays, location, or other circumstances beyond our control. Please refer to the tracking information provided for the latest shipment status."
    },
    {
      q: "13. Is my payment information secure?",
      a: "Yes. Payments are processed through secure and trusted payment gateways. The Tusk and Trunk does not store your complete payment card details, such as your full card number or CVV."
    },
    {
      q: "14. Do you store my personal information?",
      a: "We collect and use personal information only when necessary to process orders, provide customer support, improve our services, and fulfil other legitimate business purposes. Please refer to our Privacy Policy for more details."
    },
    {
      q: "15. How can I contact The Tusk and Trunk?",
      a: "If you have any questions about your order, products, shipping, or other concerns, please contact the The Tusk and Trunk Customer Support Team through our official contact channels."
    }
  ]

  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <PolicyLayout title="Frequently Asked Questions">
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-sky text-white' : 'bg-cloud text-ink/40 group-hover:bg-ink/5 shrink-0 ml-4'}`}>
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
    </PolicyLayout>
  )
}
