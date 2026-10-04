import { createFileRoute } from '@tanstack/react-router'
import { PolicyLayout } from '@/components/site/policy-layout'

export const Route = createFileRoute('/policies/shipping')({
  component: ShippingPolicyPage,
})

function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy">
      <h3 className="text-xl font-bold text-ink mt-8 mb-4">1. Order Processing</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>All orders are processed after successful payment confirmation.</li>
        <li>Orders are generally processed within 1–3 business days.</li>
        <li>Orders placed on Sundays or public holidays will be processed on the next working day.</li>
        <li>During sale periods, festive seasons, launches, or high-volume periods, processing may take a little longer.</li>
        <li>Once your order has been dispatched, you will receive the shipping/tracking details through the contact information provided at checkout.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">2. Delivery Time</h3>
      <p className="mb-4">Delivery timelines depend on the destination and courier service.</p>
      <p className="font-semibold mb-2">Estimated delivery:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Tamil Nadu: 1–3 business days</li>
        <li>Other parts of India: 3–7 business days</li>
        <li>Remote locations: Delivery may take additional time.</li>
      </ul>
      <p className="mb-6">These are estimated timelines and may vary due to courier delays, weather conditions, public holidays, or other circumstances beyond our control.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">3. Shipping Charges</h3>
      <p className="mb-4">Shipping charges will be calculated at checkout based on the order value, package weight and delivery location.</p>
      <p className="mb-6 font-medium text-sky">Enjoy free shipping on orders above ₹1999</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">4. Tracking Your Order</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Once your order is dispatched, tracking details will be shared with you.</li>
        <li>You can use the tracking information to follow your shipment directly through the respective courier service.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">5. Incorrect Address / Contact Details</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Please make sure your delivery address, phone number and PIN code are correct before placing your order.</li>
        <li>The Tusk and Trunk will not be responsible for delays or failed deliveries caused by an incorrect or incomplete address or unavailable contact number.</li>
        <li>If a parcel is returned to us because of an incorrect address, failed delivery attempts or refusal to accept the package, additional shipping charges may apply for re-dispatch.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">6. Delayed Delivery</h3>
      <p className="mb-4">While we work with reliable courier partners, delivery delays can occasionally occur due to:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Weather conditions</li>
        <li>Transport disruptions</li>
        <li>Festivals/public holidays</li>
        <li>Natural events</li>
        <li>Remote-area delivery</li>
        <li>Courier operational issues</li>
        <li>Other circumstances beyond our control</li>
      </ul>
      <p className="mb-6">We will assist you in tracking delayed shipments and coordinate with the courier where possible.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">7. Damaged Package</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>If your package appears visibly damaged or tampered with at the time of delivery, please take photographs/video before opening the package and contact us as soon as possible.</li>
        <li>For damaged, defective or incorrect products, customers should contact us within 48 hours of delivery with clear photographs/videos and order details.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">8. Delivery Confirmation</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Once the courier records the package as delivered to the address provided by the customer, the shipment will be considered delivered.</li>
        <li>If you have not received the package despite the tracking status showing "Delivered", please contact us immediately so that we can raise the matter with the courier.</li>
      </ul>
    </PolicyLayout>
  )
}
