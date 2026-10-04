import { createFileRoute } from '@tanstack/react-router'
import { PolicyLayout } from '@/components/site/policy-layout'

export const Route = createFileRoute('/faq')({
  component: FAQPage,
})

function FAQPage() {
  return (
    <PolicyLayout title="Frequently Asked Questions">
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold text-ink mb-2">1. How can I place an order?</h3>
          <p className="text-ink/80 leading-relaxed">You can browse our products, select your preferred product and quantity, add it to your cart, and complete the checkout process using the available payment options.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">2. What payment methods do you accept?</h3>
          <p className="text-ink/80 leading-relaxed">We accept payments through the secure payment methods and payment gateways available on our website at the time of checkout.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">3. How long will it take to receive my order?</h3>
          <p className="text-ink/80 leading-relaxed">Delivery times may vary depending on your location and courier service availability. Please refer to our <strong>Shipping Policy</strong> for detailed information about delivery timelines.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">4. How can I track my order?</h3>
          <p className="text-ink/80 leading-relaxed">Once your order has been shipped, tracking information may be provided through your registered contact details. You can use the tracking information to check the current status of your shipment.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">5. Can I cancel my order after placing it?</h3>
          <p className="text-ink/80 leading-relaxed">Orders may be processed shortly after they are placed. If you need to cancel an order, please contact our customer support team as soon as possible. Cancellation requests are subject to order status and processing conditions.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">6. Do you accept returns or exchanges?</h3>
          <p className="text-ink/80 leading-relaxed">We generally follow a <strong>No Return & No Refund Policy</strong>. Returns or replacements may only be considered in cases where you receive a damaged, defective, or incorrect product, subject to verification.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">7. What should I do if I receive a damaged or incorrect product?</h3>
          <p className="text-ink/80 leading-relaxed">Please contact us within <strong>48 hours</strong> of receiving your order. You may be required to provide your order details, an <strong>unboxing video</strong>, and clear photographs of the product for verification.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">8. Is an unboxing video required for a damaged or incorrect product claim?</h3>
          <p className="text-ink/80 leading-relaxed">Yes. An unboxing video may be required to help us verify the condition of the package and product at the time of delivery.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">9. Can I get a refund if I ordered the wrong product?</h3>
          <p className="text-ink/80 leading-relaxed">Orders generally cannot be returned or refunded due to an incorrect product selection by the customer. Please carefully review the product details before placing your order.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">10. Will the product look exactly like the pictures on the website?</h3>
          <p className="text-ink/80 leading-relaxed">We make every effort to display our products accurately. However, slight differences in colour, texture, or appearance may occur due to photography lighting, screen settings, and individual displays.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">11. What happens if I enter the wrong delivery address?</h3>
          <p className="text-ink/80 leading-relaxed">Please contact our customer support team immediately if you notice an incorrect delivery address. Once an order has been processed or shipped, changes may not be possible.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">12. What if my order is delayed?</h3>
          <p className="text-ink/80 leading-relaxed">Delivery timelines are estimates and may be affected by courier delays, weather conditions, public holidays, location, or other circumstances beyond our control. Please refer to the tracking information provided for the latest shipment status.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">13. Is my payment information secure?</h3>
          <p className="text-ink/80 leading-relaxed">Yes. Payments are processed through secure and trusted payment gateways. <strong>The Tusk and Trunk does not store your complete payment card details</strong>, such as your full card number or CVV.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">14. Do you store my personal information?</h3>
          <p className="text-ink/80 leading-relaxed">We collect and use personal information only when necessary to process orders, provide customer support, improve our services, and fulfil other legitimate business purposes. Please refer to our <strong>Privacy Policy</strong> for more details.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink mb-2">15. How can I contact The Tusk and Trunk?</h3>
          <p className="text-ink/80 leading-relaxed">If you have any questions about your order, products, shipping, or other concerns, please contact the <strong>The Tusk and Trunk Customer Support Team</strong> through our official contact channels.</p>
        </div>
      </div>
    </PolicyLayout>
  )
}
