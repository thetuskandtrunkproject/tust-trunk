import { createFileRoute } from '@tanstack/react-router'
import { PolicyLayout } from '@/components/site/policy-layout'

export const Route = createFileRoute('/policies/terms-conditions')({
  component: TermsConditionsPage,
})

function TermsConditionsPage() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <p className="mb-6">Welcome to <strong>The Tusk and Trunk</strong>. By accessing our website and purchasing our products, you agree to the following Terms & Conditions.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">1. Product Information</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>We make every effort to ensure that product descriptions, images, colours, dimensions, and other information are displayed as accurately as possible.</li>
        <li>Slight variations in colour, texture, appearance, or finish may occur due to photography lighting, product characteristics, and individual screen settings.</li>
        <li>Product measurements and specifications may have minor variations due to manufacturing and production processes.</li>
        <li>Product availability may change without prior notice.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">2. Orders & Payments</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Orders are confirmed only after successful payment.</li>
        <li>Customers are responsible for ensuring that all information provided during checkout, including name, delivery address, email address, and contact number, is accurate and complete.</li>
        <li>The Tusk and Trunk reserves the right to cancel, modify, or refuse any order due to incorrect pricing, product unavailability, suspected fraudulent activity, payment issues, or other unforeseen circumstances.</li>
        <li>If an order is cancelled by The Tusk and Trunk after payment has been successfully received, any applicable refund will be processed through the original payment method or another appropriate method.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">3. Shipping & Delivery</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Orders will be processed and shipped in accordance with our <strong>Shipping Policy</strong>.</li>
        <li>Delivery timelines are estimated and may vary depending on the customer's location, courier availability, weather conditions, public holidays, and other circumstances beyond our reasonable control.</li>
        <li>The Tusk and Trunk is not responsible for delays caused by courier partners, incorrect customer information, natural events, public holidays, or circumstances beyond our reasonable control.</li>
        <li>Customers are responsible for providing accurate delivery information at the time of placing an order.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">4. Returns & Refunds</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>The Tusk and Trunk follows a <strong>No Return & No Refund Policy</strong>, except where a damaged, defective, or incorrect product has been delivered.</li>
        <li>Customers must contact us within <strong>48 hours</strong> of receiving the order for any eligible claim.</li>
        <li>Customers may be required to provide an unboxing video, clear photographs, order details, and other information necessary for verification.</li>
        <li>All return, replacement, or refund requests are subject to verification and approval by The Tusk and Trunk.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">5. Customer Responsibility</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Customers are responsible for reviewing product information, specifications, dimensions, and other relevant details before placing an order.</li>
        <li>Customers must provide accurate contact and delivery information during checkout.</li>
        <li>The Tusk and Trunk will not be responsible for issues resulting from incorrect information provided by the customer.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">6. Intellectual Property</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>All content available on The Tusk and Trunk website, including logos, brand names, product images, photographs, designs, graphics, text, videos, and other brand assets, is owned by or licensed to <strong>The Tusk and Trunk</strong>.</li>
        <li>No content may be copied, reproduced, modified, distributed, published, or used for commercial purposes without prior written permission from The Tusk and Trunk.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">7. Website Usage</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>By using this website, you agree not to engage in any activity that may interfere with the security, functionality, availability, or proper operation of the website.</li>
        <li>You must not attempt to gain unauthorized access to the website, its systems, databases, or services.</li>
        <li>Any misuse of the website may result in restriction or termination of access.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">8. Third-Party Services</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>The website may use third-party services such as payment gateways, courier partners, analytics services, or other service providers.</li>
        <li>The use of such services may be subject to the respective terms and policies of those third parties.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">9. Policy Updates</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>The Tusk and Trunk reserves the right to update, modify, or revise these Terms & Conditions at any time.</li>
        <li>Any changes will be published on this page and will become effective upon posting.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">10. Contact Us</h3>
      <p className="mb-6">For any questions, concerns, or support regarding these Terms & Conditions, please contact the <strong>The Tusk and Trunk Customer Support Team</strong> through our official contact channels.</p>

      <p className="mb-6 font-medium text-sky">Thank you for choosing <strong>The Tusk and Trunk</strong>.</p>
    </PolicyLayout>
  )
}
