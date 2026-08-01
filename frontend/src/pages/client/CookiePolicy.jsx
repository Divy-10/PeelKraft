import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { useCookies } from '../../context/CookieContext';

const CookiePolicy = () => {
  const { setShowSettings } = useCookies();

  return (
    <>
      <SEOHead title="Cookie Policy" description="Learn how PeelKraft uses cookies to optimize your browsing experience and how you can manage your settings." canonicalUrl="/cookie-policy" />
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-white">
        <div className="container-custom max-w-3xl font-inter">
          <Breadcrumbs items={[{ label: 'Cookie Policy' }]} />
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-8 mt-4">Cookie Policy</h1>
          <div className="prose-content space-y-6 text-gray-600">
            <p><strong>Last Updated:</strong> July 24, 2026</p>
            <p>
              This Cookie Policy explains how PeelKraft ("we," "us," or "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            
            <h2 className="text-xl font-poppins font-bold text-dark mt-6 mb-2">1. What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-6 mb-2">2. Why Do We Use Cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Channels.
            </p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-6 mb-2">3. Categories of Cookies We Use</h2>
            <div className="space-y-4">
              <div className="border border-gray-100 p-4 rounded-xl">
                <p className="font-bold text-dark">Essential Cookies</p>
                <p className="text-sm mt-1">These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas, shopping carts, and security controls.</p>
              </div>
              <div className="border border-gray-100 p-4 rounded-xl">
                <p className="font-bold text-dark">Analytics Cookies</p>
                <p className="text-sm mt-1">These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.</p>
              </div>
              <div className="border border-gray-100 p-4 rounded-xl">
                <p className="font-bold text-dark">Marketing Cookies</p>
                <p className="text-sm mt-1">These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.</p>
              </div>
              <div className="border border-gray-100 p-4 rounded-xl">
                <p className="font-bold text-dark">Preference Cookies</p>
                <p className="text-sm mt-1">These cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in.</p>
              </div>
            </div>

            <h2 className="text-xl font-poppins font-bold text-dark mt-6 mb-2">4. Managing Your Cookie Preferences</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can manage your preferences at any time by clicking the button below to open our Cookie settings panel:
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold font-poppins transition-all shadow-md shadow-primary-500/10"
            >
              Adjust Cookie Preferences
            </button>

            <h2 className="text-xl font-poppins font-bold text-dark mt-6 mb-2">5. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>

            <h2 className="text-xl font-poppins font-bold text-dark mt-6 mb-2">6. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please email us at info@peelkraft.com.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default CookiePolicy;
