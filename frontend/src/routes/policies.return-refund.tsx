import { createFileRoute } from '@tanstack/react-router'
import { PolicyLayout } from '@/components/site/policy-layout'

export const Route = createFileRoute('/policies/return-refund')({
  component: ReturnRefundPolicyPage,
})

function ReturnRefundPolicyPage() {
  return (
    <PolicyLayout title="Return & Refund Policy">
      <p className="mb-6">At <strong>The Tusk and Trunk</strong>, every order is carefully inspected and packed to ensure that you receive products of the highest quality.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">No Return & No Refund Policy</h3>
      <p className="mb-6 text-coral font-medium">We do <strong>not accept returns, exchanges, or offer refunds</strong> once an order has been placed, except in cases where you receive a <strong>damaged, defective, or incorrect product</strong>.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Damaged, Defective, or Incorrect Orders</h3>
      <p className="mb-4">If you receive a damaged, defective, or incorrect product:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Please contact us within <strong>48 hours</strong> of receiving your order.</li>
        <li>Share your <strong>order details</strong>, along with an <strong>unboxing video</strong> and <strong>clear photographs</strong> of the product.</li>
        <li>The unboxing video should clearly show the package and the product received.</li>
        <li>Our support team will review your request and guide you through the next steps.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Important Notes</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Slight variations in product colour may occur due to photography lighting, screen resolution, or individual display settings.</li>
        <li>Product dimensions, appearance, texture, and other characteristics may have minor variations.</li>
        <li>Customers are advised to carefully review the product details before placing an order.</li>
        <li>Products that have been used, altered, damaged, or otherwise handled after delivery may not be eligible for a return, exchange, or refund claim.</li>
        <li>Any claim submitted without the required information or supporting evidence may not be considered.</li>
      </ul>

      <p className="mb-6">At <strong>The Tusk and Trunk</strong>, we are committed to providing quality products and a reliable shopping experience. We sincerely appreciate your trust, understanding, and continued support.</p>
      
      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Contact Us</h3>
      <p className="mb-6">For any questions or concerns regarding returns or refunds, please contact the <strong>The Tusk and Trunk Customer Support Team</strong> through our official contact channels.</p>
    </PolicyLayout>
  )
}
