import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const TermsConditions = () => (
  <>
    <SEOHead title="Terms & Conditions" description="Terms and conditions for using the PeelKraft website." canonicalUrl="/terms-conditions" />
    <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-white">
      <div className="container-custom max-w-3xl">
        <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-8">Terms & Conditions</h1>
        <div className="prose-content space-y-6 text-gray-600">
          <p><strong>Last Updated:</strong> January 1, 2024</p>
          <p>Welcome to PeelKraft. By accessing and using our website, you accept and agree to be bound by the terms and provisions of this agreement.</p>
          <h2>1. Use of Website</h2>
          <p>This website is operated by JuiceTap Global Pvt Ltd. The content on this site is for general information purposes only. PeelKraft does not sell products directly through this website. All purchases are made through Amazon.in.</p>
          <h2>2. Product Purchases</h2>
          <p>When you click "Buy on Amazon" links on our website, you will be redirected to Amazon.in. All transactions, shipping, returns, and customer service for purchases are handled by Amazon. Please review Amazon's terms and conditions before making a purchase.</p>
          <h2>3. Intellectual Property</h2>
          <p>All content on this website, including text, images, logos, and graphics, is the property of JuiceTap Global Pvt Ltd and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.</p>
          <h2>4. Disclaimer</h2>
          <p>The information provided on this website is for general purposes only. While we strive to keep the information up to date and accurate, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the information.</p>
          <h2>5. Limitation of Liability</h2>
          <p>PeelKraft and JuiceTap Global Pvt Ltd shall not be liable for any indirect, incidental, or consequential damages arising out of or in connection with your use of this website.</p>
          <h2>6. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>
          <h2>7. Governing Law</h2>
          <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
          <h2>8. Contact</h2>
          <p>For questions about these Terms & Conditions, contact us at info@peelkraft.com.</p>
        </div>
      </div>
    </section>
  </>
);

export default TermsConditions;
