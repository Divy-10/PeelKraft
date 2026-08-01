import { useState, useEffect } from 'react';
import { useCookies } from '../../context/CookieContext';
import { motion, AnimatePresence } from 'framer-motion';

const CookieBanner = () => {
  const { consent, acceptAll, rejectNonEssential, setShowSettings } = useCookies();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user hasn't made a choice yet, show the banner
    if (consent === null) {
      const timer = setTimeout(() => setIsVisible(true), 1500); // slight delay for better UX
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [consent]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] font-inter"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="container-custom max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h2 id="cookie-banner-title" className="text-lg font-poppins font-bold text-dark flex items-center justify-center lg:justify-start gap-2 mb-2">
                <span>🍪</span> We Value Your Privacy
              </h2>
              <p id="cookie-banner-desc" className="text-gray-500 text-sm leading-relaxed max-w-4xl">
                We use cookies to improve your browsing experience, remember your preferences, analyze website traffic, and enhance our services. You can choose which cookies to allow. Read our{' '}
                <a href="/cookie-policy" className="text-primary-500 hover:text-primary-600 font-semibold underline">
                  Cookie Policy
                </a>{' '}
                for details.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setShowSettings(true)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-dark text-sm font-semibold font-poppins transition-all bg-white hover:bg-gray-50"
              >
                Cookie Settings
              </button>
              <button
                onClick={rejectNonEssential}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-dark text-sm font-semibold font-poppins transition-all bg-white hover:bg-gray-50"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold font-poppins transition-all shadow-md shadow-primary-500/10 hover:scale-[1.02]"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
