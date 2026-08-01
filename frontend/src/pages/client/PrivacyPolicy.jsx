import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { useSettings } from '../../context/SettingsContext';

const PrivacyPolicy = () => {
  const { settings } = useSettings();

  return (
    <>
      <SEOHead title="Privacy Policy" description="PeelKraft's privacy policy. Learn how we collect, use, and protect your information." canonicalUrl="/privacy-policy" />
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-white">
        <div className="container-custom max-w-3xl font-inter">
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-8 mt-4">Privacy Policy</h1>
          <div className="prose-content space-y-6 text-gray-600">
            <p><strong>Last Updated:</strong> July 29, 2026</p>
            <p>PeelKraft ("we," "us," or "our"), operated by <strong>{settings.companyName || 'JuiceTap Global Pvt Ltd'}</strong>, is committed to protecting your privacy. This Privacy Policy outlines how we collect, process, disclose, and safeguard your personal information when you register an account, browse our product catalog, place orders, or perform financial transactions on our e-commerce platform.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">1. Information We Collect</h2>
            <p>We collect personal information directly from you to deliver a seamless shopping experience. This includes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Identification Data:</strong> Full name, email address, password hashes, and registration timestamps.</li>
              <li><strong>Transactional Information:</strong> Selected package options, purchase quantities, cart selections, and order history logs.</li>
              <li><strong>Fulfillment & Billing Details:</strong> Billing address, shipping address, recipient contact numbers, and specific delivery instructions.</li>
              <li><strong>Payment Status Metrics:</strong> Razorpay order IDs, payment transaction references, and payment status flags. We do NOT store full credit/debit card numbers or net banking credentials on our servers. All payments are processed securely by Razorpay.</li>
            </ul>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">2. How We Use Your Information</h2>
            <p>Your personal data is processed for the following enterprise-level operations:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To verify your identity, process registration requests, and secure authentication flows (JWT tokens).</li>
              <li>To manage your checkout transactions, calculate discounts/coupons, verify inventory stock, and process secure billing.</li>
              <li>To communicate shipping statuses, deliver transaction invoices, and send OTP (One-Time Password) emails via our Resend integration.</li>
              <li>To respond to customer support tickets and contact form inquiries.</li>
              <li>To customize content and send promotional emails or newsletters (subject to your opt-in preferences).</li>
            </ul>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">3. Data Sharing and Service Providers</h2>
            <p>We share necessary subsets of your information only with trusted third-party services essential for operating our platform:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Payment Processing:</strong> Razorpay Software Private Limited handles payment routing, status confirmation, and secure banking handshakes.</li>
              <li><strong>Communications & Alerts:</strong> Resend Email Service is used to securely dispatch system verification codes, transaction receipts, and customer service updates.</li>
              <li><strong>Shipping & Logistical Partners:</strong> Third-party courier networks access recipient names, delivery addresses, and phone numbers to fulfill orders.</li>
            </ul>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">4. Cookies and Analytical Tracking</h2>
            <p>We use essential cookies to manage your active cart items and secure user sessions. For detailed information on marketing pixels, preferences, and how to opt-out, please consult our <a href="/cookie-policy" className="text-primary-500 hover:underline">Cookie Policy</a>.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">5. Data Retention and Security</h2>
            <p>We implement enterprise-grade security protocols (HTTPS, cryptographically hashed passwords and OTPs, database firewalls) to protect your account and transactions. We retain your transactional records as required to comply with financial accounting laws and regulatory tax audits in India.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">6. Your Rights & Account Deletion</h2>
            <p>You have the right to view, update, or request the deletion of your account. You can request changes to your data by contacting us at the details below.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">7. Contact Information</h2>
            <p>For questions or requests concerning this Privacy Policy, please contact our Data Protection Officer at:</p>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-2">
              <p className="font-semibold text-dark">{settings.companyName || 'JuiceTap Global Pvt Ltd'}</p>
              <p className="text-sm mt-1">Email: <a href={`mailto:${settings.email || 'info@peelkraft.com'}`} className="text-primary-500 hover:underline">{settings.email || 'info@peelkraft.com'}</a></p>
              <p className="text-sm whitespace-pre-line mt-1">{settings.address || 'Corporate Office: Mumbai, Maharashtra, India'}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
