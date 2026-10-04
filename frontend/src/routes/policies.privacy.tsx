import { createFileRoute } from '@tanstack/react-router'
import { PolicyLayout } from '@/components/site/policy-layout'

export const Route = createFileRoute('/policies/privacy')({
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p className="mb-6">At <strong>The Tusk and Trunk</strong>, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, interact with our services, or make a purchase.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Information We Collect</h3>
      <p className="mb-4">When you place an order or interact with our website, we may collect the following information:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Name</li>
        <li>Contact Number</li>
        <li>Email Address</li>
        <li>Shipping and Billing Address</li>
        <li>Order Details</li>
        <li>Payment and transaction information</li>
        <li>Website usage and browsing information</li>
        <li>Any information you voluntarily provide when contacting our customer support team</li>
      </ul>
      <p className="mb-6">Payment information is processed securely through trusted third-party payment providers.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">How We Use Your Information</h3>
      <p className="mb-4">We may use your information to:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Process and fulfil your orders.</li>
        <li>Arrange shipping and delivery.</li>
        <li>Provide customer support and assistance.</li>
        <li>Send order confirmations, delivery updates, and important notifications.</li>
        <li>Process payments and related transactions.</li>
        <li>Improve our products, services, website functionality, and customer experience.</li>
        <li>Detect and prevent fraudulent or unauthorized activities.</li>
        <li>Send information about new products, collections, offers, or promotions where you have opted to receive such communications.</li>
      </ul>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Payment Security</h3>
      <p className="mb-4">Payments made through our website are processed through secure and trusted payment gateways.</p>
      <p className="mb-4"><strong>The Tusk and Trunk does not store your complete payment card details</strong>, including full card numbers, CVV numbers, or banking credentials, unless otherwise required and lawfully permitted.</p>
      <p className="mb-6">Payment providers may collect and process payment information in accordance with their own privacy policies and security practices.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Sharing of Information</h3>
      <p className="mb-4">We do <strong>not sell, rent, or trade your personal information</strong>.</p>
      <p className="mb-4">Your information may be shared with trusted third-party service providers where necessary to provide our services, including:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Payment gateway providers</li>
        <li>Courier and logistics partners</li>
        <li>Website and technology service providers</li>
        <li>Customer support or operational service providers</li>
      </ul>
      <p className="mb-6">These third parties may only receive the information necessary to perform the relevant service.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Cookies</h3>
      <p className="mb-4">Our website may use cookies and similar technologies to:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Improve website functionality.</li>
        <li>Understand how visitors use our website.</li>
        <li>Remember user preferences.</li>
        <li>Improve the overall browsing experience.</li>
        <li>Analyse website performance.</li>
      </ul>
      <p className="mb-6">You may be able to control or disable cookies through your browser settings. Disabling certain cookies may affect some website functionality.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Data Protection</h3>
      <p className="mb-4">We take reasonable administrative, technical, and organizational measures to protect your personal information from unauthorized access, misuse, alteration, loss, or disclosure.</p>
      <p className="mb-6">However, no method of transmitting or storing information online can be guaranteed to be completely secure.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Data Retention</h3>
      <p className="mb-4">We may retain personal information for as long as necessary to fulfil the purposes described in this Privacy Policy, including order processing, customer support, legal, accounting, security, and regulatory requirements.</p>
      <p className="mb-6">When information is no longer required, it may be securely deleted or anonymized where appropriate.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Your Privacy Choices</h3>
      <p className="mb-4">Depending on applicable laws, you may have certain rights regarding your personal information, including requesting access, correction, or deletion of certain information.</p>
      <p className="mb-6">For privacy-related requests, please contact us through our official customer support channels.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Changes to This Privacy Policy</h3>
      <p className="mb-4">The Tusk and Trunk reserves the right to update or modify this Privacy Policy from time to time.</p>
      <p className="mb-6">Any changes will be published on this page and will become effective upon posting.</p>

      <h3 className="text-xl font-bold text-ink mt-8 mb-4">Contact Us</h3>
      <p className="mb-6">If you have any questions, concerns, or requests regarding this Privacy Policy, please contact the <strong>The Tusk and Trunk Customer Support Team</strong> through our official contact channels.</p>
      
      <p className="mb-6 font-medium text-sky">Thank you for trusting <strong>The Tusk and Trunk</strong>.</p>
    </PolicyLayout>
  )
}
