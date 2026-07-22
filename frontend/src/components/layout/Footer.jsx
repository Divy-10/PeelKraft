import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiArrowUp, FiInstagram, FiFacebook, FiTwitter, FiLinkedin, FiYoutube, FiShoppingCart } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { useState } from 'react';
import { newsletterApi } from '../../api';
import { toast } from 'react-toastify';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await newsletterApi.subscribe({ email });
      toast.success(res.message);
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    Company: [
      { name: 'About Us', path: '/about' },
      { name: 'Sustainability', path: '/sustainability' },
      { name: 'Contact', path: '/contact' },
    ],
    Products: [
      { name: 'All Products', path: '/products' },
      { name: 'Blog', path: '/blogs' },
      { name: 'FAQ', path: '/faq' },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms & Conditions', path: '/terms-conditions' },
    ],
  };

  const socialIcons = {
    facebook: FiFacebook,
    instagram: FiInstagram,
    twitter: FiTwitter,
    linkedin: FiLinkedin,
    youtube: FiYoutube,
  };

  return (
    <footer className="bg-white border-t border-gray-100 text-dark pt-16">

      {/* Newsletter Section */}
      <div className="border-b border-gray-100">
        <div className="container-custom pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-poppins font-bold text-dark mb-3"
            >
              Stay Connected
            </motion.h3>
            <p className="text-gray-500 mb-8 font-inter">
              Subscribe to get the latest updates on new products and health tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-dark placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors font-inter text-sm"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 text-center md:text-left flex flex-col items-center md:items-start">
            <Link to="/" className="inline-block mb-6 group">
              <img
                src="/images/logo.png"
                alt="PeelKraft"
                className="h-8 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </Link>
            <p className="text-gray-500 leading-relaxed mb-6 max-w-sm text-sm font-inter">
              Premium sustainable food products crafted from organic orange peels. By JuiceTap Global Pvt Ltd.
            </p>
            <div className="space-y-3 text-gray-500 text-sm font-inter flex flex-col items-center md:items-start">
              <a href={`mailto:${settings.email}`} className="flex items-center gap-3 hover:text-primary-500 transition-colors">
                <FiMail className="w-4 h-4 text-gray-400" /> {settings.email}
              </a>
              <a href={`tel:${settings.phone}`} className="flex items-center gap-3 hover:text-primary-500 transition-colors">
                <FiPhone className="w-4 h-4 text-gray-400" /> {settings.phone}
              </a>
              <p className="flex items-center gap-3 justify-center text-center">
                <FiMapPin className="w-4 h-4 text-gray-400 shrink-0" /> {settings.address}
              </p>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="text-center md:text-left">
              <h4 className="font-poppins font-semibold text-dark text-sm mb-6 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-500 hover:text-primary-500 transition-colors duration-300 text-sm font-inter"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-white">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm font-inter text-center md:text-left">
            {settings.footerText}
          </p>
          <div className="flex items-center gap-4">
            {settings.socialLinks?.instagram && (
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
            )}
            {settings.amazonStoreUrl && (
              <a
                href={settings.amazonStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-amazon text-xs py-2 px-4"
              >
                <FiShoppingCart className="w-3.5 h-3.5" />
                <span>Amazon Store</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-dark text-white shadow-md flex items-center justify-center hover:bg-black transition-all duration-300 z-40"
        aria-label="Back to top"
      >
        <FiArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
