import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { useSettings } from '../../context/SettingsContext';

const TermsConditions = () => {
  const { settings } = useSettings();

  return (
    <>
      <SEOHead title="Terms & Conditions" description="Terms and conditions for using the PeelKraft website." canonicalUrl="/terms-conditions" />
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-white">
        <div className="container-custom max-w-3xl font-inter">
          <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-8 mt-4">Terms & Conditions</h1>
          <div className="prose-content space-y-6 text-gray-600">
            <p><strong>Last Updated:</strong> July 29, 2026</p>
            <p>Welcome to PeelKraft. These Terms & Conditions ("Terms") govern your access to and use of our website, user accounts, and direct e-commerce ordering platform operated by <strong>{settings.companyName || 'JuiceTap Global Pvt Ltd'}</strong>.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">1. Use of the Platform and Account Registration</h2>
            <p>By registering an account and using our services, you confirm that you are at least 18 years of age and legally competent to enter into binding contracts under Indian law. You are solely responsible for maintaining the confidentiality of your login credentials (username, password, OTP validation hashes) and for all actions performed under your account.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">2. E-commerce Purchases & Pricing</h2>
            <p>We sell high-quality, premium orange peel snacks and related items directly on this website. All prices listed are in Indian Rupees (INR) and are inclusive of GST unless specified otherwise. We reserve the right to modify prices, discontinue products, or adjust package variant options at any time without prior notice.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">3. Payments & Gateway Processing</h2>
            <p>All online payments are securely routed and processed through our integrated gateway partner, <strong>Razorpay</strong>. By selecting online payment, you agree to comply with Razorpay's terms and privacy rules. For Cash on Delivery (COD) orders, payment must be completed in cash directly to the delivery agent at the time of package delivery.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">4. Shipping & Delivery</h2>
            <p>Standard delivery typically takes <strong>3 to 5 business days</strong> from the order confirmation date. While we make every effort to meet delivery timelines, we are not liable for delayed transit caused by logistics partners, weather anomalies, or local administrative disruptions.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">5. Return, Cancellation & Refund Policy</h2>
            <p>Since PeelKraft snacks are perishable food items, we maintain a strict policy regarding returns and cancellations:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cancellations:</strong> You may cancel your order at any time before the shipment is dispatched. Once the package has been handed over to our shipping courier, cancellations cannot be processed.</li>
              <li><strong>Returns:</strong> Food items are non-returnable due to hygiene and safety regulations. However, if you receive a damaged, defective, or incorrect product, you may request a free replacement.</li>
              <li><strong>Refunds:</strong> In the event of confirmed transit damage, refund requests must be raised within 48 hours of delivery. Once verified, refunds are processed back to the original payment source (via Razorpay) within 5 to 7 business days.</li>
            </ul>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">6. Intellectual Property Protection</h2>
            <p>All proprietary assets, including logos, trade names ("PeelKraft"), text, product graphics, package designs, media layouts, and code structures, are owned by JuiceTap Global Pvt Ltd. Any unauthorized copying or reproduction is strictly prohibited.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">7. Limitation of Liability</h2>
            <p>JuiceTap Global Pvt Ltd and PeelKraft shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform, product usage, or delivery failures by third-party courier services.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">8. Governing Law & Dispute Resolution</h2>
            <p>These terms shall be governed by and interpreted in accordance with the laws of India. Any disputes arising from your use of this platform shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra, India.</p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-8 mb-3">9. Support Contact</h2>
            <p>For questions or assistance regarding our Terms & Conditions, please contact us at:</p>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-2 text-sm">
              <p><strong>{settings.companyName || 'JuiceTap Global Pvt Ltd'}</strong></p>
              <p>Email: <a href={`mailto:${settings.email || 'info@peelkraft.com'}`} className="text-primary-500 hover:underline">{settings.email || 'info@peelkraft.com'}</a></p>
              <p className="text-sm whitespace-pre-line mt-1">{settings.address || 'Corporate Office: Mumbai, Maharashtra, India'}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsConditions;
