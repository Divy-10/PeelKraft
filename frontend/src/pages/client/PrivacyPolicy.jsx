import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const PrivacyPolicy = () => (
  <>
    <SEOHead title="Privacy Policy" description="PeelKraft's privacy policy. Learn how we collect, use, and protect your information." canonicalUrl="/privacy-policy" />
    <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-white">
      <div className="container-custom max-w-3xl">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-8">Privacy Policy</h1>
        <div className="prose-content space-y-6 text-gray-600">
          <p><strong>Last Updated:</strong> January 1, 2024</p>
          <p>PeelKraft ("we," "us," or "our"), operated by JuiceTap Global Pvt Ltd, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
          <h2>1. Information We Collect</h2>
          <p>We may collect personal information that you voluntarily provide to us when you subscribe to our newsletter, fill out a contact form, or otherwise contact us. This information may include your name, email address, phone number, and any other information you choose to provide.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to: respond to your inquiries, send newsletters and marketing communications (with your consent), improve our website and services, monitor and analyze usage trends, and comply with legal obligations.</p>
          <h2>3. Cookies</h2>
          <p>We may use cookies and similar tracking technologies to track activity on our website and improve user experience. You can set your browser to refuse all or some cookies.</p>
          <h2>4. Third-Party Links</h2>
          <p>Our website contains links to third-party websites, including Amazon.in. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
          <h2>5. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. You may also unsubscribe from our newsletter at any time by clicking the unsubscribe link in any email.</p>
          <h2>7. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at info@peelkraft.com.</p>
        </div>
      </div>
    </section>
  </>
);

export default PrivacyPolicy;
